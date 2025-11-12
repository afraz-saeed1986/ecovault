"use client"

import { Star, Recycle, Leaf, ShoppingCart } from "lucide-react";
import ProductGallery from "@/components/ProductGallery";
import RelatedProducts from "@/components/RelatedProducts";
import { useCart } from "@/components/CartContext";

interface Review {
  user: string; 
  rating: number; 
  comment: string
}

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    categories: string[];
    images: string[];
    reviews: Review[];
    sustainabilityScore: number;
    relatedProducts: number[];
}



export default function ProductClient({product} : {product: Product}){
  const { addToCart } = useCart();

   const avgRating =
    product.reviews.reduce((a: number, r: Review) => a + r.rating, 0) /
    product.reviews.length;

    return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery images={product.images} name={product.name} />

        {/* Informaitions */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-eco-blue uppercase font-medium">
              {product.categories.join(" . ")}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-eco-dark mt-1">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Star className="w-5 h-5 fill-eco-accent text-eco-accent" />
              <span className="ml-1 font-semibold">{avgRating.toFixed(1)}</span>
              <span className="ml-1 text-gray-600">
                ({product.reviews.length} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="text-3xl sm:text-4xl font-bold text-eco-dark">
            ${product.price}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Green Features */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 text-eco-green">
              <Leaf className="w-5 h-5" />
              <span className="text-sm">Eco-Friendly</span>
            </div>
            <div className="flex items-center gap-2 text-eco-green">
              <Recycle className="w-5 h-5" />
              <span className="text-sm">Recyclable</span>
            </div>
          </div>

          {/* BY Button */}
          <button
            onClick={() => addToCart(product)}
            className="w-full bg-eco-green text-white py-3 rounded-lg font-semibold hover:bg-eco-dark transition-colors text-base sm:text-lg"
            aria-label={`Add ${product.name} to cart`}
          >
            Add to cart
          </button>

          {/* Sustainability Score */}
          <div className="bg-eco-light/20 p-5 rounded-xl border border-eco-light/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <span className="font-semibold text-eco-dark">
                Sustainability Score
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-eco-green">
                {product.sustainabilityScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-eco-green to-eco-dark h-full rounded-full transition-all duration-1000"
                style={{ width: `${product.sustainabilityScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Comments */}
      <div className="mt-12 sm:mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-eco-dark mb-6">
          Customer Reviews
        </h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {product.reviews.map((review: Review, i: number) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-3">
                <div>
                  <p className="font-semibold text-eco-dark">{review.user}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className={`w-4 h-4 ${
                          j < Math.floor(review.rating)
                            ? "fill-eco-accent text-eco-accent"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-600">
                      {review.rating}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Related products */}
      <section className="mt-12 sm:mt-16">
        <RelatedProducts relatedIds={product.relatedProducts} />
      </section>
    </div>
  );

}