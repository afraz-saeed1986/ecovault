
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/components/WishList";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ArrowLeft, Heart, X, Loader2 } from "lucide-react";
import WishlistSkeleton from "@/components/skeleton/WishlistSkeleton";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = async (id: number) => {
    setRemovingId(id);
    await new Promise((resolve) => setTimeout(resolve, 300));
    removeFromWishlist(id);
    setRemovingId(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-eco-darkest">
      {/* Sticky Header - فقط در روشن سفید، در دارک تیره */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm ">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
             <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-eco-green transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({wishlist.length} {wishlist.length === 1 ? "item" : "items"})
              </span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content - جزیره وسط در دارک مود */}
      <main className="flex-1 flex items-start justify-center py-8 sm:py-10 dark:bg-eco-darkest dark:border-eco-dark/80">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-center">
              {[...Array(4)].map((_, i) => (
                <WishlistSkeleton key={i} />
              ))}
            </div>
          ) : wishlist.length === 0 ? (
            /* Empty State - وسط صفحه */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 sm:py-24 max-w-md mx-auto"
            >
              <div className="mx-auto w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-eco-green/10 to-eco-accent/10 rounded-full flex items-center justify-center mb-8 dark:from-eco-green/20 dark:to-eco-accent/20">
                <Heart className="w-14 h-14 sm:w-16 sm:h-16 text-eco-green/60 dark:text-eco-green/70" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-10 text-sm sm:text-base">
                Discover eco-friendly products and save your favorites for later.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-eco-green text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-eco-dark transition-all hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Start Exploring
              </Link>
            </motion.div>
          ) : (
            /* Product Grid - وسط و فاصله از چپ و راست */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-center mx-auto"
            >
              <AnimatePresence>
                {wishlist.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="relative group"
                  >
                    {/* Remove Button */}
                    <button
                      onClick={() => product.id && handleRemove(product.id)}
                      disabled={removingId === product.id}
                      className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 disabled:opacity-50 dark:bg-eco-dark/90 dark:text-gray-300"
                      aria-label="Remove from wishlist"
                    >
                      {removingId === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
                      ) : (
                        <X className="w-4 h-4 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400" />
                      )}
                    </button>

                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* CTA - همیشه وسط */}
          {wishlist.length > 0 && (
            <div className="mt-12 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-eco-green hover:text-eco-dark font-medium transition-colors dark:text-eco-accent dark:hover:text-eco-green"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}





// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useWishlist } from "@/components/WishList";
// import ProductCard from "@/components/ProductCard";
// import Link from "next/link";
// import { ArrowLeft, Heart, X, Loader2 } from "lucide-react";
// import WishlistSkeleton from "@/components/skeleton/WishlistSkeleton";

// export default function WishlistPage() {
//   const { wishlist, removeFromWishlist } = useWishlist();
//   const [isLoading, setIsLoading] = useState(true);
//   const [removingId, setRemovingId] = useState<number | null>(null);

//   // شبیه‌سازی لودینگ (در پروژه واقعی از API استفاده کن)
//   useEffect(() => {
//     const timer = setTimeout(() => setIsLoading(false), 600);
//     return () => clearTimeout(timer);
//   }, []);

//   const handleRemove = async (id: number) => {
//     setRemovingId(id);
//     await new Promise((resolve) => setTimeout(resolve, 300)); // انیمیشن
//     removeFromWishlist(id);
//     setRemovingId(null);
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-eco-darkest">
//       {/* Sticky Header */}

//       <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex items-center justify-between">
//             <Link
//               href="/"
//               className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-eco-green transition-colors"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Back to Home
//             </Link>
//             <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
//               My Wishlist
//               <span className="ml-2 text-sm font-normal text-gray-500">
//                 ({wishlist.length} {wishlist.length === 1 ? "item" : "items"})
//               </span>
//             </h1>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 dark:bg-eco-darkest">
//         {/* Loading State */}
//         {isLoading ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
//             {[...Array(4)].map((_, i) => (
//               <WishlistSkeleton key={i} />
//             ))}
//           </div>
//         ) : wishlist.length === 0 ? (
//           /* Enhanced Empty State */
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center py-20 sm:py-24"
//           >
//             <div className="mx-auto w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-eco-green/10 to-eco-accent/10 rounded-full flex items-center justify-center mb-8">
//               <Heart className="w-14 h-14 sm:w-16 sm:h-16 text-eco-green/60" />
//             </div>
//             <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
//               Your wishlist is empty
//             </h2>
//             <p className="text-gray-600 mb-10 max-w-md mx-auto text-sm sm:text-base">
//               Discover eco-friendly products and save your favorites for later.
//             </p>
//             <Link
//               href="/"
//               className="inline-flex items-center gap-2 bg-eco-green text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-eco-dark transition-all hover:shadow-lg transform hover:-translate-y-0.5"
//             >
//               Start Exploring
//             </Link>
//           </motion.div>
//         ) : (
//           /* Animated Product Grid */
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ staggerChildren: 0.1 }}
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
//           >
//             <AnimatePresence>
//               {wishlist.map((product) => (
//                 <motion.div
//                   key={product.id}
//                   layout
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.9, y: -20 }}
//                   transition={{ duration: 0.3 }}
//                   className="relative group"
//                 >
//                   {/* Remove Button */}
//                   <button
//                     onClick={() => handleRemove(product.id)}
//                     disabled={removingId === product.id}
//                     className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 disabled:opacity-50"
//                     aria-label="Remove from wishlist"
//                   >
//                     {removingId === product.id ? (
//                       <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
//                     ) : (
//                       <X className="w-4 h-4 text-gray-600 hover:text-red-500" />
//                     )}
//                   </button>

//                   <ProductCard product={product} />
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           </motion.div>
//         )}

//         {/* Always Visible CTA */}
//         {wishlist.length > 0 && (
//           <div className="mt-12 text-center">
//             <Link
//               href="/"
//               className="inline-flex items-center gap-2 text-eco-green hover:text-eco-dark font-medium transition-colors"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Continue Shopping
//             </Link>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// /* Skeleton Card Component */
// // function SkeletonCard() {
// //   return (
// //     <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
// //       <div className="h-48 sm:h-56 bg-gray-200" />
// //       <div className="p-4 space-y-3">
// //         <div className="h-4 bg-gray-200 rounded w-3/4" />
// //         <div className="h-3 bg-gray-200 rounded w-1/2" />
// //         <div className="h-8 bg-gray-200 rounded mt-4" />
// //       </div>
// //     </div>
// //   );
// // }