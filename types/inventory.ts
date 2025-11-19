import { Product } from "./product";

export interface InventoryItem {
  product: Product;
  stock: number;
  reserved?: number;
  lowStockThreshold?: number;
  updatedAt?: string;
}