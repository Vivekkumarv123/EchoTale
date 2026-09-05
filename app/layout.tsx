import type { Metadata } from 'next';
import { Alex_Brush, Caveat, Permanent_Marker, Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import { HashCleaner } from '@/components/HashCleaner';
import './globals.css';

const scriptFont = Alex_Brush({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-salted-caramel',
  display: 'swap',
});

const noteFont = Caveat({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-make-a-note',
  display: 'swap',
});

const brushFont = Permanent_Marker({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-amora-brush',
  display: 'swap',
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serifFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'EchoTale',
  description: 'EchoTale is a personal reflective journal and sealed Sanctum Moments keepsake creator with immersive unboxing ceremonies.',
  openGraph: {
    title: 'EchoTale',
    description: 'EchoTale is a personal reflective journal and sealed Sanctum Moments keepsake creator with immersive unboxing ceremonies.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EchoTale',
    description: 'EchoTale is a personal reflective journal and sealed Sanctum Moments keepsake creator with immersive unboxing ceremonies.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${scriptFont.variable} ${noteFont.variable} ${brushFont.variable} ${sansFont.variable} ${serifFont.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans bg-transparent" suppressHydrationWarning>
        <HashCleaner />
        {children}
      </body>
    </html>
  );
}
