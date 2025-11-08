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
    const res = await api.get(`/products/${id}`);
    return res.data;
}