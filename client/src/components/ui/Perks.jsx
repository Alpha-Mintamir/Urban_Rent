import React from 'react';
import { useLanguage } from '@/providers/LanguageProvider';

const Perks = ({ selected, onChange }) => {
  const { language } = useLanguage();
  
  const handlePerkChange = (event) => {
    const { name, checked } = event.target;
    let newSelectedPerks;
    if (checked) {
      newSelectedPerks = [...selected, name];
    } else {
      newSelectedPerks = selected.filter(perkName => perkName !== name);
    }
    onChange(newSelectedPerks);
  };

  // Perks data with translations
  const perksData = [
    {
      name: 'utilities_included',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      label: {
        am: 'የመብራት እና የውሀ ክፍያ ይጨምራል',
        en: 'Utilities Included'
      }
    },
    {
      name: 'parking',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
      label: {
        am: 'መኪና ፓርኪንግ ቦታ',
        en: 'Parking Space'
      }
    },
    {
      name: 'wifi',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
        </svg>
      ),
      label: {
        am: 'ነፃ ዋይፋይ',
        en: 'Free WiFi'
      }
    },
    {
      name: 'tv',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      label: {
        am: 'ቴሌቪዥን',
        en: 'Television'
      }
    },
    {
      name: 'kitchen',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
        </svg>
      ),
      label: {
        am: 'የራስ ኩሽና',
        en: 'Private Kitchen'
      }
    },
    {
      name: 'bathroom',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
      ),
      label: {
        am: 'የራስ መታጠቢያ',
        en: 'Private Bathroom'
      }
    },
    {
      name: 'security',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      label: {
        am: 'የጥበቃ አገልግሎት',
        en: 'Security Service'
      }
    },
    {
      name: 'furnished',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      label: {
        am: 'ሙሉ ፈርኒቸር',
        en: 'Fully Furnished'
      }
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
      {perksData.map(perk => (
        <label
          key={perk.name}
          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all 
            ${selected.includes(perk.name) 
              ? 'border-[#D746B7] bg-pink-50 shadow-md' 
              : 'border-gray-200 hover:border-[#D746B7] hover:bg-pink-50'}`}
        >
          <div className="relative">
            <input
              type="checkbox"
              checked={selected.includes(perk.name)}
              name={perk.name}
              onChange={handlePerkChange}
              className="h-5 w-5 rounded border-gray-300 text-[#D746B7] focus:ring-[#D746B7] transition-all"
            />
          </div>
          <div className={`flex items-center gap-2 ${selected.includes(perk.name) ? 'text-[#D746B7]' : 'text-gray-600'}`}>
            {React.cloneElement(perk.icon, { 
              className: `h-6 w-6 ${selected.includes(perk.name) ? 'text-[#D746B7]' : 'text-gray-500'} transition-colors` 
            })}
            <span className={`text-base ${language === 'am' ? 'font-amharic' : ''}`}>
              {language === 'am' ? perk.label.am : perk.label.en}
            </span>
          </div>
        </label>
      ))}
    </div>
  );
};

export default Perks;
