import type { Metadata, Viewport } from 'next';
import { Cinzel, Poppins } from 'next/font/google';
import Script from 'next/script';
import { BottomBar } from '@/components/BottomBar';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { RevealObserver } from '@/components/RevealObserver';
import { TrackClicks } from '@/components/TrackClicks';
import { getContext } from '@/lib/site';
import './globals.css';

// Self-hosted at build time by next/font: no request to Google from visitors.
// Brand typefaces (NEFRA Brand Guidelines): Cinzel = main, Poppins = secondary.
const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-cinzel', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins', display: 'swap' });

export function generateMetadata(): Metadata {
  const { site } = getContext();
  return {
    ...(site.siteUrl ? { metadataBase: new URL(site.siteUrl) } : {}),
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    icons: { icon: '/favicon.svg' },
    ...(site.analytics.googleSiteVerification ? { verification: { google: site.analytics.googleSiteVerification } } : {}),
  };
}

export const viewport: Viewport = { themeColor: '#0E5A4F', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { site, ordering } = getContext();
  const ga = site.analytics.ga4MeasurementId;
  return (
    <html lang="en" className={`${cinzel.variable} ${poppins.variable}`}>
      <body className={ordering.isLive ? 'has-bottom-bar' : ''}>
        <a href="#main" className="sr-only z-[100] bg-charcoal px-4 py-2 text-ivory focus:not-sr-only focus:fixed focus:left-2 focus:top-2">
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <BottomBar />
        <RevealObserver />
        <TrackClicks />
        {ga && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(ga)});`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
