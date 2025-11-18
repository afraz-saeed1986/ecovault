"use client"
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Users, Heart } from "lucide-react"; // Heart اضافه شد
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishList";
import { Product } from "@/types";


export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist(); // جدید
  const inWishlist = isInWishlist(product.id); // وضعیت فعلی

  const avgRating = product.reviews.length > 0
    ? (product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length).toFixed(1)
    : "—";

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer group flex flex-col h-full"
    >
      <Link href={`/product/${product.id}`} className="block flex-1">
        <div className="relative h-40 sm:h-48 bg-gray-100">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* دکمه Heart - دقیقاً روی تصویر، بالای sustainability badge */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`
              absolute top-2 left-2 p-1.5 sm:p-2 rounded-full
              bg-white/90 backdrop-blur-sm shadow-md
              transition-all duration-200 hover:scale-110
              ${inWishlist ? "text-red-500" : "text-gray-600"}
            `}
            aria-label={inWishlist ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}
          >
            <Heart 
              className={`w-4 h-4 sm:w-5 sm:h-5 ${inWishlist ? "fill-current" : ""}`} 
            />
          </button>

          {/* sustainability badge - همون قبلی، فقط left-2 شد */}
          <div className="absolute top-2 right-2 bg-eco-green text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium text-center min-w-[32px]">
            {product.sustainabilityScore}%
          </div>
        </div>

        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <p className="text-xs text-eco-blue uppercase font-medium truncate">
            {product.categories.slice(0, 2).join(" • ")}
          </p>
          <h3 className="font-semibold text-base sm:text-lg mt-1 line-clamp-2 flex-1">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
            <div className="flex items-center">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-eco-accent text-eco-accent" />
              <span className="text-xs sm:text-sm font-medium ml-0.5 sm:ml-1">{avgRating}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm ml-0.5 sm:ml-1">({product.reviews.length})</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 sm:mt-3">
            <span className="text-xl sm:text-2xl font-bold text-eco-dark">${product.price}</span>
          </div>
        </div>
      </Link>

      <div className="p-3 sm:p-4 pt-0">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product);
          }}
          className="w-full bg-eco-green text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-eco-dark transition-colors text-xs sm:text-sm font-medium"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}



// "use client"
// import { motion } from "framer-motion";
// import Image from "next/image";
// import { Star, Users } from "lucide-react";
// import Link from "next/link";
// import { useCart } from "@/components/CartContext";

// interface Review {
//   user: string;
//   rating: number;
//   comment: string;
// }

// interface Product {
//   id: number;
//   name: string;
//   price: number;
//   categories: string[];
//   images: string[];
//   description: string;
//   reviews: Review[];
//   sustainabilityScore: number;
//   relatedProducts: number[];
// }

// export default function ProductCard({ product }: { product: Product }) {
//   const {addToCart} = useCart();
//   const avgRating = product.reviews.length > 0
//     ? (product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length).toFixed(1)
//     : "—";

//   return (
//     <motion.div
//       whileHover={{ y: -6, scale: 1.02 }}
//       transition={{ duration: 0.3 }}
//       className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer group flex flex-col h-full"
//     >
//         <Link href={`/product/${product.id}`} className="block flex-1">
//           <div className="relative h-40 sm:h-48 bg-gray-100">
//             <Image
//               src={product.images[0]}
//               alt={product.name}
//               fill
//               className="object-cover group-hover:scale-110 transition-transform duration-300"
//               sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
//             />
//             <div className="absolute top-2 right-2 bg-eco-green text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium text-center min-w-[32px]">
//               {product.sustainabilityScore}%
//             </div>
//           </div>

//           <div className="p-3 sm:p-4 flex-1 flex flex-col">
//             <p className="text-xs text-eco-blue uppercase font-medium truncate">
//               {product.categories.slice(0, 2).join(" • ")}
//             </p>
//             <h3 className="font-semibold text-base sm:text-lg mt-1 line-clamp-2 flex-1">
//               {product.name}
//             </h3>

//             <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
//               <div className="flex items-center">
//                 <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-eco-accent text-eco-accent" />
//                 <span className="text-xs sm:text-sm font-medium ml-0.5 sm:ml-1">{avgRating}</span>
//               </div>
//               <div className="flex items-center text-gray-600">
//                 <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                 <span className="text-xs sm:text-sm ml-0.5 sm:ml-1">({product.reviews.length})</span>
//               </div>
//             </div>

//             <div className="flex items-center justify-between mt-2 sm:mt-3">
//               <span className="text-xl sm:text-2xl font-bold text-eco-dark">${product.price}</span>
//             </div>
//           </div>
//         </Link>
//         <div className="p-3 sm:p-4 pt-0">
//           <button 
//            onClick={(e) => {
//             e.preventDefault();
//             e.stopPropagation();
//             addToCart(product);
//            }}
//            className="w-full bg-eco-green text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-eco-dark transition-colors text-xs sm:text-sm font-medium"
//           >
//             Add to Cart
//           </button>
//         </div>
//     </motion.div>
//   );
// }