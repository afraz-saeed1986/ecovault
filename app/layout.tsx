import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { SearchProvider } from "@/components/SearchContext";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeContext";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Eco-friendly products for a greener future",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased overflow-x-hidden`}
      >
        <Providers>
          <ThemeProvider>
            <SearchProvider>
              <CartProvider>
                <Navbar />
                <main className="pt-20">{children}</main>
                <Footer />
              </CartProvider>
            </SearchProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
