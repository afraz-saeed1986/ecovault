import { Product } from "./product";
import { User } from "./user";

export type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  productId: Product;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  unit?: string;
}

export interface Order {
  id: number;
  userId: User;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  totalPrice: number;
  currency?: string;
  couponCode?: string | null;
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
}