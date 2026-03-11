import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ children, className = '', isCollapsed = false }) => {
  return (
    <aside 
      className={`
        flex flex-col shrink-0 transition-all duration-300
        ${isCollapsed ? 'w-0 overflow-hidden border-none opacity-0' : 'w-64 opacity-100'}
        bg-white border-r border-gray-100 dark:bg-slate-900 dark:border-slate-800
        ${className}
      `}
    >
      {children}
    </aside>
  );
};

interface SidebarItemProps {
  icon: any;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
  iconClassName?: string;
  children?: React.ReactNode;
  activeClassName?: string;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  isActive, 
  onClick, 
  className = '', 
  iconClassName,
  children,
  activeClassName
}) => {
  // Default active style (Quran style)
  const defaultActive = 'bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-900/30 dark:text-emerald-400';
    
  // Default inactive style
  const defaultInactive = 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200';

  const activeClass = activeClassName || defaultActive;

  // Icon styles
  const defaultIconClass = isActive 
    ? 'text-emerald-600 dark:text-emerald-400' 
    : 'text-gray-400 dark:text-slate-500';
    
  const finalIconClass = iconClassName || defaultIconClass;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-start gap-4 px-4 py-3 rounded-xl transition-all text-sm font-khmer ${isActive ? activeClass : defaultInactive} ${className}`}
      title={label}
    >
      <HugeiconsIcon 
        icon={icon} 
        strokeWidth={1.5} 
        className={`w-6 h-6 shrink-0 ${finalIconClass}`} 
      />
      <span className="whitespace-nowrap">{children || label}</span>
    </button>
  );
};

export const SidebarSection: React.FC<{ children: React.ReactNode, title?: string, className?: string }> = ({ children, title, className = '' }) => {
  return (
    <div className={`border-t my-4 pt-4 px-4 border-gray-200 dark:border-slate-800 ${className}`}>
      {title && (
        <h3 className="font-bold text-xs uppercase mb-3 font-khmer text-gray-500 dark:text-slate-500">
          {title}
        </h3>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};
