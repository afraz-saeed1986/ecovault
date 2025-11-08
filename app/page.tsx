"use client"
import { useState, useMemo, useEffect } from "react";
import Fuse from "fuse.js";
import ProductCard from "@/components/ProductCard";
import productsData from "@/data/products.json";
import categoriesData from "@/data/categories.json";
import { getProducts } from "@/lib/api";

// const fuse = new Fuse(productsData, {
//   keys: ["name", "description", "categories"],
//   threshold: 0.3,
// });

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  getProducts()
   .then(data => {
    setProducts(data);
    setLoading(false);
   })
   .catch(() => setLoading(false));
 }, []);

 const fuse = useMemo(() => new Fuse(products, {
  keys: ["name", "description", "categories"],
  threshold: 0.3,
 }), [products]);

const filteredProducts = useMemo(() => {
    let results: any[] = products;

    if (selectedCategory !== "all") {
      results = results.filter(p => p.categories.includes(selectedCategory));
    }

    if (searchTerm.trim()) {
      const searchResults = fuse.search(searchTerm);
      results = searchResults.map(r => r.item);
    }

    return results;
  }, [products, searchTerm, selectedCategory, fuse]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading products...</div>;
  }

  return (
    <>
      <header className="bg-eco-green text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              EcoVault
            </h1>
            <input
              type="text"
              placeholder="Search products, categories, or sustainability..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-96 px-4 py-2 rounded-lg text-eco-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-eco-accent"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        <aside className="w-64">
          <h3 className="font-semibold text-lg mb-4">Filter by Category</h3>
          <ul className="space-y-2">
            {categoriesData.map(cat => (
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
            <p className="text-center text-gray-500 py-10">No products found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}