'use client';

import { supabase } from '@/lib/supabaseClient';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  let locale = Cookies.get('NEXT_LOCALE') || 'en';
  const t = useTranslations('common');
  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== rePassword) {
      setErrorMessage("Passwords don't match");
      return;
    }

    const { user, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setErrorMessage(authError.message);
      console.error(authError);
      return;
    }

    const { error: dbError } = await supabase.from('users').insert([
      {
        email,
        full_name: fullName,
        password,
      },
    ]);

    if (dbError) {
      setErrorMessage('Register Gagal. Periksa kembali!');
    } else {
      router.push(`/${locale}/login`);
    }
  };

  const handleLogin = () => {
    router.push(`/${locale}/login`);
  };

  return (
    <div>
      <div className="py-[4rem] bg-gradient-to-bl from-blue-400 to-purple-400 sm:mb-0 text-center justify-items-center">
        <div className="bg-slate-50 mx-4 rounded-lg p-8 sm:flex flex-row sm:gap-5 py-10 shadow-lg sm:w-[50rem]">
          <div className="sm:flex hidden w-[30rem] justify-center justify-items-center items-center">
            <img
              src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
              alt="Illustration"
            />
          </div>
          <div className="flex sm:w-[20rem] flex-col">
            <div className="pb-8">
              <span className="text-2xl font-semibold">Logo</span>
              <p className="text-sm py-1">{t('registerDesc')}</p>
            </div>
            {errorMessage && (
              <p className="py-2 text-red-500">{errorMessage}</p>
            )}
            <form
              onSubmit={handleRegisterUser}
              className="flex flex-col w-full gap-6 text-start text-sm"
            >
              <div className="flex flex-col">
                <label htmlFor="name">{t('fullName')}</label>
                <input
                  onChange={(e) => setFullName(e.target.value)}
                  value={fullName}
                  className="ml-1 mt-2 p-1 border border-slate-400 focus:outline-none rounded-sm"
                  type="text"
                  name="name"
                  id="name"
                  placeholder={t('inputName')}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="email">{t('email')}</label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  className="ml-1 mt-2 p-1 border border-slate-400 focus:outline-none rounded-sm"
                  type="email"
                  name="email"
                  id="email"
                  placeholder={t('inputEmail')}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="password">{t('password')}</label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="ml-1 mt-2 p-1 border border-slate-400 focus:outline-none rounded-sm"
                  type="password"
                  name="password"
                  id="password"
                  placeholder={t('inputPassword')}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="r-password">{t('retypePassword')}</label>
                <input
                  onChange={(e) => setRePassword(e.target.value)}
                  value={rePassword}
                  className="ml-1 mt-2 p-1 border border-slate-400 focus:outline-none rounded-sm"
                  type="password"
                  name="r-password"
                  id="r-password"
                  placeholder={t('inputPasswordAgain')}
                  required
                />
              </div>
              <div className="flex items-center gap-1 px-4">
                <input type="checkbox" name="remember" id="remember" required />
                <label htmlFor="remember">{t('agreeTos')}</label>
              </div>
              <div className="py-2">
                <button
                  type="submit"
                  className="uppercase font-bold duration-300 text-slate-100 hover:-translate-y-1 p-2 w-full bg-gradient-to-tl from-green-500 to-lime-500 shadow-md rounded-sm"
                >
                  {t('signUp')}
                </button>
              </div>
              <div className="flex text-center justify-center cursor-pointer gap-1">
                <span>{t('mustSignIn')}</span>
                <span onClick={handleLogin} className="text-blue-500">
                  {t('signIn')}!
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
