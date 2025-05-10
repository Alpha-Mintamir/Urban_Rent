import React, { useEffect } from 'react';
import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../../../hooks';
import { useLanguage } from '../../providers/LanguageProvider';
import SearchBar from './SearchBar';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Heart, MessageSquare, Search, Home as HomeIcon } from 'lucide-react';

export const Header = () => {
  const auth = useAuth();
  const location = useLocation();
  const { language, t } = useLanguage();

  const [showSearchBar, setShowSearchBar] = useState(true);
  const [hasShadow, setHasShadow] = useState(false);
  const { user } = auth;

  const handleScroll = () => {
    const shouldHaveShadow = window.scrollY > 0;
    setHasShadow(shouldHaveShadow);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    // hide searchbar based on url
    if (location.pathname === '/') {
      setShowSearchBar(true);
    } else {
      setShowSearchBar(false);
    }
    // clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location]);

  // Check if the user is a property owner (role 2) or broker (role 3)
  const isPropertyOwner = user && parseInt(user.role) === 2;
  const isBroker = user && parseInt(user.role) === 3;
  const isTenant = user && parseInt(user.role) === 1;

  return (
    <header
      className={`fixed top-0 z-10 flex w-screen justify-center bg-white py-4 ${
        hasShadow ? 'shadow-md' : ''
      }`}
    >
      <div
        className={`flex ${
          showSearchBar ? 'justify-around' : 'justify-between px-10'
        } w-screen max-w-screen-xl`}
      >
        <Link to={isBroker ? "/broker/dashboard" : isPropertyOwner ? "/owner/dashboard" : isTenant ? "/browse" : "/"} className="flex items-center gap-1">
          <img
            className="h-8 w-8 md:h-10 md:w-10"
            src="/assets/logo.ico"
            alt=""
          />

          <span className="hidden text-2xl font-bold text-[#D746B7] md:block">
            Urban Rent
          </span>
        </Link>

        {showSearchBar && <SearchBar />}

        <div className="flex items-center gap-2 md:gap-4">
          {/* Property Owner Dashboard Link */}
          {isPropertyOwner && (
            <Link
              to="/owner/dashboard"
              className="hidden items-center gap-1 rounded-full bg-[#D746B7] px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm text-white transition-colors hover:bg-[#c13da3] md:flex"
              title={t('ownerDashboard')}
            >
              <HomeIcon size={18} className="md:mr-1" />
              <span className="hidden md:inline">{t('dashboard')}</span>
            </Link>
          )}
          
          {/* Broker Dashboard Link */}
          {isBroker && (
            <Link
              to="/broker/dashboard"
              className="hidden items-center gap-1 rounded-full bg-blue-500 px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm text-white transition-colors hover:bg-blue-600 md:flex"
              title={t('brokerDashboard')}
            >
              <HomeIcon size={18} className="md:mr-1" />
              <span className="hidden md:inline">{t('dashboard')}</span>
            </Link>
          )}
          
          {/* Tenant Links: Browse, Saved, Messages */}
          {isTenant && (
            <>
              <Link
                to="/browse"
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm text-gray-700 transition-colors hover:bg-gray-100"
                title={t('browseProperties')}
              >
                <Search size={18} className="md:mr-1" />
                <span className="hidden md:inline">{t('browse') || 'Browse'}</span>
              </Link>
              <Link
                to="/tenant/saved"
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm text-gray-700 transition-colors hover:bg-gray-100"
                title={t('savedProperties')}
              >
                <Heart size={18} className="md:mr-1" />
                <span className="hidden md:inline">{t('saved') || 'Saved'}</span>
              </Link>
              <Link
                to="/tenant/messages"
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm text-gray-700 transition-colors hover:bg-gray-100"
                title={t('messages')}
              >
                <MessageSquare size={18} className="md:mr-1" />
                <span className="hidden md:inline">{t('messages')}</span>
              </Link>
            </>
          )}
          
          {/* Profile/Login Link */}
          <Link
            to={user ? '/account' : '/login'}
            className="w-50 flex h-full items-center gap-2 rounded-full border-gray-300 py-1 px-2 md:border"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="hidden h-6 w-6 md:block"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>

            <div className="z-10 h-[35px] w-[35px] overflow-hidden rounded-full">
              {user ? (
                <Avatar>
                  {user?.picture ? (
                    <AvatarImage src={user.picture} className="h-full w-full" />
                  ) : (
                    <AvatarImage
                      src="https://res.cloudinary.com/dgckkacgl/image/upload/v1736381621/AAA6003427255839211369_121_yukrdc.jpg"
                      className="h-full w-full"
                    />
                  )}
                </Avatar>
              ) : (
                <svg
                  fill="#858080"
                  version="1.1"
                  id="Layer_1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="796 796 200 200"
                  enableBackground="new 796 796 200 200"
                  xmlSpace="preserve"
                  stroke="#858080"
                  className="h-8 w-8"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M896,796c-55.14,0-99.999,44.86-99.999,100c0,55.141,44.859,100,99.999,100c55.141,0,99.999-44.859,99.999-100 C995.999,840.86,951.141,796,896,796z M896.639,827.425c20.538,0,37.189,19.66,37.189,43.921c0,24.257-16.651,43.924-37.189,43.924 s-37.187-19.667-37.187-43.924C859.452,847.085,876.101,827.425,896.639,827.425z M896,983.86 c-24.692,0-47.038-10.239-63.016-26.695c-2.266-2.335-2.984-5.775-1.84-8.82c5.47-14.556,15.718-26.762,28.817-34.761 c2.828-1.728,6.449-1.393,8.91,0.828c7.706,6.958,17.316,11.114,27.767,11.114c10.249,0,19.69-4.001,27.318-10.719 c2.488-2.191,6.128-2.479,8.932-0.711c12.697,8.004,22.618,20.005,27.967,34.253c1.144,3.047,0.425,6.482-1.842,8.817 C943.037,973.621,920.691,983.86,896,983.86z"></path>{' '}
                  </g>
                </svg>
              )}
            </div>
          </Link>
        </div>
      </div>
      <br className="border border-gray-600" />
    </header>
  );
};
