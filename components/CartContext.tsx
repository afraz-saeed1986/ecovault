// components/CartContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { EnhancedProduct, CartItem, CartContextType } from "@/types";

const STORAGE_KEY = "ecovault-cart";

interface CartContextValue {
  cart: CartItem[];
  addToCart: (product: EnhancedProduct) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen?: (open: boolean) => void;
  closeCart: () => void; // <--- اضافه شد
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // این state برای کنترل باز/بسته بودن سایدبار سبد خرید
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Saving cart failed:", e);
    }
  }, [cart]);

  const addToCart = (product: EnhancedProduct) => {
    if (product.id === null) {
      console.error(
        "Attempted to add a product without a valid ID to the cart."
      );
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          id: product.id!,
          name: product.name ?? "Unknown Product",
          price: product.price ?? 0,
          quantity: 1,
          image: product.mainImage ?? "/images/fallback-product.jpg",
        },
      ];
    });

    // وقتی محصول اضافه می‌شه، سایدبار باز بشه
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const closeCart = () => setIsCartOpen(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        closeCart, // <--- اضافه شد
        isCartOpen, // اختیاری — اگر CartDropdown نیاز داره
        setIsCartOpen, // اختیاری — اگر نیاز به کنترل خارجی داری
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

// // components/CartContext.tsx
// "use client";

// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";
// import type { EnhancedProduct, CartItem, CartContextType } from "@/types";

// const STORAGE_KEY = "ecovault-cart";

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export function CartProvider({ children }: { children: ReactNode }) {
//   const [cart, setCart] = useState<CartItem[]>(() => {
//     if (typeof window === "undefined") return [];
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);
//       return saved ? JSON.parse(saved) : [];
//     } catch {
//       return [];
//     }
//   });

//   useEffect(() => {
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
//     } catch (e) {
//       console.error("Saving cart failed:", e);
//     }
//   }, [cart]);

//   // این تابع فقط id, name, price, image رو از محصول می‌گیره
//   const addToCart = (product: EnhancedProduct) => {
//     // 💡 گارد اولیه برای اطمینان از صحت runtime (اگرچه TS در callback آن را نادیده می‌گیرد)
//     if (product.id === null) {
//       console.error(
//         "Attempted to add a product without a valid ID to the cart. Operation aborted."
//       );
//       return;
//     }

//     setCart((prev) => {
//       const existing = prev.find((item) => item.id === product.id);

//       if (existing) {
//         return prev.map((item) =>
//           item.id === product.id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }

//       return [
//         ...prev,
//         {
//           // ✅ اصلاح: استفاده از Non-null Assertion '!' در اینجا.
//           // این تضمین می‌کند که product.id به عنوان یک 'number' (و نه 'number | null')
//           // به شیء CartItem اختصاص داده شود و خطای TypeScript را رفع می‌کند.
//           id: product.id!,
//           name: product.name ?? "Unknown Product",
//           price: product.price ?? 0,
//           quantity: 1,
//           image: product.mainImage ?? "/images/fallback-product.jpg",
//         },
//       ];
//     });
//   };

//   const removeFromCart = (id: number) => {
//     setCart((prev) => prev.filter((item) => item.id !== id));
//   };

//   const updateQuantity = (id: number, quantity: number) => {
//     if (quantity <= 0) {
//       removeFromCart(id);
//       return;
//     }
//     setCart((prev) =>
//       prev.map((item) => (item.id === id ? { ...item, quantity } : item))
//     );
//   };

//   const clearCart = () => setCart([]);

//   const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
//   const totalPrice = cart.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   return (
//     <CartContext.Provider
//       value={{
//         cart,
//         addToCart,
//         removeFromCart,
//         updateQuantity,
//         clearCart,
//         totalItems,
//         totalPrice,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) throw new Error("useCart must be used within CartProvider");
//   return context;
// };
