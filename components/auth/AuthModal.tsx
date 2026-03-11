import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Mail01Icon, LockPasswordIcon, Loading02Icon, ArrowRight01Icon, SentIcon } from '@hugeicons/core-free-icons';
import { supabase } from '@/lib/supabase';
import { getTelegramUpdates, sendTelegramMessage } from '@/lib/telegram';

import { useLanguage } from '@/contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMethod = 'select' | 'email' | 'telegram';
type TgStep = 'waiting_bot' | 'enter_code';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [authMethod, setAuthMethod] = useState<AuthMethod>('select');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Telegram Auth State
  const [tgSessionId, setTgSessionId] = useState('');
  const [tgStep, setTgStep] = useState<TgStep>('waiting_bot');
  const [tgOtp, setTgOtp] = useState('');
  const [tgChatId, setTgChatId] = useState<number | null>(null);
  const [tgUsername, setTgUsername] = useState<string | null>(null);
  const [userEnteredOtp, setUserEnteredOtp] = useState('');

  // Generate a random session ID when modal opens or switches to telegram
  useEffect(() => {
    if (isOpen && authMethod === 'telegram' && !tgSessionId) {
      setTgSessionId(Math.random().toString(36).substring(2, 8).toUpperCase());
      setTgStep('waiting_bot');
      setUserEnteredOtp('');
      setError(null);
    }
  }, [isOpen, authMethod]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAuthMethod('select');
      setTgSessionId('');
      setTgChatId(null);
      setTgOtp('');
      setError(null);
      setMessage(null);
    }
  }, [isOpen]);

  // Poll Telegram for updates
  useEffect(() => {
    let isMounted = true;
    let lastUpdateId = 0;
    let timeoutId: any;
    let isPolling = false;

    const poll = async () => {
      if (!isMounted || authMethod !== 'telegram' || tgStep !== 'waiting_bot' || !tgSessionId) return;
      if (isPolling) return;
      
      isPolling = true;
      try {
        // Use lastUpdateId + 1 to acknowledge previous updates and avoid getting them again
        const offset = lastUpdateId === 0 ? undefined : lastUpdateId + 1;
        const data = await getTelegramUpdates(offset);
        
        if (data?.ok && data.result?.length > 0) {
          for (const update of data.result) {
            if (update.update_id > lastUpdateId) {
              lastUpdateId = update.update_id;
            }
            
            // Check if user sent /start with our session ID
            if (update.message && update.message.text === `/start ${tgSessionId}`) {
              const chatId = update.message.chat.id;
              const name = update.message.from.first_name || 'អ្នកប្រើប្រាស់';
              
              // Generate 6-digit OTP
              const otp = Math.floor(100000 + Math.random() * 900000).toString();
              
              setTgChatId(chatId);
              setTgUsername(name);
              setTgOtp(otp);
              setTgStep('enter_code');

              // Send OTP to user via bot
              await sendTelegramMessage(
                chatId, 
                `សួស្តី <b>${name}</b>! 👋\n\nលេខកូដផ្ទៀងផ្ទាត់របស់អ្នកគឺ: <b>${otp}</b>\n\nសូមយកលេខកូដនេះទៅបំពេញក្នុងកម្មវិធី Ponloe ដើម្បីចូលគណនី។`
              );
              isPolling = false;
              return; // Stop polling once we get the code
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
      
      isPolling = false;
      if (isMounted && authMethod === 'telegram' && tgStep === 'waiting_bot') {
        // Wait 1 second before next poll to avoid spamming if long polling fails
        timeoutId = setTimeout(poll, 1000);
      }
    };

    if (isOpen && authMethod === 'telegram' && tgStep === 'waiting_bot') {
      poll();
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isOpen, authMethod, tgStep, tgSessionId]);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase client is not initialized.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage(t('auth.checkEmail'));
      }
    } catch (err: any) {
      setError(err.message || t('auth.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userEnteredOtp !== tgOtp || !tgChatId) {
      setError(t('auth.invalidCode'));
      return;
    }

    if (!supabase) {
      setError('Supabase client is not initialized.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a deterministic email and password for this Telegram user
      // Ensure the email is valid (no negative signs or invalid characters)
      const safeChatId = Math.abs(tgChatId).toString().trim();
      const tgEmail = `tg${safeChatId}@ponloe.com`;
      const tgPassword = `TgAuth_${safeChatId}_Secure123!`;

      // Try to login first
      let { data, error } = await supabase.auth.signInWithPassword({ 
        email: tgEmail, 
        password: tgPassword 
      });

      // If user doesn't exist, sign them up
      if (error && error.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
          email: tgEmail, 
          password: tgPassword,
          options: {
            data: { full_name: tgUsername, telegram_id: tgChatId }
          }
        });
        if (signUpError) throw signUpError;
        data = signUpData;
      } else if (error) {
        throw error;
      }

      // Send success message
      await sendTelegramMessage(tgChatId, t('auth.telegramSuccess'));
      onClose();
    } catch (err: any) {
      setError(err.message || t('auth.telegramError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-khmer">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
        >
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.loginTitle')}
            </h2>
            <p className="text-gray-500 text-sm">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm mb-4 border border-emerald-100">
              {message}
            </div>
          )}

          {/* METHOD SELECTION */}
          {authMethod === 'select' && (
            <div className="space-y-4">
              <button
                onClick={() => setAuthMethod('telegram')}
                className="w-full bg-[#2AABEE] text-white font-bold py-4 px-6 rounded-2xl hover:bg-[#229ED9] transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <HugeiconsIcon icon={SentIcon} strokeWidth={2} className="w-5 h-5" />
                  </div>
                  <span className="text-lg">{t('auth.telegram')}</span>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    
                    // Use APP_URL if available (for AI Studio preview), otherwise fallback to window.location.origin
                    // @ts-ignore - Vite env variables
                    const redirectUrl = (import.meta as any).env?.VITE_APP_URL || window.location.origin;
                    
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: redirectUrl
                      }
                    });
                    if (error) throw error;
                  } catch (err: any) {
                    setError(err.message || t('auth.googleError'));
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full bg-white text-gray-700 font-bold py-4 px-6 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-between group shadow-sm hover:shadow-md disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-full flex items-center justify-center w-9 h-9">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      <path d="M1 1h22v22H1z" fill="none"/>
                    </svg>
                  </div>
                  <span className="text-lg">{t('auth.google')}</span>
                </div>
                {loading ? (
                  <HugeiconsIcon icon={Loading02Icon} strokeWidth={2} className="w-5 h-5 animate-spin" />
                ) : (
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">{t('auth.or')}</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button
                onClick={() => setAuthMethod('email')}
                className="w-full bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gray-200 p-2 rounded-full text-gray-500">
                    <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="w-5 h-5" />
                  </div>
                  <span className="text-lg">{t('auth.email')}</span>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* TELEGRAM AUTH FLOW */}
          {authMethod === 'telegram' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              {tgStep === 'waiting_bot' ? (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-[#2AABEE]/10 rounded-full flex items-center justify-center mx-auto">
                    <HugeiconsIcon icon={SentIcon} strokeWidth={1.5} className="w-10 h-10 text-[#2AABEE]" />
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{t('auth.telegramOpen')}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {t('auth.telegramDesc')}
                    </p>
                  </div>

                  <a 
                    href={`https://t.me/PonloeBot?start=${tgSessionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#2AABEE] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#229ED9] transition-colors flex items-center justify-center gap-2"
                  >
                    <HugeiconsIcon icon={SentIcon} strokeWidth={1.5} className="w-5 h-5" /> {t('auth.openTelegram')}
                  </a>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-4">
                    <HugeiconsIcon icon={Loading02Icon} strokeWidth={2} className="w-4 h-4 animate-spin" />
                    {t('auth.waitingStart')}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleTelegramVerify} className="space-y-6 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HugeiconsIcon icon={LockPasswordIcon} strokeWidth={1.5} className="w-8 h-8 text-emerald-600" />
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{t('auth.enterCode')}</h3>
                    <p className="text-gray-500 text-sm">
                      {t('auth.codeSent')}
                    </p>
                  </div>

                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={userEnteredOtp}
                    onChange={(e) => setUserEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-3xl tracking-[0.5em] font-mono py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2AABEE] focus:border-[#2AABEE] outline-none transition-all"
                    placeholder="••••••"
                  />

                  <button
                    type="submit"
                    disabled={loading || userEnteredOtp.length !== 6}
                    className="w-full bg-[#2AABEE] text-white font-bold py-3 rounded-xl hover:bg-[#229ED9] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-5 h-5 animate-spin" />
                    ) : (
                      t('auth.verifyLogin')
                    )}
                  </button>
                </form>
              )}

              <button
                onClick={() => setAuthMethod('select')}
                className="w-full text-gray-500 font-bold text-sm hover:text-gray-700 mt-6"
              >
                {t('auth.back')}
              </button>
            </div>
          )}

          {/* EMAIL AUTH FLOW */}
          {authMethod === 'email' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('auth.emailLabel')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <HugeiconsIcon icon={Mail01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('auth.passwordLabel')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <HugeiconsIcon icon={LockPasswordIcon} strokeWidth={1.5} className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
                >
                  {loading ? (
                    <HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-5 h-5 animate-spin" />
                  ) : (
                    isLogin ? t('auth.loginButton') : t('auth.signupButton')
                  )}
                </button>
              </form>

              <div className="mt-6 text-center space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-emerald-600 font-bold text-sm hover:underline block w-full"
                >
                  {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
                </button>
                <button
                  onClick={() => setAuthMethod('select')}
                  className="text-gray-500 font-bold text-sm hover:text-gray-700 block w-full"
                >
                  {t('auth.back')}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
