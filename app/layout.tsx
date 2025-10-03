import './globals.css';
import type { Metadata } from 'next';
import { Inter, Noto_Serif_SC } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });
const notoSerifSC = Noto_Serif_SC({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-noto-serif-sc'
});

export const metadata: Metadata = {
  title: '语情歌 StarWhisper - AI情歌创作平台',
  description: '星辰为证，歌声为誓 - 用AI为你的爱情谱写专属旋律',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} ${notoSerifSC.variable}`}>
        <Navigation />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
