"use client";
import { useState, useMemo, useEffect } from "react";
import Fuse from "fuse.js";
import ProductCard from "@/components/ProductCard";
import categoriesData from "@/data/categories.json";
import { getProducts } from "@/lib/api";
import ProductSkeleton from "@/components/skeleton/ProductSkeleton";
import { Filter, X } from "lucide-react";

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    categories: string[];
    images: string[];
    reviews: {user: string; rating: number; comment: string}[];
    sustainabilityScore: number;
    relatedProducts: number[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(products, {
        keys: ["name", "description", "categories"],
        threshold: 0.3,
      }),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let results: Product[] = products;

    if (selectedCategory !== "all") {
      results = results.filter((p) => p.categories.includes(selectedCategory));
    }

    if (searchTerm.trim()) {
      const searchResults = fuse.search(searchTerm);
      results = searchResults.map((r) => r.item);
    }

    return results;
  }, [products, searchTerm, selectedCategory, fuse]);

  useEffect(() => {
    const input = document.querySelector('input[placeholder="Search products..."]') as HTMLInputElement;
    if (input) {
      input.value = searchTerm;
      input.addEventListener('input', (e) => {
        setSearchTerm((e.target as HTMLInputElement).value);
      });
    }
  }, [searchTerm]);

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
            <span className="text-sm text-gray-500">({categoriesData.length})</span>
          )}
        </button>

        {/* Mobile Dropdown */}
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
            {categoriesData.map((cat) => (
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
          <h3 className="font-semibold text-lg mb-4">Filter by Category</h3>
          <button
            onClick={() => setSelectedCategory("all")}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all mb-2 ${
              selectedCategory === "all"
                ? "bg-eco-green text-white shadow-md"
                : "hover:bg-eco-light"
            }`}
          >
            All Products
          </button>
          <ul className="space-y-2">
            {categoriesData.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    selectedCategory === cat.id
                      ? "bg-eco-green text-white shadow-md"
                      : "hover:bg-eco-light"
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