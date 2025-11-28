
import React from 'react';
import { Home, FolderOpen, Palette, Users, Settings as SettingsIcon, FileText, Wallet } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  language: 'fa' | 'en';
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, language }) => {
  
  const menuItems = [
    { id: View.HOME, label: language === 'fa' ? 'خانه' : 'Home', icon: Home },
    { id: View.ARCHIVE, label: language === 'fa' ? 'آرشیو فایل' : 'Archive', icon: FolderOpen },
    { id: View.STYLES, label: language === 'fa' ? 'دایرةالمعارف' : 'Library', icon: Palette },
    { id: View.CHARACTERS, label: language === 'fa' ? 'اتاق فکر' : 'Character AI', icon: Users },
    { id: View.FINANCE, label: language === 'fa' ? 'امور مالی' : 'Finance', icon: Wallet },
    { id: View.RESUME, label: language === 'fa' ? 'رزومه من' : 'My Resume', icon: FileText },
    { id: View.SETTINGS, label: language === 'fa' ? 'تنظیمات' : 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-surface rtl:border-l ltr:border-r border-borderLight h-full flex flex-col py-6 transition-all duration-300 shadow-sm z-10">
      <div className="flex items-center justify-center lg:justify-start lg:px-6 mb-10 gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
          G
        </div>
        <span className="hidden lg:block font-bold text-xl text-textMain tracking-tight">Graphic Hub</span>
      </div>

      <nav className="flex-1 flex flex-col gap-2 px-3">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`
                flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'text-textLight hover:bg-bgLight hover:text-primary'
                }
              `}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-textLight group-hover:text-primary'}`} />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 lg:px-6 mt-auto">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-xl hidden lg:block border border-purple-100 dark:border-purple-900/50">
          <p className="text-xs text-primaryDark font-bold mb-1">
            {language === 'fa' ? 'نسخه حرفه‌ای' : 'Pro Version'}
          </p>
          <p className="text-xs text-textLight mb-2">
            {language === 'fa' ? 'دسترسی به تمام ابزارهای هوش مصنوعی' : 'Access all AI tools'}
          </p>
          <button className="text-xs bg-surface text-primary px-3 py-1 rounded-lg border border-primary/20 w-full hover:bg-primary hover:text-white transition-colors">
             {language === 'fa' ? 'ارتقا حساب' : 'Upgrade'}
          </button>
        </div>
      </div>
    </aside>
  );
};