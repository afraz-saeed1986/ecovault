import type { ProductWithRelations } from "@/types";
import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    timeout: 5000,
});

const getBaseUrl = () => {
  if(process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;

  if(process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return "http://localhost:3000";
}

//Get All Products
export const getProducts = async () => {
    const res = await api.get("/products");
    return res.data as ProductWithRelations[];
};

// Get One Product
export const getProductById = async (id: number): Promise<ProductWithRelations | null> => {
   try {
    const res = await api.get(`/products/${id}`)  // درست: /api/products/1
    return res.data as ProductWithRelations
  } catch (error) {
    console.error("Error fetching product by id:", error)
    return null
  }
}