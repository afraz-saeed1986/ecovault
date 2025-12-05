import { EnhancedProduct } from "./";

export interface ProductsApiResponse {
  products: EnhancedProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}