import { Product } from "@/types";
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
    return res.data as Product[];
};

// Get One Product
export const getProductById = async (id: number) => {
   try {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/products/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}