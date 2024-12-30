import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { routing } from '@/i18n/routing';
import Cookies from 'js-cookie'; // Tambahkan ini untuk mengelola cookies

export const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      let locale = Cookies.get('NEXT_LOCALE'); // Ambil locale dari cookies

      // Ensure that a valid locale is used
      if (!locale || !routing.locales.includes(locale)) {
        locale = routing.defaultLocale;
      }

      if (error || !data.user) {
        router.push(`/${locale}/login`);
      } else {
        router.push(`/${locale}`); // Gunakan locale yang valid untuk route
      }
    };

    checkUser();
  }, [router]);
};
