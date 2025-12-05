// components/RelatedProducts.tsx
"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/skeleton/ProductSkeleton";
import type { EnhancedProduct } from "@/types";
import { productService } from "@/services/product.service";

interface RelatedProductsProps {
  relatedIds: number[] | null;
}

export default function RelatedProducts({ relatedIds }: RelatedProductsProps) {

console.log("relatedIds>>>>>>>>>>>>",relatedIds);

  const [relatedProducts, setRelatedProducts] = useState<EnhancedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!relatedIds || relatedIds.length === 0) {
      (function(){
         setLoading(false);
      })()
     
      return;
    }

    productService
      .getAll({ limit: 500 })
      .then((result) => {
        const filtered = result.products.filter((p): p is EnhancedProduct =>
          relatedIds.includes(p.id!)
        );
        setRelatedProducts(filtered);
      })
      .catch((err) => {
        console.error("Failed to load related products:", err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [relatedIds]);

  // اگر خطا یا چیزی نبود، هیچی نشون نده
  if (loading) {
    return (
      <div className="mt-8 sm:mt-12">
        <h2 className="text-xl sm:text-2xl font-bold text-eco-dark mb-4 sm:mb-6 dark:text-eco-light">
          Related Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 sm:mt-12">
      <h2 className="text-xl sm:text-2xl font-bold text-eco-dark mb-4 sm:mb-6 dark:text-eco-light">
        Related Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}