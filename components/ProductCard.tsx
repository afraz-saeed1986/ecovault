"use client"
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Users } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

interface Review {
  user: string;
  rating: number;
  comment: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  categories: string[];
  images: string[];
  description: string;
  reviews: Review[];
  sustainabilityScore: number;
  relatedProducts: number[];
}

export default function ProductCard({ product }: { product: Product }) {
  const {addToCart} = useCart();
  const avgRating = product.reviews.length > 0
    ? (product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length).toFixed(1)
    : "—";

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer group"
    >
        <Link href={`/product/${product.id}`} className="block">
                  <div className="relative h-48 bg-gray-100">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute top-2 right-2 bg-eco-green text-white text-xs px-2 py-1 rounded-full font-medium">
          {product.sustainabilityScore}%
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs text-eco-blue uppercase font-medium truncate">
          {product.categories.slice(0, 2).join(" • ")}
        </p>
        <h3 className="font-semibold text-lg mt-1 line-clamp-2">{product.name}</h3>

        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-eco-accent text-eco-accent" />
            <span className="text-sm font-medium ml-1">{avgRating}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm ml-1">({product.reviews.length})</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-2xl font-bold text-eco-dark">${product.price}</span>
        </div>
      </div>
        </Link>
        <div className="p-4 pt-0">
          <button 
           onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product);
           }}
           className="bg-eco-green text-white px-4 py-2 rounded-lg hover:bg-eco-dark transition-colors text-sm font-medium">
            Add to Cart
          </button>
        </div>
    </motion.div>
  );
}