'use client';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Login() {
  useAuth();
  const t = useTranslations('common');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Perform client-side specific logic (like checking for authentication)
  }, []);

  const handleLoginUser = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error details:', error);
      setErrorMessage('Login failed: ' + error.message);
    } else {
      router.push('/');
    }
  };
  let locale = Cookies.get('NEXT_LOCALE') || 'en';
  const handleRegister = () => {
    router.push(`/${locale}/register`);
  };

  return (
    <div className="bg-gradient-to-bl from-blue-500 h-screen mt-0 to-purple-500">
      <div className="pt-[5rem] text-center justify-items-center">
        <div className="bg-slate-50 mx-4 rounded-lg p-8 sm:flex flex-row sm:gap-5 py-10 shadow-lg sm:w-[50rem]">
          <div className="sm:flex hidden w-[30rem] justify-center justify-items-center items-center">
            <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg" />
          </div>
          <div className="flex sm:w-[20rem] flex-col">
            <div className="pb-8">
              <span className="text-2xl font-semibold">Logo</span>
              <p className="text-sm py-1">{t('loginDesc')}</p>
            </div>
            {errorMessage && (
              <p className="text-red-500 py-2">{errorMessage}</p>
            )}
            <form
              onSubmit={handleLoginUser}
              className="flex flex-col gap-6 text-start text-sm"
            >
              <div className="flex flex-col">
                <label htmlFor="email">{t('email')}</label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  className="ml-1 mt-2 p-1 border border-slate-400 focus:outline-none rounded-sm"
                  type="email"
                  name="email"
                  id="email"
                  placeholder={t('inputEmail')}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="password">{t('password')}</label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  className="ml-1 mt-2 p-1 border border-slate-400 focus:outline-none rounded-sm"
                  type="password"
                  name="password"
                  id="password"
                  placeholder={t('inputPassword')}
                  required
                />
              </div>
              <div className="flex justify-between gap-3 px-3">
                <div className="flex items-center gap-1">
                  <input type="checkbox" name="remember" id="remember" />
                  <label htmlFor="remember">{t('rememberMe')}</label>
                </div>
                <div>
                  <span className="cursor-pointer text-blue-500">
                    {t('forgotPassword')}
                  </span>
                </div>
              </div>
              <div className="py-2">
                <button
                  type="submit"
                  className="uppercase font-bold duration-300 text-slate-100 hover:-translate-y-1 p-2 w-full bg-gradient-to-tl from-green-500 to-lime-500 shadow-md rounded-sm"
                >
                  {t('signIn')}
                </button>
              </div>
              <div className="flex text-center justify-center cursor-pointer gap-1">
                <span> {t('mustRegister')}</span>
                <span onClick={handleRegister} className="text-blue-500">
                  {t('signUp')}!
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
