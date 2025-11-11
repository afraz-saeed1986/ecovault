"use client";
import { useState, useMemo, useEffect } from "react";
import Fuse from "fuse.js";
import ProductCard from "@/components/ProductCard";
import categoriesData from "@/data/categories.json";
import { getProducts } from "@/lib/api";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

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
    let results: any[] = products;

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
    if(input){
      input.value = searchTerm;
      input.addEventListener('input', (e) => {
        setSearchTerm((e.target as HTMLInputElement).value)
      })
    }
  }, [searchTerm])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading products...
      </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        <aside className="w-64">
          <h3 className="font-semibold text-lg mb-4">Filter by Category</h3>
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

        <main className="flex-1">
          {filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No products found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
  );
}
