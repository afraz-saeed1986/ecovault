// app/Providers.tsx یا هر جایی که داشتی
"use client";

import { ThemeProvider } from "@/components/ThemeContext"; // اگر داری
// اگر کامپوننت دیگه‌ای مثل CartProvider، WishlistProvider و ... داری، اضافه کن

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* اگر ThemeProvider داری، نگهش دار */}
      <ThemeProvider>
        {/* اگر کامپوننت‌های دیگه مثل Cart, Search, Wishlist داری، اینجا بذار */}
        {children}
      </ThemeProvider>
    </>
  );
}

// "use client";

// import { SessionProvider } from "next-auth/react";

// export default function Providers({ children }: { children: React.ReactNode }) {
//   return <SessionProvider>{children}</SessionProvider>;
// }
