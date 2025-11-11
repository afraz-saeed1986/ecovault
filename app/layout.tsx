import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";


export const metadata: Metadata = {
  title: "Create Next App",
  description: "Eco-friendly products for a greener future",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Providers>
          <CartProvider>
            <Navbar />
            <main className="pt-20">{children}</main>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
