import { HugeiconsIcon } from '@hugeicons/react';
import { Film01Icon, Home01Icon, Store01Icon, Download01Icon, SmartPhone01Icon, Cancel01Icon, Tick01Icon, UserMultiple02Icon, UserIcon, MessageMultiple01Icon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarItem, SidebarSection } from '../../ui/sidebar/Sidebar';

export const LeftSidebar: React.FC<{ activeTab: string, setActiveTab: (t: any) => void }> = ({ activeTab, setActiveTab }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPWAModal, setShowPWAModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const menuItems = [
    { id: 'feed', label: 'ទំព័រដើម', icon: Home01Icon, color: 'text-blue-500' },
    { id: 'watch', label: 'ទស្សនា', icon: Film01Icon, color: 'text-pink-500' },
    { id: 'ustaz', label: 'Ustaz', icon: UserMultiple02Icon, color: 'text-emerald-500' },
    { id: 'market', label: 'ផ្សារហាឡាល់', icon: Store01Icon, color: 'text-emerald-600' },
    { id: 'chat', label: 'សារ', icon: MessageMultiple01Icon, color: 'text-blue-600' },
    { id: 'profile', label: 'គណនី', icon: UserIcon, color: 'text-purple-500' },
  ];

  useEffect(() => {
    // Capture the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setShowPWAModal(false);
    }
  };

  const pwaFeatures = [
    'ប្រើប្រាស់ offline បាន',
    'ទទួលការជូនដំណឹង',
    'បើកលឿនជាង browser',
    'មើលទៅដូច app ពិតប្រាកដ',
  ];

  return (
    <Sidebar className="hidden lg:block sticky top-[53px] h-[calc(100vh-53px)] overflow-y-auto space-y-2 p-2 no-scrollbar">
      {menuItems.map(item => (
        <SidebarItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          isActive={activeTab === item.id}
          onClick={() => setActiveTab(item.id)}
          iconClassName={activeTab === item.id ? undefined : item.color}
        />
      ))}
       
      {/* PWA Install Button */}
      {!isInstalled && (
        <div className="border-t border-gray-200 dark:border-slate-800 my-4 pt-4">
          <button 
            onClick={() => setShowPWAModal(true)}
            className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-khmer text-sm font-bold shadow-sm"
            title="ដំឡើង App"
          >
            <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-5 h-5 shrink-0" />
            <span>ដំឡើង App</span>
          </button>
        </div>
      )}

      {/* PWA Install Modal */}
      {showPWAModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <HugeiconsIcon icon={SmartPhone01Icon} strokeWidth={1.5} className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-khmer">Ponloe App</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">ponloe.org</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPWAModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-400 dark:text-slate-500" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-slate-300 mb-4 font-khmer leading-relaxed">
              ដំឡើង Ponloe ជា App នៅលើឧបករណ៍របស់អ្នក ដើម្បីទទួលបានបទពិសោធន៍ល្អបំផុត។
            </p>

            {/* Features */}
            <div className="space-y-2 mb-6">
              {pwaFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-slate-300 font-khmer">{feature}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPWAModal(false)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors font-khmer"
              >
                ពេលក្រោយ
              </button>
              {deferredPrompt ? (
                <button 
                  onClick={handleInstall}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 font-khmer"
                >
                  <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-4 h-4" />
                  ដំឡើង
                </button>
              ) : (
                <div className="flex-1 py-2.5 bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-xl font-bold text-sm text-center font-khmer">
                  មិនអាចដំឡើង
                </div>
              )}
            </div>

            {!deferredPrompt && (
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-3 text-center font-khmer">
                សម្រាប់ iOS: ចុច Share &gt; Add to Home Screen នៅក្នុង Safari
              </p>
            )}
          </div>
        </div>
      )}
    </Sidebar>
  );
};
