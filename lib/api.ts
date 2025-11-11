import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    timeout: 5000,
});

//Get All Products
export const getProducts = async () => {
    const res = await api.get("/products");
    return res.data;
};

// Get One Product
export const getProductById = async (id: number) => {
   try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/products/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}