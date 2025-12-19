import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Providers from "@/components/Providers";
import { SearchProvider } from "@/components/SearchContext";
import { ThemeProvider } from "@/components/ThemeContext";
import { WishlistProvider } from "@/components/WishList";
import { ToastProvider } from "@/components/ui/ToastContext";
import PwaRegister from "@/components/PwaRegister";


export const metadata: Metadata = {
    title: "EcoVault",
  description: "Eco-friendly products for a greener future",
  manifest: '/manifest.json',             // اختیاری (Next.js خودکار اضافه می‌کند)
  appleWebApp: {
    capable: true,                        // اجازه install در iOS
    statusBarStyle: 'default',            // یا 'black-translucent'
    title: 'نام کوتاه',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',                  // همان theme_color manifest
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased overflow-x-hidden dark:bg-eco-darkest`}
      >
        <Providers>
          <ToastProvider>
            <WishlistProvider>
              <ThemeProvider>
                <SearchProvider>
                  <CartProvider>
                    {/* <Navbar /> */}
                    {/* <main className="pt-20 dark:bg-eco-darkest">{children}</main> */}
                    {children}
                    {/* <Footer /> */}
                  </CartProvider>
                </SearchProvider>
              </ThemeProvider>
            </WishlistProvider>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
