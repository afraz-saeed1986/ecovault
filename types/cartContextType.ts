import { CartItem, EnhancedProduct } from "./";

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: EnhancedProduct) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}
