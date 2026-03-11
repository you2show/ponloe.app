import { HugeiconsIcon } from '@hugeicons/react';
import { 
  UserIcon, 
  Settings01Icon, 
  Logout01Icon, 
  Message01Icon, 
  BookOpen01Icon, 
  LibraryIcon, 
  ArrowRight01Icon, 
  Edit02Icon, 
  Notification01Icon, 
  SecurityIcon, 
  HelpCircleIcon, 
  Cancel01Icon, 
  InformationCircleIcon, 
  FavouriteIcon, 
  Camera02Icon, 
  Image01Icon,
  TelegramIcon,
  Facebook01Icon,
  YoutubeIcon,
  TiktokIcon,
  InstagramIcon,
  Mail01Icon,
  Globe02Icon
} from '@hugeicons/core-free-icons';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase';
import { AuthModal } from '../auth/AuthModal';
import { EditProfileModal } from './EditProfileModal';
import { MyQuranView } from './MyQuranView';
import { SavedPostsView } from './SavedPostsView';
import { MyPostsView } from './MyPostsView';
import { useToast } from '@/contexts/ToastContext';

export const ProfileView: React.FC = () => {
  const { showToast } = useToast();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'posts' | 'quran' | 'library' | 'saved' | 'settings'>('posts');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isTelegramInfoOpen, setIsTelegramInfoOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAllSocials, setShowAllSocials] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [postCounts, setPostCounts] = useState({ articles: 0, videos: 0, books: 0, audio: 0 });
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchPostCounts();
      fetchFollowCounts();
    }
  }, [user]);

  const fetchFollowCounts = async () => {
    if (!user || !supabase) return;
    try {
      const [followersRes, followingRes] = await Promise.all([
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', user.id),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', user.id)
      ]);
      
      setFollowCounts({
        followers: followersRes.count || 0,
        following: followingRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  };

  const fetchPostCounts = async () => {
    if (!user || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('type, extra_data')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const counts = { articles: 0, videos: 0, books: 0, audio: 0 };
      data?.forEach(post => {
        const type = post.extra_data?.originalType || post.type;
        if (type === 'text' || type === 'article') counts.articles++;
        else if (type === 'video') counts.videos++;
        else if (type === 'book') counts.books++;
        else if (type === 'audio' || type === 'voice') counts.audio++;
      });
      setPostCounts(counts);
    } catch (error) {
      console.error('Error fetching post counts:', error);
    }
  };

  const isTelegramUser = user?.email?.startsWith('tg') && user?.email?.endsWith('@ponloe.com');
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const coverUrl = profile?.cover_url;
  const displayName = profile?.full_name || user?.user_metadata?.full_name;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      let file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${type}-${Math.random()}.${fileExt}`;

      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: type === 'avatar' ? 512 : 1920,
          useWebWorker: true
        };
        file = await imageCompression(file, options);
      } catch (error) {
        console.error('Error compressing image:', error);
      }

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [type === 'avatar' ? 'avatar_url' : 'cover_url']: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      await refreshProfile();
      showToast('បានផ្លាស់ប្តូរដោយជោគជ័យ!', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const socialLinks = [
    { id: 'fb', icon: Facebook01Icon, url: profile?.social_fb, color: 'text-blue-600', hover: 'hover:text-blue-700' },
    { id: 'tg', icon: TelegramIcon, url: profile?.social_telegram, color: 'text-blue-400', hover: 'hover:text-blue-500' },
    { id: 'yt', icon: YoutubeIcon, url: profile?.social_youtube, color: 'text-red-600', hover: 'hover:text-red-700' },
    { id: 'tt', icon: TiktokIcon, url: profile?.social_tiktok, color: theme === 'dark' ? 'text-white' : 'text-black', hover: 'opacity-80' },
    { id: 'ig', icon: InstagramIcon, url: profile?.social_instagram, color: 'text-pink-600', hover: 'hover:text-pink-700' },
    { id: 'gm', icon: Mail01Icon, url: profile?.social_gmail ? `mailto:${profile.social_gmail}` : null, color: 'text-red-500', hover: 'hover:text-red-600' },
    { id: 'ws', icon: Globe02Icon, url: profile?.social_website, color: 'text-emerald-600', hover: 'hover:text-emerald-700' },
  ].filter(link => link.url);

  const visibleSocials = showAllSocials ? socialLinks : socialLinks.slice(0, 3);
  const hiddenCount = socialLinks.length - 3;
  const hasSocialLinks = socialLinks.length > 0;

  return (
    <div className={`min-h-screen font-khmer transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-gray-900'
    }`}>
      {/* Cover Photo */}
      <div className={`relative h-48 md:h-64 overflow-hidden group ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-emerald-600'
      }`}>
        {coverUrl ? (
          <img 
            referrerPolicy="no-referrer" 
            src={coverUrl} 
            alt="Cover" 
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setPreviewImage(coverUrl)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-emerald-600 to-teal-500 opacity-50" />
        )}
        
        {user && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button 
              onClick={() => coverInputRef.current?.click()}
              className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold border border-white/20"
            >
              <HugeiconsIcon icon={Camera02Icon} strokeWidth={1.5} className="w-4 h-4" />
              {coverUrl ? t('profile.changeCover') : t('profile.viewCover')}
            </button>
            <input 
              type="file" 
              ref={coverInputRef} 
              onChange={(e) => handleImageUpload(e, 'cover')} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        )}
      </div>

      {/* Profile Info Card */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10 pb-10">
        <div className={`rounded-[2.5rem] shadow-xl p-6 md:p-8 mb-6 border transition-colors ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-slate-950/50' : 'bg-white border-white shadow-emerald-900/5'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative shrink-0 group">
              <div 
                className="w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-teal-400 cursor-pointer shadow-lg"
                onClick={() => avatarUrl && setPreviewImage(avatarUrl)}
              >
                <div className={`w-full h-full rounded-full border-4 overflow-hidden flex items-center justify-center ${
                  theme === 'dark' ? 'border-slate-900 bg-slate-800' : 'border-white bg-gray-100'
                }`}>
                  {avatarUrl ? (
                    <img referrerPolicy="no-referrer" src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="w-12 h-12 text-emerald-600" />
                  )}
                </div>
              </div>
              
              {user && (
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all border-2 border-white"
                >
                  <HugeiconsIcon icon={Camera02Icon} strokeWidth={1.5} className="w-4 h-4" />
                </button>
              )}
              
              {user && (
                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  onChange={(e) => handleImageUpload(e, 'avatar')} 
                  accept="image/*" 
                  className="hidden" 
                />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 flex flex-col translate-y-[7px]">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className={`text-2xl font-bold font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user ? displayName : t('profile.guestUser')}
                </h2>
                
                {profile?.username && (
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                    theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600'
                  }`}>
                    @{profile.username}
                  </span>
                )}

                {isTelegramUser && (
                  <button 
                    onClick={() => setIsTelegramInfoOpen(true)}
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                  >
                    <HugeiconsIcon icon={TelegramIcon} strokeWidth={1.5} className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {!isTelegramUser && user?.email && (
                <p className="text-gray-500 font-khmer text-sm mt-1">{user.email}</p>
              )}
              
              <div className="flex items-center gap-2 mt-1.5 text-sm font-khmer text-gray-600">
                <div className="flex items-center gap-1">
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{followCounts.followers}</span>
                  <span>{t('profile.followers')}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <div className="flex items-center gap-1">
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{followCounts.following}</span>
                  <span>{t('profile.following')}</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="shrink-0 flex flex-col items-end gap-3 mt-4 sm:mt-0">
              {!user ? (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  {t('profile.login')}
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditProfileOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2 font-bold rounded-xl text-sm transition-colors border ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <HugeiconsIcon icon={Edit02Icon} strokeWidth={1.5} className="w-4 h-4" />
                  {t('profile.edit')}
                </button>
              )}
            </div>
          </div>
          
          {profile?.bio && (
            <p className={`font-khmer text-sm mt-6 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-gray-700'}`}>
              {profile.bio}
            </p>
          )}

          {/* Social Links */}
          {hasSocialLinks && (
            <div className="flex flex-wrap gap-3 mt-4">
              {visibleSocials.map((social, index) => (
                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className={`${social.color} ${social.hover} transition-colors p-2 rounded-lg bg-gray-50/50 dark:bg-slate-800/50`}>
                  <HugeiconsIcon icon={social.icon} strokeWidth={1.5} className="w-5 h-5" />
                </a>
              ))}
              {!showAllSocials && hiddenCount > 0 && (
                <button 
                  onClick={() => setShowAllSocials(true)}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold transition-colors ${
                    theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  +{hiddenCount}
                </button>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div className={`grid grid-cols-4 gap-4 pt-8 mt-8 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}>
            {[
              { label: t('profile.articles'), count: postCounts.articles },
              { label: t('profile.videos'), count: postCounts.videos },
              { label: t('profile.books'), count: postCounts.books },
              { label: t('profile.audio'), count: postCounts.audio },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className={`font-bold text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stat.count}</div>
                <div className="text-[10px] text-gray-500 font-khmer mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b sticky top-0 z-10 pt-2 transition-colors ${
          theme === 'dark' ? 'bg-slate-950/80 backdrop-blur-md border-slate-800' : 'bg-slate-50/80 backdrop-blur-md border-gray-200'
        }`}>
          {[
            { id: 'posts', icon: Message01Icon, label: t('profile.myPost') },
            { id: 'saved', icon: FavouriteIcon, label: t('profile.saved') },
            { id: 'quran', icon: BookOpen01Icon, label: t('profile.myQuran') },
            { id: 'library', icon: LibraryIcon, label: t('profile.myLibrary') },
            { id: 'settings', icon: Settings01Icon, label: t('profile.settings') },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 pb-3 text-[11px] md:text-sm font-bold transition-all font-khmer flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 border-b-2 ${
                activeTab === tab.id 
                  ? 'border-emerald-600 text-emerald-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <HugeiconsIcon icon={tab.icon} strokeWidth={1.5} className="w-4 h-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'posts' && <MyPostsView />}

          {activeTab === 'saved' && <SavedPostsView />}

          {activeTab === 'quran' && <MyQuranView />}

          {activeTab === 'library' && (
            <div className={`text-center py-20 font-khmer rounded-[2.5rem] border ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-gray-100 text-gray-400'
            }`}>
              <HugeiconsIcon icon={LibraryIcon} strokeWidth={1.5} className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>{t('profile.noLibrary')}</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Language Selection */}
              <div className={`rounded-[2.5rem] border shadow-sm overflow-hidden ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
              }`}>
                 <div className={`px-8 py-4 border-b ${theme === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-gray-50/50 border-gray-100'}`}>
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-khmer">{t('profile.language')}</h3>
                 </div>
                 <div className="p-6 flex gap-3">
                    <button 
                      onClick={() => setLanguage('km')}
                      className={`flex-1 py-4 rounded-2xl text-sm font-khmer transition-all border ${
                        language === 'km' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' 
                          : (theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-gray-200 text-gray-600')
                      }`}
                    >
                      {t('profile.khmer')}
                    </button>
                    <button 
                      onClick={() => setLanguage('en')}
                      className={`flex-1 py-4 rounded-2xl text-sm font-khmer transition-all border ${
                        language === 'en' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' 
                          : (theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-gray-200 text-gray-600')
                      }`}
                    >
                      {t('profile.english')}
                    </button>
                 </div>
              </div>

              {/* Account Settings */}
              <div className={`rounded-[2.5rem] border shadow-sm overflow-hidden ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
              }`}>
                 <div className={`px-8 py-4 border-b ${theme === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-gray-50/50 border-gray-100'}`}>
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-khmer">{t('profile.accountSettings')}</h3>
                 </div>
                 <div className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-gray-100'}`}>
                    <button 
                      onClick={() => user ? setIsEditProfileOpen(true) : setIsAuthModalOpen(true)}
                      className="w-full px-8 py-5 flex items-center gap-4 hover:bg-emerald-50/10 transition-colors group"
                    >
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                         theme === 'dark' ? 'bg-slate-800 text-slate-400 group-hover:bg-slate-700' : 'bg-gray-50 text-gray-600 group-hover:bg-white group-hover:shadow-md'
                       }`}>
                          <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="w-6 h-6" />
                       </div>
                       <span className="flex-1 text-left font-bold text-sm font-khmer">{t('profile.editProfile')}</span>
                       <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="w-full px-8 py-5 flex items-center gap-4 hover:bg-emerald-50/10 transition-colors group">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                         theme === 'dark' ? 'bg-slate-800 text-slate-400 group-hover:bg-slate-700' : 'bg-gray-50 text-gray-600 group-hover:bg-white group-hover:shadow-md'
                       }`}>
                          <HugeiconsIcon icon={Notification01Icon} strokeWidth={1.5} className="w-6 h-6" />
                       </div>
                       <span className="flex-1 text-left font-bold text-sm font-khmer">{t('profile.notifications')}</span>
                       <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-400" />
                    </button>
                 </div>
              </div>

              {/* General Settings */}
              <div className={`rounded-[2.5rem] border shadow-sm overflow-hidden ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
              }`}>
                 <div className={`px-8 py-4 border-b ${theme === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-gray-50/50 border-gray-100'}`}>
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-khmer">{t('profile.others')}</h3>
                 </div>
                 <div className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-gray-100'}`}>
                    <button className="w-full px-8 py-5 flex items-center gap-4 hover:bg-emerald-50/10 transition-colors group">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                         theme === 'dark' ? 'bg-slate-800 text-slate-400 group-hover:bg-slate-700' : 'bg-gray-50 text-gray-600 group-hover:bg-white group-hover:shadow-md'
                       }`}>
                          <HugeiconsIcon icon={SecurityIcon} strokeWidth={1.5} className="w-6 h-6" />
                       </div>
                       <span className="flex-1 text-left font-bold text-sm font-khmer">{t('profile.privacySecurity')}</span>
                       <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="w-full px-8 py-5 flex items-center gap-4 hover:bg-emerald-50/10 transition-colors group">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                         theme === 'dark' ? 'bg-slate-800 text-slate-400 group-hover:bg-slate-700' : 'bg-gray-50 text-gray-600 group-hover:bg-white group-hover:shadow-md'
                       }`}>
                          <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={1.5} className="w-6 h-6" />
                       </div>
                       <span className="flex-1 text-left font-bold text-sm font-khmer">{t('profile.helpSupport')}</span>
                       <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-400" />
                    </button>
                 </div>
              </div>

              {/* Logout */}
              {user && (
                <button 
                  onClick={() => signOut()}
                  className="w-full py-5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-sm"
                >
                   <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.5} className="w-6 h-6" /> 
                   {t('profile.logout')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setPreviewImage(null)}>
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-3 bg-white/10 rounded-full transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6" />
          </button>
          <img 
            referrerPolicy="no-referrer" 
            src={previewImage} 
            alt="Preview" 
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Telegram Info Modal */}
      {isTelegramInfoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className={`rounded-3xl max-w-sm w-full p-8 shadow-2xl relative ${
            theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'
          }`}>
            <button 
              onClick={() => setIsTelegramInfoOpen(false)}
              className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-400'
              }`}
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl">
                <HugeiconsIcon icon={TelegramIcon} strokeWidth={1.5} className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-khmer">{t('telegram.title')}</h3>
            </div>
            
            <div className="space-y-4 text-sm opacity-80 font-khmer leading-relaxed">
              <p>{t('telegram.desc1')}</p>
              <p>{t('telegram.desc2')}</p>
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex gap-3">
                <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={1.5} className="w-5 h-5 shrink-0" />
                <p>{t('telegram.info')}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsTelegramInfoOpen(false)}
              className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 font-khmer"
            >
              {t('telegram.ok')}
            </button>
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
};
