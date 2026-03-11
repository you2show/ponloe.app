import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserIcon, Loading02Icon, Mail01Icon, CallIcon, PencilEdit01Icon, Facebook01Icon, TelegramIcon, YoutubeIcon, TiktokIcon, InstagramIcon, Moon01Icon, Sun01Icon } from '@hugeicons/core-free-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ThemeToggle } from '../ui/ThemeToggle';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile } = useAuth();
  const { theme } = useTheme();
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Social Links
  const [socialFb, setSocialFb] = useState('');
  const [socialTelegram, setSocialTelegram] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');
  const [socialTiktok, setSocialTiktok] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialGmail, setSocialGmail] = useState('');
  const [socialWebsite, setSocialWebsite] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile && isOpen) {
      setFullName(profile.full_name || user.user_metadata?.full_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setEmail(user.email || '');
      setPhone(profile.phone || '');
      
      setSocialFb(profile.social_fb || '');
      setSocialTelegram(profile.social_telegram || '');
      setSocialYoutube(profile.social_youtube || '');
      setSocialTiktok(profile.social_tiktok || '');
      setSocialInstagram(profile.social_instagram || '');
      setSocialGmail(profile.social_gmail || '');
      setSocialWebsite(profile.social_website || '');
      
      setError(null);
      setSuccess(null);
    }
  }, [user, profile, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update Auth User
      const authUpdates: any = {
        data: { 
          full_name: fullName,
        }
      };
      
      if (email !== user.email) {
        authUpdates.email = email;
      }

      const { error: authError } = await supabase.auth.updateUser(authUpdates);
      if (authError) throw authError;

      // Update Profiles Table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
          bio: bio,
          phone: phone,
          social_fb: socialFb,
          social_telegram: socialTelegram,
          social_youtube: socialYoutube,
          social_tiktok: socialTiktok,
          social_instagram: socialInstagram,
          social_gmail: socialGmail,
          social_website: socialWebsite,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setSuccess('ព័ត៌មានត្រូវបានកែប្រែដោយជោគជ័យ!');
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
      
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message || 'មានបញ្ហាក្នុងការកែប្រែព័ត៌មាន');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="កែប្រែព័ត៌មាន" size="md">
      <div className="flex flex-col h-full max-h-[80vh]">
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-grow custom-scrollbar -mx-4 px-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm mb-4 border border-emerald-100">
              {success}
            </div>
          )}

          {/* Theme Toggle Section */}
          <div className="p-4 rounded-2xl mb-6 flex items-center justify-between bg-gray-50 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 text-amber-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                <HugeiconsIcon icon={theme === 'dark' ? Moon01Icon : Sun01Icon} strokeWidth={1.5} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">របៀបប្រើប្រាស់ (Theme)</p>
                <p className="text-xs opacity-60">{theme === 'dark' ? 'មុខងារងងឹត' : 'មុខងារពន្លឺ'}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="ឈ្មោះបង្ហាញ (Display Name)"
              placeholder="បញ្ចូលឈ្មោះរបស់អ្នក"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              leftIcon={<HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="w-5 h-5" />}
            />

            <Input
              label="ឈ្មោះគណនី (Username)"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              leftIcon={<span className="font-bold">@</span>}
            />

            <div>
              <label className="block text-sm font-bold mb-1 opacity-70 text-gray-700 dark:text-slate-300">ជីវប្រវត្តិសង្ខេប (Bio)</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                  <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={1.5} className="w-5 h-5" />
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-all resize-none text-sm font-khmer bg-white border-gray-200 text-gray-900 focus:border-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:border-emerald-500"
                  placeholder="ប្រាប់ពីខ្លួនអ្នកបន្តិច..."
                  rows={3}
                />
              </div>
            </div>

            <Input
              label="អ៊ីមែល (Email)"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<HugeiconsIcon icon={Mail01Icon} strokeWidth={1.5} className="w-5 h-5" />}
            />

            <Input
              label="លេខទូរស័ព្ទ (Phone)"
              type="tel"
              placeholder="012 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<HugeiconsIcon icon={CallIcon} strokeWidth={1.5} className="w-5 h-5" />}
            />

            <hr className="my-6 border-gray-100 dark:border-slate-800" />
            <h3 className="font-bold mb-4">បណ្ដាញសង្គម (Social Links)</h3>

            <div className="space-y-3">
              {[
                { icon: Facebook01Icon, value: socialFb, setter: setSocialFb, color: 'text-blue-600', placeholder: 'Facebook Link' },
                { icon: TelegramIcon, value: socialTelegram, setter: setSocialTelegram, color: 'text-blue-400', placeholder: 'Telegram Link' },
                { icon: YoutubeIcon, value: socialYoutube, setter: setSocialYoutube, color: 'text-red-600', placeholder: 'YouTube Link' },
                { icon: TiktokIcon, value: socialTiktok, setter: setSocialTiktok, color: 'text-black dark:text-white', placeholder: 'TikTok Link' },
                { icon: InstagramIcon, value: socialInstagram, setter: setSocialInstagram, color: 'text-pink-600', placeholder: 'Instagram Link' },
              ].map((social, i) => (
                <Input
                  key={i}
                  type="url"
                  placeholder={social.placeholder}
                  value={social.value}
                  onChange={(e) => social.setter(e.target.value)}
                  leftIcon={<HugeiconsIcon icon={social.icon} strokeWidth={1.5} className={`w-5 h-5 ${social.color}`} />}
                />
              ))}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="pt-6 mt-4 border-t shrink-0 flex gap-3 border-gray-100 dark:border-slate-800">
          <Button 
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            បោះបង់
          </Button>
          <Button 
            variant="primary"
            onClick={handleSubmit as any}
            isLoading={loading}
            className="flex-[2]"
          >
            រក្សាទុកការផ្លាស់ប្តូរ
          </Button>
        </div>
      </div>
    </Modal>
  );
};
