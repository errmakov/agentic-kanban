import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FactoryWall',
  description: 'Live session companion — built feature-by-feature, on stage, by AI agents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('fw-theme')==='dark'){document.documentElement.dataset.theme='dark'}}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
