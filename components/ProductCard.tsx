// components/ProductCard.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Users, Heart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishList";
import type { EnhancedProduct } from "@/types";

interface ProductCardProps {
  product: EnhancedProduct;
}



export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const avgRating = product.reviewCount > 0
    ? product.avgRating.toFixed(1)
    : "—";

  const categoryNames = product.categories
    ? (product.categories as Array<{ name: string }>).map(c => c.name).slice(0, 2).join(" • ")
    : "";

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer group flex flex-col h-full"
    >
    <Link href={`/product/${product.id}`} className="block flex-1">
        <div className="relative h-40 sm:h-48 bg-gray-100">
          <Image
            src={product.mainImage || "/images/fallback-product.jpg"}
            alt={product.name || "Product"}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Heart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`
              absolute top-2 left-2 p-1.5 sm:p-2 rounded-full
              bg-white/90 backdrop-blur-sm shadow-md
              transition-all duration-200 hover:scale-110 z-10
              ${inWishlist ? "text-red-500" : "text-gray-600"}
            `}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${inWishlist ? "fill-current" : ""}`} />
          </button>

          {/* Sustainability Score */}
          {product.sustainability_score !== null && (
            <div className="absolute top-2 right-2 bg-eco-green text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium text-center min-w-[32px]">
              {product.sustainability_score}%
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <p className="text-xs text-eco-blue uppercase font-medium truncate">
            {categoryNames}
          </p>
          <h3 className="font-semibold text-base sm:text-lg mt-1 line-clamp-2 flex-1">
            {product.name || "Unnamed Product"}
          </h3>

          <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
            <div className="flex items-center">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-eco-accent text-eco-accent" />
              <span className="text-xs sm:text-sm font-medium ml-0.5 sm:ml-1">{avgRating}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm ml-0.5 sm:ml-1">({product.reviewCount})</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 sm:mt-3">
            <span className="text-xl sm:text-2xl font-bold text-eco-dark">
              ${product.price?.toLocaleString() || "0"}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-3 sm:p-4 pt-0">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product); // این خط درست شد!
          }}
          disabled={!product.inStock}
          className={`w-full px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
            product.inStock
              ? "bg-eco-green text-white hover:bg-eco-dark"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </motion.div>
  );
}