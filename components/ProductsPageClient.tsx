// app/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Fuse from "fuse.js";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/skeleton/ProductSkeleton";
import { Filter, X } from "lucide-react";
import { useSearch } from "@/components/SearchContext";
import type { EnhancedProduct } from "@/types";

interface ApiResponse {
  products: EnhancedProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type CategoryItem = {
  id: string;
  name: string;
  icon?: string | null;
};

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const { searchTerm } = useSearch();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetch("/api/products?limit=200")
      .then((res) => res.json())
      .then((json: ApiResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("خطا در دریافت محصولات:", err);
        setLoading(false);
      });
  }, []);

  const products = data?.products ?? [];

  const categories = useMemo(() => {
    const map = new Map<string, CategoryItem>();
    products.forEach((p) => {
      const cats = p.categories as CategoryItem[] | null;
      cats?.forEach((cat) => {
        if (cat?.id && !map.has(cat.id)) {
          map.set(cat.id, { id: cat.id, name: cat.name, icon: cat.icon ?? undefined });
        }
      });
    });
    return Array.from(map.values());
  }, [products]);

  const fuse = useMemo(
    () =>
      new Fuse(products, {
        keys: ["name", "description", "short_description"],
        threshold: 0.3,
      }),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let results: EnhancedProduct[] = products;

    if (selectedCategory !== "all") {
      results = results.filter((p) => {
        const cats = p.categories as CategoryItem[] | null;
        return cats?.some((c) => c.id === selectedCategory) ?? false;
      });
    }

    if (searchTerm.trim()) {
      const searchResults = fuse.search(searchTerm);
      results = searchResults.map((r) => r.item);
    }

    return results;
  }, [products, searchTerm, selectedCategory, fuse]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* === MOBILE FILTER (فقط در زیر 1024px) === */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 text-left font-medium text-eco-dark shadow-sm hover:shadow transition-shadow"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter by Category
          </span>
          {mobileFilterOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <span className="text-sm text-gray-500">({categories.length})</span>
          )}
        </button>

        {mobileFilterOpen && (
          <div className="mt-3 bg-white rounded-xl shadow-lg border border-gray-100 p-4 space-y-2">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setMobileFilterOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
                selectedCategory === "all"
                  ? "bg-eco-green text-white shadow-sm"
                  : "hover:bg-eco-light text-eco-dark"
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setMobileFilterOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
                  selectedCategory === cat.id
                    ? "bg-eco-green text-white shadow-sm"
                    : "hover:bg-eco-light text-eco-dark"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* === MAIN LAYOUT === */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* === DESKTOP SIDEBAR (فقط در 1024px و بالاتر) === */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <h3 className="font-semibold text-lg mb-4 dark:text-eco-light">Filter by Category</h3>
          <button
            onClick={() => setSelectedCategory("all")}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all mb-2 dark:text-eco-light dark:hover:text-eco-darkest ${
              selectedCategory === "all"
                ? "bg-eco-green text-white shadow-md"
                : "hover:bg-eco-green hover:text-eco-light dark:hover:text-eco-light"
            }`}
          >
            All Products
          </button>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 transition-all dark:text-eco-light dark:hover:text-eco-darkest ${
                    selectedCategory === cat.id
                      ? "bg-eco-green text-white shadow-md"
                      : "hover:bg-eco-green hover:text-eco-light dark:hover:text-eco-light"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* === PRODUCTS GRID === */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No products found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}



// // components/ProductsPageClient.tsx
// "use client";

// import { useState, useEffect, useMemo } from "react";
// import ProductCard from "@/components/ProductCard";
// import ProductSkeleton from "@/components/skeleton/ProductSkeleton";
// import { Filter, X } from "lucide-react";
// import type { EnhancedProduct } from "@/types";

// interface ApiResponse {
//   products: EnhancedProduct[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

// // نوع دقیق category که از View میاد
// type CategoryItem = {
//   id: string;
//   name: string;
//   icon?: string | null;
// };

// export default function ProductsPageClient() {
//   const [data, setData] = useState<ApiResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

//   useEffect(() => {
//     fetch("/api/products?limit=200")
//       .then((res) => res.json())
//       .then((json: ApiResponse) => {
//         setData(json);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch products:", err);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   const products = data?.products ?? [];

//   // استخراج دسته‌بندی‌ها بدون any
//   const categories = useMemo(() => {
//     const map = new Map<string, CategoryItem>();
//     products.forEach((product) => {
//       const cats = product.categories as CategoryItem[] | null;
//       cats?.forEach((cat) => {
//         if (cat?.id && !map.has(cat.id)) {
//           map.set(cat.id, { id: cat.id, name: cat.name, icon: cat.icon ?? undefined });
//         }
//       });
//     });
//     return Array.from(map.values());
//   }, [products]);

//   // فیلتر دسته‌بندی بدون any
//   const filteredProducts = useMemo(() => {
//     if (selectedCategory === "all") return products;

//     return products.filter((product) => {
//       const cats = product.categories as CategoryItem[] | null;
//       return cats?.some((cat) => cat.id === selectedCategory) ?? false;
//     });
//   }, [products, selectedCategory]);

//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {Array(8)
//             .fill(0)
//             .map((_, i) => (
//               <ProductSkeleton key={i} />
//             ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       {/* موبایل فیلتر */}
//       <div className="lg:hidden mb-6">
//         <button
//           onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
//           className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 text-left font-medium text-eco-dark shadow-sm hover:shadow transition-shadow"
//         >
//           <span className="flex items-center gap-2">
//             <Filter className="w-5 h-5" />
//             فیلتر دسته‌بندی
//           </span>
//           {mobileFilterOpen ? <X className="w-5 h-5" /> : <span className="text-sm text-gray-500">({categories.length})</span>}
//         </button>

//         {mobileFilterOpen && (
//           <div className="mt-3 bg-white rounded-xl shadow-lg border border-gray-100 p-4 space-y-2">
//             <button
//               onClick={() => {
//                 setSelectedCategory("all");
//                 setMobileFilterOpen(false);
//               }}
//               className={`w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
//                 selectedCategory === "all" ? "bg-eco-green text-white" : "hover:bg-eco-light text-eco-dark"
//               }`}
//             >
//               همه محصولات
//             </button>
//             {categories.map((cat) => (
//               <button
//                 key={cat.id}
//                 onClick={() => {
//                   setSelectedCategory(cat.id);
//                   setMobileFilterOpen(false);
//                 }}
//                 className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
//                   selectedCategory === cat.id ? "bg-eco-green text-white" : "hover:bg-eco-light text-eco-dark"
//                 }`}
//               >
//                 {cat.icon && <span>{cat.icon}</span>}
//                 <span>{cat.name}</span>
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* دسکتاپ سایدبار + گرید */}
//       <div className="flex flex-col lg:flex-row gap-8">
//         <aside className="hidden lg:block w-64">
//           <h3 className="font-semibold text-lg mb-4">فیلتر دسته‌بندی</h3>
//           <button
//             onClick={() => setSelectedCategory("all")}
//             className={`w-full text-left px-4 py-2.5 rounded-lg mb-2 transition-all ${
//               selectedCategory === "all" ? "bg-eco-green text-white" : "hover:bg-eco-green hover:text-white"
//             }`}
//           >
//             همه محصولات
//           </button>
//           {categories.map((cat) => (
//             <button
//               key={cat.id}
//               onClick={() => setSelectedCategory(cat.id)}
//               className={`w-full text-left block px-4 py-2 rounded-lg mb-1 transition-all ${
//                 selectedCategory === cat.id ? "bg-eco-green text-white" : "hover:bg-eco-green hover:text-white"
//               }`}
//             >
//               {cat.icon && <span className="mr-2">{cat.icon}</span>}
//               {cat.name}
//             </button>
//           ))}
//         </aside>

//         <main className="flex-1">
//           {filteredProducts.length === 0 ? (
//             <p className="text-center text-gray-500 py-16 text-lg">محصولی یافت نشد.</p>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {filteredProducts.map((product) => (
//                 <ProductCard key={product.id} product={product} />
//               ))}
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }