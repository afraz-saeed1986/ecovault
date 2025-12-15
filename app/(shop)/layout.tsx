import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import React from "react";

// این Layout فقط برای مسیرهای داخل (shop) اعمال می شود و Navbar و Footer را اضافه می کند
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-28 dark:bg-eco-darkest">{children}</main>
      <Footer />
    </>
  );
}
