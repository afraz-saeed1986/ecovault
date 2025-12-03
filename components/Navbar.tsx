"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";
import CartDropdown from "@/components/cartDropdown";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  Heart,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useSearch } from "./SearchContext";
import { useTheme } from "@/components/ThemeContext";
import { useWishlist } from "@/components/WishList";
import type { AvatarProps } from "@/types";

// --- تابع کمکی: استخراج حروف اول اسم ---
const getInitials = (name: string | null | undefined): string => {
  if (!name) return "??";
  const parts = name.split(/\s+/).filter((p) => p.length > 0);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts.length > 0 ? parts[0][0].toUpperCase() : "??";
};

// --- کامپوننت نمایش آواتار ---
const AvatarWithFallback: React.FC<AvatarProps> = ({
  image,
  name,
  size,
  scale,
}) => {
  const initials = getInitials(name);
  const sizeClasses = { small: "w-8 h-8 text-xs", large: "w-12 h-12 text-lg" };
  const currentSizeClass = sizeClasses[scale];

  if (image) {
    return (
      <img
        src={image}
        alt={name || "User"}
        className={`${currentSizeClass
          .replace("text-xs", "")
          .replace(
            "text-lg",
            ""
          )} rounded-full border border-white dark:border-eco-light shadow-md object-cover`}
        referrerPolicy="no-referrer"
        width={scale === "small" ? 32 : 48}
        height={scale === "small" ? 32 : 48}
      />
    );
  }

  return (
    <div
      className={`${currentSizeClass} rounded-full border border-white dark:border-eco-light shadow-md flex items-center justify-center bg-white/20 dark:bg-eco-light/10 font-bold`}
      title={name || "User"}
    >
      {initials}
    </div>
  );
};

// --- Placeholder حالت loading ---
const LoadingPlaceholder = ({ isMobile = false }) => (
  <div
    className={`flex items-center justify-center ${
      isMobile ? "h-10 w-full" : "w-24 h-8"
    } bg-white/20 rounded-lg animate-pulse`}
  >
    {isMobile ? "Loading..." : ""}
  </div>
);

