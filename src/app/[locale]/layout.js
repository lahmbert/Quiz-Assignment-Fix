import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import './globals.css';

export default async function LocaleLayout({ children, params }) {
  const { locale } = params; // Access params directly

  // Ensure the incoming `locale` is valid
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // Fetch locale-specific messages
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
