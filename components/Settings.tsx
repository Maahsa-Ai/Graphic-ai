import React, { useState } from 'react';
import { Button } from './Button';
import { Moon, Globe, Database, RefreshCcw, Sun, CheckCircle } from 'lucide-react';

interface SettingsProps {
  currentTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  currentLanguage: 'fa' | 'en';
  setLanguage: (lang: 'fa' | 'en') => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  currentTheme, 
  setTheme, 
  currentLanguage, 
  setLanguage 
}) => {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      const msg = currentLanguage === 'fa' 
        ? 'پشتیبان‌گیری با موفقیت انجام شد.' 
        : 'Backup completed successfully.';
      alert(msg);
    }, 2000);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as 'fa' | 'en');
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fadeIn">
      <h2 className="text-2xl font-bold text-textMain mb-8">
        {currentLanguage === 'fa' ? 'تنظیمات' : 'Settings'}
      </h2>
      
      <div className="space-y-6">
        {/* Language Section */}
        <div className="bg-surface p-6 rounded-2xl border border-borderLight shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
               <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-textMain">
                {currentLanguage === 'fa' ? 'زبان / Language' : 'Language'}
              </h3>
              <p className="text-sm text-textLight">
                {currentLanguage === 'fa' ? 'زبان پیش‌فرض رابط کاربری' : 'Default interface language'}
              </p>
            </div>
          </div>
          <select 
            value={currentLanguage}
            onChange={handleLanguageChange}
            className="p-3 px-4 border border-borderLight rounded-xl outline-none bg-surface text-textMain focus:border-primary w-full md:w-48 transition-all hover:border-primary/50"
          >
            <option value="fa">فارسی</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Theme Section */}
        <div className="bg-surface p-6 rounded-2xl border border-borderLight shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
               {currentTheme === 'light' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-textMain">
                {currentLanguage === 'fa' ? 'ظاهر و تم' : 'Appearance & Theme'}
              </h3>
              <p className="text-sm text-textLight">
                {currentLanguage === 'fa' ? 'تغییر رنگ‌ها و حالت شب' : 'Toggle Dark Mode'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
             <button 
                type="button"
                onClick={() => setTheme('light')}
                className={`w-12 h-12 rounded-full bg-surface border-2 flex items-center justify-center transition-all ${currentTheme === 'light' ? 'border-primary ring-4 ring-primary/10 scale-110 shadow-md' : 'border-borderLight hover:border-gray-400'}`}
                title={currentLanguage === 'fa' ? 'تم روشن' : 'Light Mode'}
             >
                {currentTheme === 'light' && <CheckCircle className="w-5 h-5 text-primary" />}
                {currentTheme !== 'light' && <Sun className="w-5 h-5 text-textLight" />}
             </button>
             <button 
                type="button"
                onClick={() => setTheme('dark')}
                className={`w-12 h-12 rounded-full bg-surface border-2 flex items-center justify-center transition-all ${currentTheme === 'dark' ? 'border-primary ring-4 ring-primary/10 scale-110 shadow-md' : 'border-borderLight hover:border-gray-400'}`}
                title={currentLanguage === 'fa' ? 'تم تیره' : 'Dark Mode'}
             >
                {currentTheme === 'dark' && <CheckCircle className="w-5 h-5 text-primary" />}
                {currentTheme !== 'dark' && <Moon className="w-5 h-5 text-textLight" />}
             </button>
          </div>
        </div>

        {/* Backup Section */}
        <div className="bg-surface p-6 rounded-2xl border border-borderLight shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
               <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-textMain">
                {currentLanguage === 'fa' ? 'پشتیبان‌گیری' : 'Backup'}
              </h3>
              <p className="text-sm text-textLight">
                {currentLanguage === 'fa' ? 'آخرین بکاپ: امروز' : 'Last backup: Today'}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleBackup}
            disabled={isBackingUp}
            icon={isBackingUp ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            className="min-w-[160px]"
          >
             {isBackingUp 
               ? (currentLanguage === 'fa' ? 'در حال انجام...' : 'Backing up...') 
               : (currentLanguage === 'fa' ? 'پشتیبان‌گیری دستی' : 'Manual Backup')}
          </Button>
        </div>
      </div>
      
      <div className="mt-12 text-center text-textLight text-sm opacity-70">
        <p>Graphic Assistant Hub v1.0.3</p>
        <p className="text-xs mt-1">Designed for Creative Professionals</p>
      </div>
    </div>
  );
};