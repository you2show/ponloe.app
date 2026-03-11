import { HugeiconsIcon } from '@hugeicons/react';
import { BookOpen01Icon, Bookmark01Icon, Brain01Icon, CloudDownloadIcon, Download01Icon, Edit02Icon, Maximize01Icon, Menu01Icon, Mic02Icon, PanelLeftCloseIcon } from '@hugeicons/core-free-icons';

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sidebar, SidebarItem } from '../ui/sidebar/Sidebar';

interface QuranSidebarProps {
  activeTab: 'surahs' | 'bookmarks' | 'notes' | 'hifz' | 'offline' | 'reciters';
  onTabChange: (tab: 'surahs' | 'bookmarks' | 'notes' | 'hifz' | 'offline' | 'reciters') => void;
  onImmerseClick: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const QuranSidebar: React.FC<QuranSidebarProps> = ({ activeTab, onTabChange, onImmerseClick, isCollapsed, onToggleCollapse }) => {
  const { theme } = useTheme();
  const menuItems = [
    { id: 'surahs', label: 'បញ្ជីស៊ូរ៉ះ', icon: BookOpen01Icon },
    { id: 'reciters', label: 'អ្នកសូត្រ', icon: Mic02Icon },
    { id: 'hifz', label: 'ជំនួយការទន្ទេញ', icon: Brain01Icon },
    { id: 'bookmarks', label: 'ចំណាំ', icon: Bookmark01Icon },
    { id: 'notes', label: 'កំណត់ហេតុ', icon: Edit02Icon },
    { id: 'offline', label: 'អានគ្មានអ៊ីនធឺណិត', icon: Download01Icon },
  ];

  return (
    <Sidebar isCollapsed={isCollapsed} className="h-full py-4 z-20">
        <div className="flex-1 px-3 space-y-2 min-w-[16rem]">
          {menuItems.map(item => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeTab === item.id}
              onClick={() => onTabChange(item.id as any)}
            />
          ))}
        </div>

        <div className="px-3 mt-auto min-w-[16rem]">
            <SidebarItem
                icon={Maximize01Icon}
                label="អានពេញអេក្រង់"
                onClick={onImmerseClick}
            />
        </div>
    </Sidebar>
  );
};
