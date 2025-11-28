"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Fuse from "fuse.js";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/skeleton/ProductSkeleton";
import { Filter, X } from "lucide-react";
import { useSearch } from "@/components/SearchContext";
import { useInView } from "react-intersection-observer";
import type { EnhancedProduct, ProductCategory } from "@/types";

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
  const { searchTerm } = useSearch();

  const [products, setProducts] = useState<EnhancedProduct[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.2 });

  // فقط یک بار در اولین لود
  const fetchInitialData = useCallback(async () => {
    try {
      const res = await fetch("/api/products?limit=200");
      if (!res.ok) throw new Error("Failed");
      const json: ApiResponse = await res.json();
      const prods = Array.isArray(json.products) ? json.products : [];

      const catMap = new Map<string, CategoryItem>();
      prods.forEach((p) => {
        const cats = Array.isArray(p.categories) ? p.categories : [];
        cats.forEach((cat) => {
          // اصلاح: بررسی نوع و ساختار cat
          if (cat && typeof cat === 'object' && 'id' in cat && 'name' in cat) {
            const category = cat as ProductCategory;
            if (category.id && !catMap.has(category.id)) {
              catMap.set(category.id, { 
                id: category.id, 
                name: category.name, 
                icon: category.icon ?? undefined 
              });
            }
          }
        });
      });
      setAllCategories(Array.from(catMap.values()));

      setProducts(prods.slice(0, 6));
      setTotalPages(Math.ceil(prods.length / 6));
      setLoading(false);
    } catch (err) {
      console.error("خطا در لود اولیه:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // بقیه کد بدون تغییر...
  // fetchPage با category به عنوان آرگومان
  const fetchPage = useCallback(
    async (pageNumber: number, category: string, reset: boolean = false) => {
      try {
        const url = `/api/products?page=${pageNumber}&limit=6${category !== "all" ? `&category=${category}` : ""}`;
        console.log("Fetching:", url); // برای دیباگ
        
        const res = await fetch(url);
        if (!res.ok) {
          console.error("API error:", res.status);
          return;
        }
        const json: ApiResponse = await res.json();
        const newProducts = Array.isArray(json.products) ? json.products : [];

        setProducts((prev) => (reset ? newProducts : [...prev, ...newProducts]));
        setTotalPages(json.totalPages ?? 1);
      } catch (err) {
        console.error("خطا:", err);
      }
    },
    []
  );

  // وقتی دسته‌بندی تغییر کرد - محصولات قبلی پاک شوند
  useEffect(() => {
    setLoading(true);
    setProducts([]);
    setPage(1);
    fetchPage(1, selectedCategory, true).finally(() => setLoading(false));
  }, [selectedCategory, fetchPage]);

  // lazy-loading
  useEffect(() => {
    if (inView && !loadingMore && !loading && page < totalPages) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPage(nextPage, selectedCategory).finally(() => setLoadingMore(false));
    }
  }, [inView, loadingMore, page, totalPages, fetchPage, loading, selectedCategory]);

  // جستجو
  const fuse = useMemo(() => new Fuse(products, { keys: ["name", "description"], threshold: 0.3 }), [products]);
  const filteredProducts = useMemo(() => {
    if (searchTerm.trim()) return fuse.search(searchTerm).map((r) => r.item);
    return products;
  }, [products, searchTerm, fuse]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Mobile Filter */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 text-left font-medium text-eco-dark shadow-sm hover:shadow transition-shadow"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter by Category
          </span>
          {mobileFilterOpen ? <X className="w-5 h-5" /> : <span className="text-sm text-gray-500">({allCategories.length})</span>}
        </button>

        {mobileFilterOpen && (
          <div className="mt-3 bg-white rounded-xl shadow-lg border border-gray-100 p-4 space-y-2">
            <button
              onClick={() => { setSelectedCategory("all"); setMobileFilterOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${selectedCategory === "all" ? "bg-eco-green text-white" : "hover:bg-eco-light text-eco-dark"}`}
            >
              All Products
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setMobileFilterOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${selectedCategory === cat.id ? "bg-eco-green text-white" : "hover:bg-eco-light text-eco-dark"}`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <h3 className="font-semibold text-lg mb-4 dark:text-eco-light">Filter by Category</h3>
          <button
            onClick={() => setSelectedCategory("all")}
            className={`w-full text-left dark:text-eco-light px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all mb-2 ${selectedCategory === "all" ? "bg-eco-green text-white shadow-md" : "hover:bg-eco-green hover:text-white"}`}
          >
            All Products
          </button>
          <ul className="space-y-2">
            {allCategories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg dark:text-eco-light flex items-center gap-2 transition-all ${selectedCategory === cat.id ? "bg-eco-green text-white shadow-md" : "hover:bg-eco-green hover:text-white"}`}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  <span>{cat.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Products */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No products found.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div ref={loadMoreRef} className="py-10 text-center">
                {loadingMore && <ProductSkeleton />}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}




// "use client";
// import { useState, useMemo, useEffect, useCallback } from "react";
// import Fuse from "fuse.js";
// import ProductCard from "@/components/ProductCard";
// import ProductSkeleton from "@/components/skeleton/ProductSkeleton";
// import { Filter, X } from "lucide-react";
// import { useSearch } from "@/components/SearchContext";
// import { useInView } from "react-intersection-observer";
// import type { EnhancedProduct } from "@/types";

// interface ApiResponse {
//   products: EnhancedProduct[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

// type CategoryItem = {
//   id: string;
//   name: string;
//   icon?: string | null;
// };

// export default function Home() {
//   const { searchTerm } = useSearch();
//   const [products, setProducts] = useState<EnhancedProduct[]>([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
//   const { ref: loadMoreRef, inView } = useInView({ threshold: 0.2 });

//   // ==========================
//   // Fetch page function (فقط اینجا تغییر دادم)
//   // ==========================
//   const fetchPage = useCallback(
//     async (pageNumber: number) => {
//       try {
//         const res = await fetch(
//           `/api/products?page=${pageNumber}&limit=6${
//             selectedCategory !== "all" ? `&category=${selectedCategory}` : ""
//           }`
//         );

//         if (!res.ok) {
//           console.error("API error:", res.status, res.statusText);
//           return;
//         }

//         const json: ApiResponse = await res.json();

//         // محافظت کامل در برابر products undefined یا null
//         const newProductsFromApi = Array.isArray(json.products) ? json.products : [];

//         setProducts((prev) => {
//           const ids = new Set(prev.map((p) => p.id));
//           const newProducts = newProductsFromApi.filter((p) => !ids.has(p.id));
//           return [...prev, ...newProducts];
//         });

//         // اگر totalPages هم نیومد، حداقل 1 بذار تا لوپ lazy loading خراب نشه
//         setTotalPages(json.totalPages ?? 1);
//       } catch (err) {
//         console.error("خطا در دریافت محصولات:", err);
//       }
//     },
//     [selectedCategory]
//   );

//   // ==========================
//   // اولین بار
//   // ==========================
//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       setProducts([]);
//       setPage(1);
//       await fetchPage(1);
//       setLoading(false);
//     })();
//   }, [fetchPage]);

//   // ==========================
//   // وقتی دسته‌بندی تغییر کند
//   // ==========================
//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       setProducts([]);
//       setPage(1);
//       await fetchPage(1);
//       setLoading(false);
//     })();
//   }, [selectedCategory, fetchPage]);

//   // ==========================
//   // lazy loading صفحه بعد
//   // ==========================
//   useEffect(() => {
//     if (inView && !loadingMore && page < totalPages) {
//       (async () => {
//         setLoadingMore(true);
//         const nextPage = page + 1;
//         setPage(nextPage);
//         await fetchPage(nextPage);
//         setLoadingMore(false);
//       })();
//     }
//   }, [inView, loadingMore, page, totalPages, fetchPage]);

//   // ==========================
//   // استخراج دسته‌بندی‌ها بدون خطا
//   // ==========================
//   const categories = useMemo(() => {
//     const map = new Map<string, CategoryItem>();
//     products.forEach((p) => {
//       const cats = Array.isArray(p.categories) ? p.categories : [];
//       cats.forEach((cat) => {
//         if (cat?.id && !map.has(cat.id)) {
//           map.set(cat.id, {
//             id: cat.id,
//             name: cat.name,
//             icon: cat.icon ?? undefined,
//           });
//         }
//       });
//     });
//     return Array.from(map.values());
//   }, [products]);

//   // ==========================
//   // Fuse.js برای سرچ
//   // ==========================
//   const fuse = useMemo(
//     () =>
//       new Fuse(products, {
//         keys: ["name", "description", "short_description"],
//         threshold: 0.3,
//       }),
//     [products]
//   );

//   // ==========================
//   // فیلتر + سرچ
//   // ==========================
//   const filteredProducts = useMemo(() => {
//     if (searchTerm.trim()) {
//       return fuse.search(searchTerm).map((r) => r.item);
//     }
//     return products;
//   }, [products, searchTerm, fuse]);

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       {/* ========== MOBILE FILTER ========== */}
//       <div className="lg:hidden mb-6">
//         <button
//           onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
//           className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 text-left font-medium text-eco-dark shadow-sm hover:shadow transition-shadow"
//         >
//           <span className="flex items-center gap-2">
//             <Filter className="w-5 h-5" />
//             Filter by Category
//           </span>
//           {mobileFilterOpen ? (
//             <X className="w-5 h-5" />
//           ) : (
//             <span className="text-sm text-gray-500">({categories.length})</span>
//           )}
//         </button>
//         {mobileFilterOpen && (
//           <div className="mt-3 bg-white rounded-xl shadow-lg border border-gray-100 p-4 space-y-2">
//             <button
//               onClick={() => {
//                 setSelectedCategory("all");
//                 setMobileFilterOpen(false);
//               }}
//               className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
//                 selectedCategory === "all"
//                   ? "bg-eco-green text-white shadow-sm"
//                   : "hover:bg-eco-light text-eco-dark"
//               }`}
//             >
//               All Products
//             </button>
//             {categories.map((cat) => (
//               <button
//                 key={cat.id}
//                 onClick={() => {
//                   setSelectedCategory(cat.id);
//                   setMobileFilterOpen(false);
//                 }}
//                 className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
//                   selectedCategory === cat.id
//                     ? "bg-eco-green text-white shadow-sm"
//                     : "hover:bg-eco-light text-eco-dark"
//                 }`}
//               >
//                 <span>{cat.icon}</span>
//                 <span>{cat.name}</span>
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* ========== MAIN LAYOUT ========== */}
//       <div className="flex flex-col lg:flex-row gap-8">
//         {/* ========== DESKTOP SIDEBAR ========== */}
//         <aside className="hidden lg:block w-64 flex-shrink-0">
//           <h3 className="font-semibold text-lg mb-4 dark:text-eco-light">
//             Filter by Category
//           </h3>
//           <button
//             onClick={() => setSelectedCategory("all")}
//             className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all mb-2 dark:text-eco-light dark:hover:text-eco-darkest ${
//               selectedCategory === "all"
//                 ? "bg-eco-green text-white shadow-md"
//                 : "hover:bg-eco-green hover:text-eco-light dark:hover:text-eco-light"
//             }`}
//           >
//             All Products
//           </button>
//           <ul className="space-y-2">
//             {categories.map((cat) => (
//               <li key={cat.id}>
//                 <button
//                   onClick={() => setSelectedCategory(cat.id)}
//                   className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 transition-all dark:text-eco-light dark:hover:text-eco-darkest ${
//                     selectedCategory === cat.id
//                       ? "bg-eco-green text-white shadow-md"
//                       : "hover:bg-eco-green hover:text-eco-light dark:hover:text-eco-light"
//                   }`}
//                 >
//                   <span>{cat.icon}</span>
//                   <span>{cat.name}</span>
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </aside>

//         {/* ========== PRODUCTS GRID ========== */}
//         <main className="flex-1">
//           {loading ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {Array(6)
//                 .fill(0)
//                 .map((_, i) => (
//                   <ProductSkeleton key={i} />
//                 ))}
//             </div>
//           ) : filteredProducts.length === 0 ? (
//             <p className="text-center text-gray-500 py-10">No products found.</p>
//           ) : (
//             <>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {filteredProducts.map((product) => (
//                   <ProductCard key={product.id} product={product} />
//                 ))}
//               </div>
//               {/* Sentinel برای lazy loading */}
//               <div ref={loadMoreRef} className="py-10 text-center">
//                 {loadingMore && <ProductSkeleton />}
//               </div>
//             </>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }







// // app/page.tsx
// "use client";

// import { useState, useMemo, useEffect } from "react";
// import Fuse from "fuse.js";
// import ProductCard from "@/components/ProductCard";
// import ProductSkeleton from "@/components/skeleton/ProductSkeleton";
// import { Filter, X } from "lucide-react";
// import { useSearch } from "@/components/SearchContext";
// import type { EnhancedProduct } from "@/types";

// interface ApiResponse {
//   products: EnhancedProduct[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

// type CategoryItem = {
//   id: string;
//   name: string;
//   icon?: string | null;
// };

// export default function Home() {
//   const [data, setData] = useState<ApiResponse | null>(null);
//   const { searchTerm } = useSearch();
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [loading, setLoading] = useState(true);
//   const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

//   useEffect(() => {
//     fetch("/api/products?limit=200")
//       .then((res) => res.json())
//       .then((json: ApiResponse) => {
//         setData(json);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("خطا در دریافت محصولات:", err);
//         setLoading(false);
//       });
//   }, []);

//   const products = data?.products ?? [];

//   const categories = useMemo(() => {
//     const map = new Map<string, CategoryItem>();
//     products.forEach((p) => {
//       const cats = p.categories as CategoryItem[] | null;
//       cats?.forEach((cat) => {
//         if (cat?.id && !map.has(cat.id)) {
//           map.set(cat.id, { id: cat.id, name: cat.name, icon: cat.icon ?? undefined });
//         }
//       });
//     });
//     return Array.from(map.values());
//   }, [products]);

//   const fuse = useMemo(
//     () =>
//       new Fuse(products, {
//         keys: ["name", "description", "short_description"],
//         threshold: 0.3,
//       }),
//     [products]
//   );

//   const filteredProducts = useMemo(() => {
//     let results: EnhancedProduct[] = products;

//     if (selectedCategory !== "all") {
//       results = results.filter((p) => {
//         const cats = p.categories as CategoryItem[] | null;
//         return cats?.some((c) => c.id === selectedCategory) ?? false;
//       });
//     }

//     if (searchTerm.trim()) {
//       const searchResults = fuse.search(searchTerm);
//       results = searchResults.map((r) => r.item);
//     }

//     return results;
//   }, [products, searchTerm, selectedCategory, fuse]);

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       {/* === MOBILE FILTER (فقط در زیر 1024px) === */}
//       <div className="lg:hidden mb-6">
//         <button
//           onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
//           className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 text-left font-medium text-eco-dark shadow-sm hover:shadow transition-shadow"
//         >
//           <span className="flex items-center gap-2">
//             <Filter className="w-5 h-5" />
//             Filter by Category
//           </span>
//           {mobileFilterOpen ? (
//             <X className="w-5 h-5" />
//           ) : (
//             <span className="text-sm text-gray-500">({categories.length})</span>
//           )}
//         </button>

//         {mobileFilterOpen && (
//           <div className="mt-3 bg-white rounded-xl shadow-lg border border-gray-100 p-4 space-y-2">
//             <button
//               onClick={() => {
//                 setSelectedCategory("all");
//                 setMobileFilterOpen(false);
//               }}
//               className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
//                 selectedCategory === "all"
//                   ? "bg-eco-green text-white shadow-sm"
//                   : "hover:bg-eco-light text-eco-dark"
//               }`}
//             >
//               All Products
//             </button>
//             {categories.map((cat) => (
//               <button
//                 key={cat.id}
//                 onClick={() => {
//                   setSelectedCategory(cat.id);
//                   setMobileFilterOpen(false);
//                 }}
//                 className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
//                   selectedCategory === cat.id
//                     ? "bg-eco-green text-white shadow-sm"
//                     : "hover:bg-eco-light text-eco-dark"
//                 }`}
//               >
//                 <span>{cat.icon}</span>
//                 <span>{cat.name}</span>
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* === MAIN LAYOUT === */}
//       <div className="flex flex-col lg:flex-row gap-8">
//         {/* === DESKTOP SIDEBAR (فقط در 1024px و بالاتر) === */}
//         <aside className="hidden lg:block w-64 flex-shrink-0">
//           <h3 className="font-semibold text-lg mb-4 dark:text-eco-light">Filter by Category</h3>
//           <button
//             onClick={() => setSelectedCategory("all")}
//             className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all mb-2 dark:text-eco-light dark:hover:text-eco-darkest ${
//               selectedCategory === "all"
//                 ? "bg-eco-green text-white shadow-md"
//                 : "hover:bg-eco-green hover:text-eco-light dark:hover:text-eco-light"
//             }`}
//           >
//             All Products
//           </button>
//           <ul className="space-y-2">
//             {categories.map((cat) => (
//               <li key={cat.id}>
//                 <button
//                   onClick={() => setSelectedCategory(cat.id)}
//                   className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 transition-all dark:text-eco-light dark:hover:text-eco-darkest ${
//                     selectedCategory === cat.id
//                       ? "bg-eco-green text-white shadow-md"
//                       : "hover:bg-eco-green hover:text-eco-light dark:hover:text-eco-light"
//                   }`}
//                 >
//                   <span>{cat.icon}</span>
//                   <span>{cat.name}</span>
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </aside>

//         {/* === PRODUCTS GRID === */}
//         <main className="flex-1">
//           {loading ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {Array(6)
//                 .fill(0)
//                 .map((_, i) => (
//                   <ProductSkeleton key={i} />
//                 ))}
//             </div>
//           ) : filteredProducts.length === 0 ? (
//             <p className="text-center text-gray-500 py-10">No products found.</p>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

