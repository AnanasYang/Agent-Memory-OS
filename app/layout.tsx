import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import { AuthProvider } from '@/components/auth-provider';
import { Navigation } from '@/components/navigation';
import { MobileNavigation } from '@/components/mobile-navigation';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Agent Memory OS',
  description: 'AI Agent Memory System Visualization Dashboard',
  keywords: ['AI', 'Memory', 'Agent', 'Dashboard', 'Visualization'],
  authors: [{ name: 'Agent Memory OS Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased min-h-screen bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background bg-grid-pattern">
                <Navigation />
                <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
                  {children}
                </main>
                <MobileNavigation />
              </div>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
