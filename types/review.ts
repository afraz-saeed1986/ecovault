import type { User } from "./user";
import type { Product } from "./product";

export interface Review {
  id: number;
  product: Product;
  user: User;
  rating: number; // 1..5
  title?: string;
  comment?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}