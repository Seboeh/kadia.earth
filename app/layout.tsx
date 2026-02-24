import './globals.css';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import CookieConsentBanner from "@/components/cookie-consent-banner";

export const metadata: Metadata = {
  title: 'kadia.earth',
  description: 'Enhancing sustainability',
  icons: {
    icon: '/kadia-logo.png',
    shortcut: '/kadia-logo.png',
    apple: '/kadia-logo.png'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${inter.variable}`}
    >
      <body className="min-h-[100dvh] bg-gray-50" suppressHydrationWarning>
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          <section className="flex flex-col min-h-screen">
              <ReactQueryProvider>
                  {children}
                  <CookieConsentBanner />
                  <ReactQueryDevtools initialIsOpen={false} />
              </ReactQueryProvider>
            </section>
        </SWRConfig>
      </body>
    </html>
  );
}

