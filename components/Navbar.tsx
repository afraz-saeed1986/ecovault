
"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";
import CartDropdown from "@/components/cartDropdown";
import { ShoppingCart, Search, Menu, X, LogOut, Sun, Moon, Heart, LayoutDashboard } from "lucide-react"; // LayoutDashboard اضافه شد
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useSearch } from "./SearchContext";
import { useTheme } from "@/components/ThemeContext";
import { useWishlist } from "@/components/WishList";

export default function Navbar() {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { searchTerm, setSearchTerm } = useSearch();
  const { darkMode, toggleDarkMode } = useTheme();

  const showSearch = pathname === "/";

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
          
          {/* --- موبایل و تبلت: همبرگر + لوگو + آیکن‌ها --- */}
          <div className="flex items-center justify-between lg:hidden">
            {/* همبرگر + لوگو */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 hover:bg-white/10 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link href="/" className="text-xl font-bold flex items-center gap-2">
                EcoVault
              </Link>
            </div>

            {/* آیکن‌ها: Dark Mode + Wishlist + سبد خرید */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded hover:bg-white/10 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>

              {/* Wishlist Icon - موبایل */}
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

              {/* Cart Icon - موبایل */}
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

          {/* --- دسکتاپ: لوگو + Dark Mode + جستجو + آیکن‌ها --- */}
          <div className="hidden lg:flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-bold">
                EcoVault
              </Link>
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded hover:bg-white/10 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>
            </div>

            {/* جستجو دسکتاپ */}
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

            {/* آیکن‌ها و ورود/خروج دسکتاپ */}
            <div className="flex items-center gap-4">
              {/* Wishlist Icon - دسکتاپ */}
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

              {/* Cart Icon - دسکتاپ */}
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
                {session ? (
                  // دکمه‌های Dashboard و Logout (زیباتر شده)
                  <div className="flex items-center gap-3">
                    <img
                      src={session.user?.image || "/default-avatar.png"}
                      alt={session.user?.name || "User"}
                      className="w-8 h-8 rounded-full border border-white shadow-md"
                      referrerPolicy="no-referrer"
                      width={32}
                      height={32}
                    />
                    
                    {/* دکمه Dashboard (جدید و زیبا) */}
                    <Link 
                      href="/dashboard" 
                      className="flex items-center gap-1.5 bg-white text-eco-green px-3 py-1.5 rounded-full text-sm font-semibold 
                               hover:bg-eco-light/90 hover:text-eco-dark transition-all duration-300 shadow-sm hover:shadow-lg"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>

                    {/* دکمه Logout (زیبا) */}
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold 
                               hover:bg-red-600 transition-all duration-300 shadow-sm hover:shadow-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  // دکمه‌های Sign In و Sign Up (زیباتر شده)
                  <div className="flex items-center gap-3">
                    {/* دکمه Sign In (زیبا) */}
                    <Link 
                      href="/auth/signin" 
                      className="bg-white text-eco-green px-4 py-1.5 rounded-full font-semibold text-sm 
                               hover:bg-eco-light/90 hover:text-eco-dark transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      Sign In
                    </Link>
                    
                    {/* دکمه Sign Up (زیبا) */}
                    <Link
                      href="/auth/signup"
                      className="bg-eco-accent text-white px-4 py-1.5 rounded-full font-semibold text-sm 
                               hover:bg-eco-accent/90 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- جستجوی موبایل و تبلت --- */}
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

          {/* --- منوی موبایل و تبلت --- */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-eco-green/95 dark:bg-eco-dark/95 backdrop-blur-sm border-t border-white/20">
              <div className="px-4 py-4 space-y-3">
                {session ? (
                  <>
                    <div className="flex items-center gap-3 pb-3 border-b border-white/20">
                      <img
                        src={session.user?.image || "/default-avatar.png"}
                        alt={session.user?.name || "User"}
                        className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm truncate">{session.user?.name}</p>
                        
                        {/* دکمه Dashboard (موبایل) */}
                        <Link
                          href="/dashboard"
                          className="text-xs text-eco-light hover:text-white transition-colors flex items-center gap-1"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-3 h-3" />
                          View Dashboard
                        </Link>
                      </div>
                    </div>

                    {/* دکمه Logout (موبایل) */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-white hover:text-red-300 transition-colors py-2 text-sm font-medium flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    {/* دکمه Sign In (موبایل - زیبا) */}
                    <Link
                      href="/auth/signin"
                      className="block w-full text-center bg-white text-eco-green py-2.5 rounded-xl font-semibold text-sm hover:bg-eco-light/90 transition-colors shadow-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    {/* دکمه Sign Up (موبایل - زیبا) */}
                    <Link
                      href="/auth/signup"
                      className="block w-full text-center bg-eco-accent text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-eco-accent/90 transition-colors shadow-sm"
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
// import { ShoppingCart, Search, Menu, X, LogOut, Sun, Moon, Heart } from "lucide-react"; // Heart اضافه شد
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useSession, signOut } from "next-auth/react";
// import { useSearch } from "./SearchContext";
// import { useTheme } from "@/components/ThemeContext";
// import { useWishlist } from "@/components/WishList"; // جدید

// export default function Navbar() {
//   const [cartOpen, setCartOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const { totalItems } = useCart();
//   const { wishlist } = useWishlist(); // تعداد آیتم‌های wishlist
//   const pathname = usePathname();
//   const { data: session } = useSession();
//   const { searchTerm, setSearchTerm } = useSearch();
//   const { darkMode, toggleDarkMode } = useTheme();

//   const showSearch = pathname === "/";

//   const handleLogout = async () => {
//     await signOut({ redirect: false });
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
//                 {session ? (
//                   <>
//                     <img
//                       src={session.user?.image || "/default-avatar.png"}
//                       alt={session.user?.name || "User"}
//                       className="w-8 h-8 rounded-full border border-white"
//                       referrerPolicy="no-referrer"
//                       width={32}
//                       height={32}
//                     />
//                     <span className="text-sm font-medium hidden lg:inline">{session.user?.name}</span>
//                     <Link href="/dashboard" className="text-sm hover:underline hidden lg:inline">
//                       Dashboard
//                     </Link>
//                     <button onClick={handleLogout} className="text-sm hover:underline">
//                       Logout
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <Link href="/auth/signin" className="text-sm hover:underline">
//                       Sign In
//                     </Link>
//                     <Link
//                       href="/auth/signup"
//                       className="text-sm bg-white text-eco-green px-3 py-1 rounded-lg hover:bg-eco-light"
//                     >
//                       Sign Up
//                     </Link>
//                   </>
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
//                 {session ? (
//                   <>
//                     <div className="flex items-center gap-3 pb-3 border-b border-white/20">
//                       <img
//                         src={session.user?.image || "/default-avatar.png"}
//                         alt={session.user?.name || "User"}
//                         className="w-12 h-12 rounded-full border-2 border-white shadow-md"
//                         referrerPolicy="no-referrer"
//                       />
//                       <div className="flex-1">
//                         <p className="font-semibold text-white text-sm truncate">{session.user?.name}</p>
//                         <Link
//                           href="/dashboard"
//                           className="text-xs text-eco-light hover:text-white transition-colors"
//                           onClick={() => setMobileMenuOpen(false)}
//                         >
//                           View Dashboard
//                         </Link>
//                       </div>
//                     </div>

//                     <button
//                       onClick={handleLogout}
//                       className="w-full text-left text-white hover:text-eco-light transition-colors py-2 text-sm font-medium flex items-center gap-2"
//                     >
//                       <LogOut className="w-4 h-4" />
//                       Logout
//                     </button>
//                   </>
//                 ) : (
//                   <div className="space-y-3">
//                     <Link
//                       href="/auth/signin"
//                       className="block w-full text-center bg-white text-eco-green py-2.5 rounded-xl font-semibold text-sm hover:bg-eco-light transition-colors shadow-sm"
//                       onClick={() => setMobileMenuOpen(false)}
//                     >
//                       Sign In
//                     </Link>
//                     <Link
//                       href="/auth/signup"
//                       className="block w-full text-center bg-white/10 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
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



