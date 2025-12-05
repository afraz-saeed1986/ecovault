import { EnhancedProduct } from "./";

export interface ApiResponse {
  products: EnhancedProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}