'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

export default function Navbar({ isOpenBars, setIsOpenBars }) {
  let locale = Cookies.get('NEXT_LOCALE') || 'en'; // Default to 'en' if no locale is found

  const [isEnLocale, setIsEnLocale] = useState(locale === 'en');
  const router = useRouter();
  const pathName = usePathname();
  const [user, setUser] = useState(null);
  const t = useTranslations('common');

  const toggleLocale = () => {
    const newLocale = isEnLocale ? 'ar' : 'en';
    setIsEnLocale(!isEnLocale);
    Cookies.set('NEXT_LOCALE', newLocale, { path: '/' });

    const newPath = pathName.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    fetchUser();
  }, []);

  const handleOpenBars = () => {
    setIsOpenBars(!isOpenBars);
  };

  const handleLoginLogout = async () => {
    if (user) {
      await supabase.auth.signOut();
      setUser(null);
      router.push(`/${locale}/login`);
    } else {
      router.push(`/${locale}/login`);
    }
  };

  const getActiveClass = (path) => {
    return pathName === path ? 'text-orange-300' : '';
  };

  return (
    <div className="bg-gradient-to-tl from-blue-500 items-center to-purple-500 p-8 py-6 sm:px-[5rem] text-white sm:font-semibold font-medium text-sm shadow-md">
      <div className="flex items-center justify-between w-full">
        <div className="font-bold">Logo</div>
        <div className="sm:hidden flex justify-end gap-4 items-center">
          <div className="relative items-center flex gap-1">
            <span className="text-xs">EN</span>
            <button
              onClick={toggleLocale}
              className={`${
                isEnLocale ? 'bg-gray-400' : 'bg-gray-300'
              } w-10 h-5 rounded-full p-1 flex items-center justify-between`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full transition-all duration-300 ${
                  isEnLocale ? 'translate-x-0' : 'translate-x-5'
                }`}
              ></div>
            </button>
            <span className="text-xs">AR</span>
          </div>
          <button className="sm:hidden flex" onClick={handleOpenBars}>
            <FontAwesomeIcon icon={faBars} className="text-lg" />
          </button>
        </div>
        <div className="sm:flex hidden items-center justify-around gap-4">
          <div className="sm:flex hidden relative items-center gap-1">
            <span className="text-xs">EN</span>
            <button
              onClick={toggleLocale}
              className={`${
                isEnLocale ? 'bg-gray-400' : 'bg-gray-300'
              } w-10 h-5 rounded-full p-1 flex items-center justify-between`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full transition-all duration-300 ${
                  isEnLocale ? 'translate-x-0' : 'translate-x-5'
                }`}
              ></div>
            </button>
            <span className="text-xs">AR</span>
          </div>
          <div className={getActiveClass(`/en`) || getActiveClass(`/ar`)}>
            <Link href={`/`}>{t('home')}</Link>
          </div>
          <div
            className={`cursor-pointer ${
              getActiveClass(`/en/take-quiz`) || getActiveClass('/ar/take-quiz')
            }`}
          >
            <Link href={`/en/take-quiz`}>{t('takeQuiz')}</Link>
          </div>
          <div
            className={`cursor-pointer ${
              getActiveClass(`/en/list-quiz`) || getActiveClass('/ar/list-quiz')
            }`}
          >
            <Link href={`/en/list-quiz`}>{t('listQuiz')}</Link>
          </div>
          <div>
            <button
              onClick={handleLoginLogout}
              className="bg-gradient-to-tl rounded-full shadow-md hover:-translate-y-1 duration-300 from-green-500 to-lime-500 p-2 px-4"
            >
              {user ? t('signOut') : t('signIn')}
            </button>
          </div>
        </div>
      </div>
      <div
        className={`sm:hidden transition-all duration-500 ease-in-out ${
          isOpenBars ? 'flex' : 'hidden'
        } flex pt-4 border-b-2`}
      ></div>
      <div
        className={`sm:hidden transition-all duration-500 ease-in-out ${
          isOpenBars ? 'flex' : 'hidden'
        } flex pt-4 gap-2 flex-col text-start`}
      >
        <div
          className={`cursor-pointer ${
            getActiveClass(`/en`) || getActiveClass(`/ar`)
          }`}
        >
          <Link href={`/en` || `/ar`}>{t('home')}</Link>
        </div>
        <div
          className={`cursor-pointer ${
            getActiveClass(`/en/take-quiz`) || getActiveClass('/ar/take-quiz')
          }`}
        >
          <Link href={`/en/take-quiz`}>{t('takeQuiz')}</Link>
        </div>
        <div className="w-full text-center pt-2">
          <button
            onClick={handleLoginLogout}
            className="p-2 bg-gradient-to-tl w-[50%] duration-300 hover:-translate-y-1 rounded-full from-green-500 to-lime-500"
          >
            {user ? t('signOut') : t('signIn')}
          </button>
        </div>
      </div>
    </div>
  );
}
