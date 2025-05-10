import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AccountNav from '@/components/ui/AccountNav';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';

const SettingsPage = () => {
  // Use language and theme contexts
  const { language, changeLanguage, t } = useLanguage();
  const { theme, changeTheme } = useTheme();

  // Handle language change
  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    changeLanguage(selectedLanguage);
    toast.success(selectedLanguage === 'am' ? 'ቋንቋ ተቀይሯል' : 'Language changed successfully');
  };

  // Handle theme change
  const handleThemeChange = (e) => {
    const selectedTheme = e.target.value;
    changeTheme(selectedTheme);
    toast.success(language === 'am' ? 'ገጽታ ተቀይሯል' : 'Theme changed successfully');
  };

  // No need for local translations - using the language provider

  // Save all settings
  const saveSettings = () => {
    // Settings are already saved when changed, this is just for user feedback
    toast.success(language === 'am' ? 'ቅንብሮች ተቀይረዋል!' : 'Settings saved successfully!');
  };

  return (
    <div className="p-4">
      <AccountNav />
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-center text-3xl font-bold">{t('settingsTitle')}</h1>
        <p className="mb-8 text-center text-gray-600">{t('settingsDescription')}</p>
        
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          {/* Language Section */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{t('languageSection')}</h2>
            <div className="mb-4">
              <label className="mb-2 block font-medium text-gray-700 dark:text-gray-300">
                {t('languageLabel')}
              </label>
              <select
                value={language}
                onChange={handleLanguageChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-[#D746B7] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="am">{t('amharic')}</option>
                <option value="en">{t('english')}</option>
              </select>
            </div>
          </div>
          
          {/* Theme Section */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{t('themeSection')}</h2>
            <div className="mb-4">
              <label className="mb-2 block font-medium text-gray-700 dark:text-gray-300">
                {t('themeLabel')}
              </label>
              <select
                value={theme}
                onChange={handleThemeChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-[#D746B7] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="light">{t('lightTheme')}</option>
                <option value="dark">{t('darkTheme')}</option>
              </select>
            </div>
            
            {/* Theme Preview */}
            <div className="mt-4 rounded-lg border p-4 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-8 w-8 rounded-full bg-[#D746B7]"></div>
                </div>
                <div className="text-sm">
                  {t('themePreview')}
                </div>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-center">
            <button
              onClick={saveSettings}
              className="rounded-full bg-[#D746B7] px-6 py-2 font-semibold text-white transition hover:bg-[#c13da3]"
            >
              {t('saveButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