export default function Navbar() {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { searchTerm, setSearchTerm } = useSearch();
  const { darkMode, toggleDarkMode } = useTheme();

  const showSearch = pathname === "/";
  const isLoggedIn = status === "authenticated" && !!session?.user?.id;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    document.cookie =
      "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=lax";
    window.location.href = "/";
  };

  return (
    <>
      <header className="bg-eco-green dark:bg-eco-dark text-white dark:text-eco-light sticky top-0 z-40 shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          {/* موبایل و تبلت */}
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 hover:bg-white/10 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              <Link
                href="/"
                className="text-xl font-bold flex items-center gap-2"
              >
                EcoVault
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded hover:bg-white/10 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
              <Link
                href="/wishlist"
                className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {wishlist.length > 99 ? "99+" : wishlist.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* دسکتاپ */}
          <div className="hidden lg:flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-bold">
                EcoVault
              </Link>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded hover:bg-white/10 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
            {showSearch && (
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg text-eco-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-eco-accent text-sm"
                  />
                </div>
              </div>
            )}
            <div className="flex items-center gap-4">
              <Link
                href="/wishlist"
                className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {wishlist.length > 99 ? "99+" : wishlist.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-3">
                {status === "loading" ? (
                  <LoadingPlaceholder />
                ) : isLoggedIn ? (
                  <div className="flex items-center gap-3">
                    <AvatarWithFallback
                      image={session.user?.image}
                      name={session.user?.name}
                      size=""
                      scale="small"
                    />
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-1.5 bg-white/5 dark:bg-white/5 dark:hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-all duration-300 shadow-sm hover:shadow-lg"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 bg-red-500/40 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-500/50 transition-all duration-300 shadow-sm hover:shadow-lg"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/auth/signin"
                      className="bg-white/20 text-white px-4 py-1.5 rounded-lg font-semibold text-sm hover:bg-white/30 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signin"
                      className="bg-eco-accent/40 text-white px-4 py-1.5 rounded-lg font-semibold text-sm hover:bg-eco-accent/60 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* جستجو موبایل */}
          {showSearch && (
            <div className="lg:hidden mt-3 px-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg text-eco-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-eco-accent text-sm"
                />
              </div>
            </div>
          )}

          {/* منوی موبایل */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-eco-green/95 dark:bg-eco-dark/95 backdrop-blur-sm border-t border-white/20">
              <div className="px-4 py-4 space-y-3">
                {status === "loading" ? (
                  <div className="h-20 flex items-center justify-center text-white/70">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading
                    User...
                  </div>
                ) : isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 pb-3 border-b border-white/20">
                      <AvatarWithFallback
                        image={session.user?.image}
                        name={session.user?.name}
                        size=""
                        scale="large"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm truncate">
                          {session.user?.name}
                        </p>
                        <Link
                          href="/dashboard"
                          className="mt-2 flex items-center justify-center gap-1.5 bg-white/10 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-white/20 transition-all duration-300 w-fit"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-3 h-3" /> View Dashboard
                        </Link>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-3 bg-red-500/20 hover:bg-red-500/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/auth/signin"
                      className="block w-full text-center bg-white/20 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-white/30 transition-colors shadow-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signin"
                      className="block w-full text-center bg-eco-accent/40 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-eco-accent/60 transition-colors shadow-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <CartDropdown isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

// "use client";

// import { useState } from "react";
// import { useCart } from "@/components/CartContext";
// import CartDropdown from "@/components/cartDropdown";
// import { ShoppingCart, Search, Menu, X, LogOut, Sun, Moon, Heart, LayoutDashboard, Loader2 } from "lucide-react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useSession, signOut } from "next-auth/react";
// import { useSearch } from "./SearchContext";
// import { useTheme } from "@/components/ThemeContext";
// import { useWishlist } from "@/components/WishList";
// import type { AvatarProps } from "@/types";
// import Image from "next/image";

// // --- تابع کمکی: استخراج حروف اول اسم ---
// const getInitials = (name: string | null | undefined): string => {
//   if (!name) return "??";

//   // سعی می‌کنیم دو حرف اول کلمات را بگیریم (برای سعید افراز -> SA)
//   const parts = name.split(/\s+/).filter(p => p.length > 0);

//   if (parts.length >= 2) {
//     return (parts[0][0] + parts[1][0]).toUpperCase();
//   }
//   // اگر فقط یک کلمه بود یا اسم‌های پیچیده، یک حرف اول را برمی‌گردانیم
//   return parts.length > 0 ? parts[0][0].toUpperCase() : "??";
// };

// // --- کامپوننت کمکی: نمایش آواتار یا حروف اول ---
// // interface AvatarProps {
// //   image?: string | null;
// //   name?: string | null;
// //   size: 'small' | 'large'; // small: 8x8 (desktop), large: 12x12 (mobile)
// // }

// const AvatarWithFallback: React.FC<AvatarProps> = ({ image, name, size, scale }) => {
//   const initials = getInitials(name);
//   const sizeClasses = {
//     small: "w-8 h-8 text-xs",
//     large: "w-12 h-12 text-lg",
//   };

//   const currentSizeClass = sizeClasses[scale];

//   // شرط: اگر image داشتیم و خالی نبود، تصویر را نمایش می‌دهیم
//   if (image) {
//     return (
//       <img
//         src={image}
//         alt={name || "User"}
//         className={`${currentSizeClass.replace('text-xs', '').replace('text-lg', '')} rounded-full border border-white dark:border-eco-light shadow-md object-cover`}
//         referrerPolicy="no-referrer"
//         width={scale === 'small' ? 32 : 48}
//         height={scale === 'small' ? 32 : 48}
//       />
//     );
//   }

//   // اگر تصویر وجود نداشت یا آدرس آن خالی بود، حروف اول را نمایش می‌دهیم
//   return (
//     <div
//       className={`${currentSizeClass} rounded-full border border-white dark:border-eco-light shadow-md flex items-center justify-center bg-white/20 dark:bg-eco-light/10 font-bold`}
//       title={name || "User"}
//     >
//       {initials}
//     </div>
//   );
// };

//   // کامپوننت Placeholder برای حالت بارگذاری
//   const LoadingPlaceholder = ({ isMobile = false }) => (
//     <div
//       className={`flex items-center justify-center ${isMobile ? 'h-10 w-full' : 'w-24 h-8'} bg-white/20 rounded-lg animate-pulse`}
//     >
//       {isMobile ? "Loading..." : ""}
//     </div>
//   );

// export default function Navbar() {
//   const [cartOpen, setCartOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const { totalItems } = useCart();
//   const { wishlist } = useWishlist();
//   const pathname = usePathname();
//   const { data: session, status } = useSession();
//   const { searchTerm, setSearchTerm } = useSearch();
//   const { darkMode, toggleDarkMode } = useTheme();

//   const showSearch = pathname === "/";

//   const handleLogout = async () => {
//     await signOut({ redirect: false });
//     // تمیز کردن کوکی سشن next-auth
//     document.cookie =
//       "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=lax";
//     window.location.href = "/";
//   };

//   return (
//     <>
//       <header className="bg-eco-green dark:bg-eco-dark text-white dark:text-eco-light sticky top-0 z-40 shadow-md transition-colors duration-300">
//         <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">

//           {/* --- موبایل و تبلت: همبرگر + لوگو + آیکن‌ها --- */}
//           <div className="flex items-center justify-between lg:hidden">
//             {/* همبرگر + لوگو */}
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                 className="p-1 hover:bg-white/10 dark:hover:bg-gray-700 rounded transition-colors"
//               >
//                 {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//               </button>
//               <Link href="/" className="text-xl font-bold flex items-center gap-2">
//                 EcoVault
//               </Link>
//             </div>

//             {/* آیکن‌ها: Dark Mode + Wishlist + سبد خرید */}
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={toggleDarkMode}
//                 className="p-2 rounded hover:bg-white/10 dark:hover:bg-gray-700 transition-colors"
//               >
//                 {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
//               </button>

//               {/* Wishlist Icon - موبایل */}
//               <Link
//                 href="/wishlist"
//                 className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
//               >
//                 <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
//                 {wishlist.length > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
//                     {wishlist.length > 99 ? "99+" : wishlist.length}
//                   </span>
//                 )}
//               </Link>

//               {/* Cart Icon - موبایل */}
//               <button
//                 onClick={() => setCartOpen(true)}
//                 className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
//               >
//                 <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
//                 {totalItems > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
//                     {totalItems}
//                   </span>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* --- دسکتاپ: لوگو + Dark Mode + جستجو + آیکن‌ها --- */}
//           <div className="hidden lg:flex items-center justify-between gap-4">
//             <div className="flex items-center gap-6">
//               <Link href="/" className="text-2xl font-bold">
//                 EcoVault
//               </Link>
//               {/* Dark Mode Toggle */}
//               <button
//                 onClick={toggleDarkMode}
//                 className="p-2 rounded hover:bg-white/10 dark:hover:bg-gray-700 transition-colors"
//               >
//                 {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
//               </button>
//             </div>

//             {/* جستجو دسکتاپ */}
//             {showSearch && (
//               <div className="flex-1 max-w-md">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
//                   <input
//                     type="text"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     placeholder="Search products..."
//                     className="w-full pl-10 pr-4 py-2 rounded-lg text-eco-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-eco-accent text-sm"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* آیکن‌ها و ورود/خروج دسکتاپ */}
//             <div className="flex items-center gap-4">
//               {/* Wishlist Icon - دسکتاپ */}
//               <Link
//                 href="/wishlist"
//                 className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
//               >
//                 <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
//                 {wishlist.length > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
//                     {wishlist.length > 99 ? "99+" : wishlist.length}
//                   </span>
//                 )}
//               </Link>

//               {/* Cart Icon - دسکتاپ */}
//               <button
//                 onClick={() => setCartOpen(true)}
//                 className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
//               >
//                 <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
//                 {totalItems > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
//                     {totalItems}
//                   </span>
//                 )}
//               </button>

//               <div className="flex items-center gap-3">
//                 {/* منطق جدید: جلوگیری از نمایش دکمه‌های ورود در حالت loading */}
//                 {status === "loading" ? (
//                   <LoadingPlaceholder />
//                 ) : session ? (
//                   // دکمه‌های Dashboard و Logout
//                   <div className="flex items-center gap-3">

//                     {/* 🔥 تغییر دسکتاپ: استفاده از AvatarWithFallback */}
//                     <AvatarWithFallback
//                       image={session.user?.image}
//                       name={session.user?.name}
//                       size=""
//                       scale="small"
//                     />

//                     {/* دکمه Dashboard (نیمه‌شفاف) */}
//                     <Link
//                       href="/dashboard"
//                       className="flex items-center gap-1.5 bg-white/5 dark:bg-white/5 dark:hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-semibold
//                                 hover:bg-white/10 transition-all duration-300 shadow-sm hover:shadow-lg"
//                     >
//                       <LayoutDashboard className="w-4 h-4" />
//                       Dashboard
//                     </Link>

//                     {/* دکمه Logout (نیمه‌شفاف) */}
//                     <button
//                       onClick={handleLogout}
//                       className="flex items-center gap-1.5 bg-red-500/40 text-white px-3 py-1.5 rounded-lg text-sm font-semibold
//                                 hover:bg-red-500/50 transition-all duration-300 shadow-sm hover:shadow-lg"
//                     >
//                       <LogOut className="w-4 h-4" />
//                       Logout
//                     </button>
//                   </div>
//                 ) : (
//                   // دکمه‌های Sign In و Sign Up (شفاف شده)
//                   <div className="flex items-center gap-3">
//                     {/* دکمه Sign In (نیمه‌شفاف) */}
//                     <Link
//                       href="/auth/signin"
//                       className="bg-white/20 text-white px-4 py-1.5 rounded-lg font-semibold text-sm
//                                 hover:bg-white/30 transition-all duration-300 shadow-sm hover:shadow-md"
//                     >
//                       Sign In
//                     </Link>

//                     {/* دکمه Sign Up (نیمه‌شفاف با رنگ متمایز) */}
//                     <Link
//                       href="/auth/signin" // فرض بر این است که این صفحه هم Sign In و هم Sign Up را هندل می‌کند
//                       className="bg-eco-accent/40 text-white px-4 py-1.5 rounded-lg font-semibold text-sm
//                                 hover:bg-eco-accent/60 transition-all duration-300 shadow-md hover:shadow-lg"
//                     >
//                       Sign Up
//                     </Link>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* --- جستجوی موبایل و تبلت --- */}
//           {showSearch && (
//             <div className="lg:hidden mt-3 px-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
//                 <input
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   type="text"
//                   placeholder="Search products..."
//                   className="w-full pl-10 pr-4 py-2 rounded-lg text-eco-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-eco-accent text-sm"
//                 />
//               </div>
//             </div>
//           )}

//           {/* --- منوی موبایل و تبلت --- */}
//           {mobileMenuOpen && (
//             <div className="lg:hidden bg-eco-green/95 dark:bg-eco-dark/95 backdrop-blur-sm border-t border-white/20">
//               <div className="px-4 py-4 space-y-3">
//                 {/* منطق جدید: جلوگیری از نمایش دکمه‌های ورود در حالت loading */}
//                 {status === "loading" ? (
//                   <div className="h-20 flex items-center justify-center text-white/70">
//                     <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading User...
//                   </div>
//                 ) : session ? (
//                   <>
//                     <div className="flex items-center gap-3 pb-3 border-b border-white/20">
//                       {/* 🔥 تغییر موبایل: استفاده از AvatarWithFallback */}
//                       <AvatarWithFallback
//                         image={session.user?.image}
//                         name={session.user?.name}
//                         size=""
//                         scale="large"
//                       />

//                       <div className="flex-1">
//                         <p className="font-semibold text-white text-sm truncate">{session.user?.name}</p>

//                         {/* دکمه Dashboard (موبایل) */}
//                         <Link
//                           href="/dashboard"
//                           className="mt-2 flex items-center justify-center gap-1.5
//                                     bg-white/10 text-white px-3 py-1 rounded-lg text-xs font-medium
//                                     hover:bg-white/20 transition-all duration-300 w-fit"
//                           onClick={() => setMobileMenuOpen(false)}
//                         >
//                           <LayoutDashboard className="w-3 h-3" />
//                           View Dashboard
//                         </Link>
//                       </div>
//                     </div>

//                     {/* دکمه Logout (موبایل) - تغییر یافته برای زیبایی بیشتر */}
//                     <button
//                       onClick={handleLogout}
//                       className="w-full text-left text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-3
//                                     bg-red-500/20 hover:bg-red-500/40 transition-colors"
//                     >
//                       <LogOut className="w-4 h-4" />
//                       Logout
//                     </button>
//                   </>
//                 ) : (
//                   <div className="space-y-3">
//                     {/* دکمه Sign In (موبایل - شفاف) */}
//                     <Link
//                       href="/auth/signin"
//                       className="block w-full text-center bg-white/20 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-white/30 transition-colors shadow-sm"
//                       onClick={() => setMobileMenuOpen(false)}
//                     >
//                       Sign In
//                     </Link>
//                     {/* دکمه Sign Up (موبایل - شفاف) */}
//                     <Link
//                       href="/auth/signin"
//                       className="block w-full text-center bg-eco-accent/40 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-eco-accent/60 transition-colors shadow-sm"
//                       onClick={() => setMobileMenuOpen(false)}
//                     >
//                       Sign Up
//                     </Link>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </header>

//       <CartDropdown isOpen={cartOpen} onClose={() => setCartOpen(false)} />
//     </>
//   );
// }

// // "use client";

// // import { useState } from "react";
// // import { useCart } from "@/components/CartContext";
// // import CartDropdown from "@/components/cartDropdown";
// // import { ShoppingCart, Search, Menu, X, LogOut, Sun, Moon, Heart, LayoutDashboard, Loader2 } from "lucide-react";
// // import Link from "next/link";
// // import { usePathname } from "next/navigation";
// // import { useSession, signOut } from "next-auth/react";
// // import { useSearch } from "./SearchContext";
// // import { useTheme } from "@/components/ThemeContext";
// // import { useWishlist } from "@/components/WishList";

// // export default function Navbar() {
// //   const [cartOpen, setCartOpen] = useState(false);
// //   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
// //   const { totalItems } = useCart();
// //   const { wishlist } = useWishlist();
// //   const pathname = usePathname();
// //   // تغییر اصلی: اضافه کردن status برای مدیریت وضعیت loading
// //   const { data: session, status } = useSession();
// //   const { searchTerm, setSearchTerm } = useSearch();
// //   const { darkMode, toggleDarkMode } = useTheme();

// //   const showSearch = pathname === "/";

// //   const handleLogout = async () => {
// //     await signOut({ redirect: false });
// //     // تمیز کردن کوکی سشن next-auth
// //     document.cookie =
// //       "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=lax";
// //     window.location.href = "/";
// //   };

// //   // کامپوننت Placeholder برای حالت بارگذاری
// //   const LoadingPlaceholder = ({ isMobile = false }) => (
// //     <div
// //       className={`flex items-center justify-center ${isMobile ? 'h-10 w-full' : 'w-24 h-8'} bg-white/20 rounded-lg animate-pulse`}
// //     >
// //       {isMobile ? "Loading..." : ""}
// //     </div>
// //   );

// //   return (
// //     <>
// //       <header className="bg-eco-green dark:bg-eco-dark text-white dark:text-eco-light sticky top-0 z-40 shadow-md transition-colors duration-300">
// //         <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">

// //           {/* --- موبایل و تبلت: همبرگر + لوگو + آیکن‌ها --- */}
// //           <div className="flex items-center justify-between lg:hidden">
// //             {/* همبرگر + لوگو */}
// //             <div className="flex items-center gap-3">
// //               <button
// //                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
// //                 className="p-1 hover:bg-white/10 dark:hover:bg-gray-700 rounded transition-colors"
// //               >
// //                 {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
// //               </button>
// //               <Link href="/" className="text-xl font-bold flex items-center gap-2">
// //                 EcoVault
// //               </Link>
// //             </div>

// //             {/* آیکن‌ها: Dark Mode + Wishlist + سبد خرید */}
// //             <div className="flex items-center gap-3">
// //               <button
// //                 onClick={toggleDarkMode}
// //                 className="p-2 rounded hover:bg-white/10 dark:hover:bg-gray-700 transition-colors"
// //               >
// //                 {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
// //               </button>

// //               {/* Wishlist Icon - موبایل */}
// //               <Link
// //                 href="/wishlist"
// //                 className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
// //               >
// //                 <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
// //                 {wishlist.length > 0 && (
// //                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
// //                     {wishlist.length > 99 ? "99+" : wishlist.length}
// //                   </span>
// //                 )}
// //               </Link>

// //               {/* Cart Icon - موبایل */}
// //               <button
// //                 onClick={() => setCartOpen(true)}
// //                 className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
// //               >
// //                 <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
// //                 {totalItems > 0 && (
// //                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
// //                     {totalItems}
// //                   </span>
// //                 )}
// //               </button>
// //             </div>
// //           </div>

// //           {/* --- دسکتاپ: لوگو + Dark Mode + جستجو + آیکن‌ها --- */}
// //           <div className="hidden lg:flex items-center justify-between gap-4">
// //             <div className="flex items-center gap-6">
// //               <Link href="/" className="text-2xl font-bold">
// //                 EcoVault
// //               </Link>
// //               {/* Dark Mode Toggle */}
// //               <button
// //                 onClick={toggleDarkMode}
// //                 className="p-2 rounded hover:bg-white/10 dark:hover:bg-gray-700 transition-colors"
// //               >
// //                 {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
// //               </button>
// //             </div>

// //             {/* جستجو دسکتاپ */}
// //             {showSearch && (
// //               <div className="flex-1 max-w-md">
// //                 <div className="relative">
// //                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
// //                   <input
// //                     type="text"
// //                     value={searchTerm}
// //                     onChange={(e) => setSearchTerm(e.target.value)}
// //                     placeholder="Search products..."
// //                     className="w-full pl-10 pr-4 py-2 rounded-lg text-eco-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-eco-accent text-sm"
// //                   />
// //                 </div>
// //               </div>
// //             )}

// //             {/* آیکن‌ها و ورود/خروج دسکتاپ */}
// //             <div className="flex items-center gap-4">
// //               {/* Wishlist Icon - دسکتاپ */}
// //               <Link
// //                 href="/wishlist"
// //                 className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
// //               >
// //                 <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
// //                 {wishlist.length > 0 && (
// //                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
// //                     {wishlist.length > 99 ? "99+" : wishlist.length}
// //                   </span>
// //                 )}
// //               </Link>

// //               {/* Cart Icon - دسکتاپ */}
// //               <button
// //                 onClick={() => setCartOpen(true)}
// //                 className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
// //               >
// //                 <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
// //                 {totalItems > 0 && (
// //                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
// //                     {totalItems}
// //                   </span>
// //                 )}
// //               </button>

// //               <div className="flex items-center gap-3">
// //                 {/* منطق جدید: جلوگیری از نمایش دکمه‌های ورود در حالت loading */}
// //                 {status === "loading" ? (
// //                   <LoadingPlaceholder />
// //                 ) : session ? (
// //                   // دکمه‌های Dashboard و Logout
// //                   <div className="flex items-center gap-3">
// //                     <img
// //                       src={session.user?.image || "/default-avatar.png"}
// //                       alt={session.user?.name || "User"}
// //                       className="w-8 h-8 rounded-full border border-white shadow-md"
// //                       referrerPolicy="no-referrer"
// //                       width={32}
// //                       height={32}
// //                     />

// //                     {/* دکمه Dashboard (نیمه‌شفاف) */}
// //                     <Link
// //                       href="/dashboard"
// //                       className="flex items-center gap-1.5 bg-white/5 dark:bg-white/5 dark:hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-semibold
// //                                  hover:bg-white/10 transition-all duration-300 shadow-sm hover:shadow-lg"
// //                     >
// //                       <LayoutDashboard className="w-4 h-4" />
// //                       Dashboard
// //                     </Link>

// //                     {/* دکمه Logout (نیمه‌شفاف) */}
// //                     <button
// //                       onClick={handleLogout}
// //                       className="flex items-center gap-1.5 bg-red-500/40 text-white px-3 py-1.5 rounded-lg text-sm font-semibold
// //                                  hover:bg-red-500/50 transition-all duration-300 shadow-sm hover:shadow-lg"
// //                     >
// //                       <LogOut className="w-4 h-4" />
// //                       Logout
// //                     </button>
// //                   </div>
// //                 ) : (
// //                   // دکمه‌های Sign In و Sign Up (شفاف شده)
// //                   <div className="flex items-center gap-3">
// //                     {/* دکمه Sign In (نیمه‌شفاف) */}
// //                     <Link
// //                       href="/auth/signin"
// //                       className="bg-white/20 text-white px-4 py-1.5 rounded-lg font-semibold text-sm
// //                                  hover:bg-white/30 transition-all duration-300 shadow-sm hover:shadow-md"
// //                     >
// //                       Sign In
// //                     </Link>

// //                     {/* دکمه Sign Up (نیمه‌شفاف با رنگ متمایز) */}
// //                     <Link
// //                       href="/auth/signin" // فرض بر این است که این صفحه هم Sign In و هم Sign Up را هندل می‌کند
// //                       className="bg-eco-accent/40 text-white px-4 py-1.5 rounded-lg font-semibold text-sm
// //                                  hover:bg-eco-accent/60 transition-all duration-300 shadow-md hover:shadow-lg"
// //                     >
// //                       Sign Up
// //                     </Link>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           </div>

// //           {/* --- جستجوی موبایل و تبلت --- */}
// //           {showSearch && (
// //             <div className="lg:hidden mt-3 px-4">
// //               <div className="relative">
// //                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
// //                 <input
// //                   value={searchTerm}
// //                   onChange={(e) => setSearchTerm(e.target.value)}
// //                   type="text"
// //                   placeholder="Search products..."
// //                   className="w-full pl-10 pr-4 py-2 rounded-lg text-eco-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-eco-accent text-sm"
// //                 />
// //               </div>
// //             </div>
// //           )}

// //           {/* --- منوی موبایل و تبلت --- */}
// //           {mobileMenuOpen && (
// //             <div className="lg:hidden bg-eco-green/95 dark:bg-eco-dark/95 backdrop-blur-sm border-t border-white/20">
// //               <div className="px-4 py-4 space-y-3">
// //                 {/* منطق جدید: جلوگیری از نمایش دکمه‌های ورود در حالت loading */}
// //                 {status === "loading" ? (
// //                   <div className="h-20 flex items-center justify-center text-white/70">
// //                     <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading User...
// //                   </div>
// //                 ) : session ? (
// //                   <>
// //                     <div className="flex items-center gap-3 pb-3 border-b border-white/20">
// //                       <img
// //                         src={session.user?.image || "/default-avatar.png"}
// //                         alt={session.user?.name || "User"}
// //                         className="w-12 h-12 rounded-full border-2 border-white shadow-md"
// //                         referrerPolicy="no-referrer"
// //                       />
// //                       <div className="flex-1">
// //                         <p className="font-semibold text-white text-sm truncate">{session.user?.name}</p>

// //                         {/* دکمه Dashboard (موبایل) */}
// //                         <Link
// //                           href="/dashboard"
// //                           className="mt-2 flex items-center justify-center gap-1.5
// //                                      bg-white/10 text-white px-3 py-1 rounded-lg text-xs font-medium
// //                                      hover:bg-white/20 transition-all duration-300 w-fit"
// //                           onClick={() => setMobileMenuOpen(false)}
// //                         >
// //                           <LayoutDashboard className="w-3 h-3" />
// //                           View Dashboard
// //                         </Link>
// //                       </div>
// //                     </div>

// //                     {/* دکمه Logout (موبایل) - تغییر یافته برای زیبایی بیشتر */}
// //                     <button
// //                       onClick={handleLogout}
// //                       className="w-full text-left text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-3
// //                                  bg-red-500/20 hover:bg-red-500/40 transition-colors"
// //                     >
// //                       <LogOut className="w-4 h-4" />
// //                       Logout
// //                     </button>
// //                   </>
// //                 ) : (
// //                   <div className="space-y-3">
// //                     {/* دکمه Sign In (موبایل - شفاف) */}
// //                     <Link
// //                       href="/auth/signin"
// //                       className="block w-full text-center bg-white/20 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-white/30 transition-colors shadow-sm"
// //                       onClick={() => setMobileMenuOpen(false)}
// //                     >
// //                       Sign In
// //                     </Link>
// //                     {/* دکمه Sign Up (موبایل - شفاف) */}
// //                     <Link
// //                       href="/auth/signin"
// //                       className="block w-full text-center bg-eco-accent/40 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-eco-accent/60 transition-colors shadow-sm"
// //                       onClick={() => setMobileMenuOpen(false)}
// //                     >
// //                       Sign Up
// //                     </Link>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </header>

// //       <CartDropdown isOpen={cartOpen} onClose={() => setCartOpen(false)} />
// //     </>
// //   );
// // }
