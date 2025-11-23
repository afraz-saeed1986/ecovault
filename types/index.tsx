import type { Database } from './database.types'

// ──────────────────────────────────────────────────────────────
// Helperهای دقیق و ایمن برای جداول و Viewها
// ──────────────────────────────────────────────────────────────
type Table<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

type View<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row']

// ──────────────────────────────────────────────────────────────
// ۱. تایپ‌های پایه (Rowهای اصلی جداول)
// ──────────────────────────────────────────────────────────────
export type Product = Table<'products'>
export type Category = Table<'categories'>
export type Coupon = Table<'coupons'>
export type Profile = Table<'profiles'>          // به جای User → دقیق‌تر و واضح‌تر
export type Review = Table<'reviews'>
export type Order = Table<'orders'>
export type OrderItem = Table<'order_items'>
export type Inventory = Table<'inventory'>

// ──────────────────────────────────────────────────────────────
// ۲. تایپ‌های ترکیبی و رابطه‌دار (بهترین روش!)
// ──────────────────────────────────────────────────────────────

// بهترین و تمیزترین راه: استفاده مستقیم از View آماده در دیتابیس
export type ProductWithRelations = View<'products_with_relations'>

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

// اگر به هر دلیلی بخوای دستی بسازی (مثلاً برای کوئری‌های خاص)
export type ProductWithRelationsManual = Product & {
  inventory: Inventory | null
  categories: Category[]
  reviews: ReviewWithProfile[]
  related_products?: Product[]
}

// Review + اطلاعات نویسنده (profile)
export type ReviewWithProfile = Review & {
  profiles: Profile | null        // دقیقاً همون چیزی که supabase برمی‌گردونه
}

// اگر در کوئری از alias استفاده کردی (مثلاً user:profiles(*))
export type ReviewWithUser = Review & {
  user: Profile | null
}

// ──────────────────────────────────────────────────────────────
// ۳. تایپ‌های کاربردی برای UI و فرانت‌اند
// ──────────────────────────────────────────────────────────────
export type ProductCard = ProductWithRelations & {
  mainImage?: string
  avgRating?: number
  reviewCount?: number
  inStock?: boolean
  isLowStock?: boolean
}

export type ProductDetailPage = ProductWithRelations & {
  translatedName?: string
  translatedDescription?: string
  translatedShortDescription?: string
}

// برای وقتی که reviews رو جداگانه می‌گیری
export type ReviewWithAuthor = Review & {
  profiles: Profile | null
}

export type RelatedProductFromView = {
  id: number;
  name: string;
  price: number | null;
  images: string[] | null;
  short_description: string | null;
  is_active: boolean | null;
};


// ──────────────────────────────────────────────────────────────
// ۵. تایپ نهایی محصول با تمام محاسبات (برای استفاده در سرویس)
// ──────────────────────────────────────────────────────────────
export type EnhancedProduct = ProductWithRelations & {
  realStock: number
  inStock: boolean
  isLowStock: boolean
  avgRating: number
  reviewCount: number
  mainImage: string | null
  reviews: ReviewWithProfile[]// دقیقاً همون چیزی که از View میاد (profiles جوین شده)
  related_products: RelatedProductFromView[] | null; 
}

export type WishlistItem = EnhancedProduct;

export type WishlistContextType = {
  wishlist: EnhancedProduct[];
  toggleWishlist: (product: EnhancedProduct) => void;
  removeFromWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
};

export type CreateReviewInput = {
  product_id: number;
  rating: number;
  comment?: string | null;
  title?: string | null;
};



// ──────────────────────────────────────────────────────────────
// ۴. اکسپورت‌های قبلی (Contextها و کامپوننت‌ها)
// ──────────────────────────────────────────────────────────────
export * from './cartContextType'
export * from './wishlistContextType'
export * from './themeContextType'
export * from './SearchContextType'
export * from './productGalleryProps'
export * from './cartItem'