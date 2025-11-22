import type { ProductWithRelations } from "@/types";
import axios from "axios";
import { title } from "process";

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
export async function getProductById(id: number) {
  const url = `${getBaseUrl()}/api/products/${id}`;

  const res = await axios.get(url);

  console.log("Product Get Success: ", {id, status: res.status, data: res.data as ProductWithRelations})
 
  return res.data as ProductWithRelations;
}
