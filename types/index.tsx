export interface Review {
  user: string; 
  rating: number; 
  comment: string
}

export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    categories: Category[];
    images: string[];
    reviews: Review[];
    sustainabilityScore: number;
    relatedProducts: number[];
    stock: number;
    unit: string;
    createdAt: string;
}

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

export interface ProductGalleryProps {
    images: string[];
    name: string;
}

export interface SearchContextType{
    searchTerm: string;
    setSearchTerm: (value: string) => void;
}

export interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export interface WishlistContextType {
    wishlist: Product[];
    toggleWishlist: (product: Product) => void;
    removeFromWishlist: (id: number) => void;
    isInWishlist: (id: number) => boolean;
}

export interface Category {
id: string
name: string,
icon: string
}
