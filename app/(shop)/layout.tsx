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
      {/* <main className="pt-28 dark:bg-eco-darkest">{children}</main> */}

      <main
        className="
          pt-[var(--navbar-height)] 
          lg:pt-[calc(var(--navbar-height)_+_2.5rem)]  /* 40px اضافه در دسکتاپ */
          min-h-screen 
          dark:bg-eco-darkest 
          transition-padding duration-300
        "
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
