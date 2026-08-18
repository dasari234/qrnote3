import { AuthProvider } from '@/components/providers/auth-provider';
import { CartProvider } from '@/components/providers/cart/CartProvider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QRNote — Dynamic QR Codes for Teams',
  description: 'Create, manage, and track dynamic QR codes with analytics, branding, and team collaboration.',
  icons: {
    icon: `data:image/svg+xml,<svg xmlns=%22http://w3.org viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23000000%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><rect width=%225%22 height=%225%22 x=%222%22 y=%222%22 rx=%221%22/><rect width=%225%22 height=%225%22 x=%2217%22 y=%222%22 rx=%221%22/><rect width=%225%22 height=%225%22 x=%222%22 y=%2217%22 rx=%221%22/><path d=%22M17 17h.01%22/><path d=%22M17 22h5%22/><path d=%22M22 17v5%22/><path d=%22M7 12h.01%22/><path d=%22M12 7h.01%22/><path d=%22M12 12h5%22/><path d=%22M12 17h.01%22/><path d=%22M17 12h5%22/></svg>`,
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
