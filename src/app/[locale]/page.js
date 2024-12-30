'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/navbar';
import { useTranslations } from 'next-intl';

export default function Home() {
  useAuth();
  const [isOpenBars, setIsOpenBars] = useState(false);
  const t = useTranslations('common');

  const route = useRouter();
  const handleLogin = () => {
    route.push('en/login');
  };
  return (
    <div className="text-center justify-center">
      <section
        style={{
          backgroundImage: "url('/img/bg-01.png')",
        }}
        className="h-screen text-white bg-no-repeat bg-cover"
      >
        <Navbar isOpenBars={isOpenBars} setIsOpenBars={setIsOpenBars} />
        <div className="sm:justify-between items-center sm:flex-row flex flex-col sm:p-[5rem] p-8">
          <div
            className={`flex ${
              isOpenBars ? 'py-0' : 'py-16'
            } text-start sm:py-16 font-bold flex-col gap-4`}
          >
            <p className="text-orange-500 text-2xl">{t('welcome')}</p>
            <span className="text-green-900 text-7xl">Quizer</span>
            <p className="sm:pr-[14rem]">{t('desc')}</p>
            <div className="py-8">
              <button
                onClick={handleLogin}
                className="p-2 bg-gradient-to-tl font-semibold duration-300 rounded-full shadow-md px-8 from-green-500 to-lime-500 hover:-translate-y-1"
              >
                {t('getStart')}
              </button>
            </div>
          </div>
          <div className="w-[55em] hidden sm:flex text-center">
            <img src="/img/text-bg.png" />
          </div>
        </div>
      </section>
    </div>
  );
}
