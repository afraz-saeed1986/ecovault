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

