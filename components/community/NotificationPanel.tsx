import { HugeiconsIcon } from '@hugeicons/react';
import { Notification01Icon, ThumbsUpIcon, Comment01Icon, UserIcon, Cancel01Icon, Tick01Icon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'mention' | 'follow' | 'system';
  is_read: boolean;
  created_at: string;
  post_id: string | null;
  actor: {
    id: string;
    full_name: string;
    avatar_url: string;
  } | null;
}

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Set up real-time subscription
      const channel = supabase?.channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchNotifications();
        })
        .subscribe();

      return () => {
        channel?.unsubscribe();
      };
    }
  }, [user]);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!supabase || !user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          type,
          is_read,
          created_at,
          post_id,
          actor:actor_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (data) {
        const formatted = data.map((n: any) => ({
          ...n,
          actor: n.actor ? {
            id: n.actor.id,
            full_name: n.actor.full_name,
            avatar_url: n.actor.avatar_url
          } : null
        }));
        setNotifications(formatted);
        setUnreadCount(formatted.filter((n: any) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!supabase || !user) return;
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const getNotificationText = (notification: Notification) => {
    const actorName = notification.actor?.full_name || 'នរណាម្នាក់';
    switch (notification.type) {
      case 'like': return `${actorName} បានចូលចិត្តការបង្ហោះរបស់អ្នក`;
      case 'comment': return `${actorName} បានផ្តល់មតិលើការបង្ហោះរបស់អ្នក`;
      case 'mention': return `${actorName} បានលើកឈ្មោះអ្នក`;
      case 'follow': return `${actorName} បានតាមដានអ្នក`;
      case 'system': return 'សារពីប្រព័ន្ធ';
      default: return 'សកម្មភាពថ្មី';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <div className="bg-blue-500 p-1 rounded-full"><HugeiconsIcon icon={ThumbsUpIcon} strokeWidth={1.5} className="w-3 h-3 text-white" /></div>;
      case 'comment': return <div className="bg-emerald-500 p-1 rounded-full"><HugeiconsIcon icon={Comment01Icon} strokeWidth={1.5} className="w-3 h-3 text-white" /></div>;
      case 'follow': return <div className="bg-purple-500 p-1 rounded-full"><HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="w-3 h-3 text-white" /></div>;
      default: return <div className="bg-gray-500 p-1 rounded-full"><HugeiconsIcon icon={Notification01Icon} strokeWidth={1.5} className="w-3 h-3 text-white" /></div>;
    }
  };

  const formatTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'អម្បាញ់មិញ';
    if (diffMins < 60) return `${diffMins}ន`;
    if (diffHours < 24) return `${diffHours}ម`;
    if (diffDays < 7) return `${diffDays}ថ`;
    return date.toLocaleDateString('km-KH');
  };

  if (!user) {
    return (
      <div className="relative" ref={panelRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border relative active:scale-95 transition-transform ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HugeiconsIcon icon={Notification01Icon} strokeWidth={1.5} className="w-5 h-5" />
        </button>
        {isOpen && (
          <div className={`absolute right-0 top-12 w-80 sm:w-96 rounded-xl shadow-xl border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
            <div className={`px-4 py-3 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-slate-800' : 'border-gray-100'
            }`}>
              <h3 className={`font-bold font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>ការជូនដំណឹង</h3>
              <button onClick={() => setIsOpen(false)} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </div>
            <div className="p-8 text-center">
              <HugeiconsIcon icon={Notification01Icon} strokeWidth={1.5} className={`w-10 h-10 mx-auto mb-2 ${theme === 'dark' ? 'text-slate-700' : 'text-gray-200'}`} />
              <p className={`text-sm font-khmer ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>សូមចូលគណនីដើម្បីមើលការជូនដំណឹង</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            markAllAsRead();
          }
        }}
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border relative active:scale-95 transition-transform ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
        }`}
      >
        <HugeiconsIcon icon={Notification01Icon} strokeWidth={1.5} className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className={`absolute right-0 top-12 w-80 sm:w-96 rounded-xl shadow-xl border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className={`px-4 py-3 border-b flex items-center justify-between ${
            theme === 'dark' ? 'border-slate-800' : 'border-gray-100'
          }`}>
            <h3 className={`font-bold font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>ការជូនដំណឹង</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-emerald-600 font-bold hover:text-emerald-700"
                >
                  <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-4 h-4 inline mr-1" />
                  អានទាំងអស់
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className={`p-8 text-center text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>កំពុងផ្ទុក...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <HugeiconsIcon icon={Notification01Icon} strokeWidth={1.5} className={`w-10 h-10 mx-auto mb-2 ${theme === 'dark' ? 'text-slate-700' : 'text-gray-200'}`} />
                <p className={`text-sm font-khmer ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>មិនមានការជូនដំណឹងថ្មី</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer border-b ${
                    theme === 'dark' 
                      ? 'border-slate-800 hover:bg-slate-800' 
                      : 'border-gray-50 hover:bg-gray-50'
                  } ${
                    !notification.is_read 
                      ? (theme === 'dark' ? 'bg-slate-800/50' : 'bg-blue-50/50') 
                      : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={notification.actor?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=random'}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-khmer leading-snug ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                      {getNotificationText(notification)}
                    </p>
                    <span className={`text-xs mt-0.5 block ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>{formatTime(notification.created_at)}</span>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 mt-2"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
