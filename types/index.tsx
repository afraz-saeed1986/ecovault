import type { Database, TablesInsert } from "./database.types";

// ──────────────────────────────────────────────────────────────
// Helperهای دقیق و ایمن برای جداول و Viewها
// ──────────────────────────────────────────────────────────────
type Table<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

type View<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"];

// ──────────────────────────────────────────────────────────────
// ۱. تایپ‌های پایه (Rowهای اصلی جداول)
// ──────────────────────────────────────────────────────────────
export type Product = Table<"products">;
export type Category = Table<"categories">;
export type Coupon = Table<"coupons">;
export type Profile = Table<"profiles">; // به جای User → دقیق‌تر و واضح‌تر
export type Review = Table<"reviews">;
export type Order = Table<"orders">;
export type OrderItem = Table<"order_items">;
export type Inventory = Table<"inventory">;

// ──────────────────────────────────────────────────────────────
// ۲. تایپ‌های ترکیبی و رابطه‌دار (بهترین روش!)
// ──────────────────────────────────────────────────────────────

// بهترین و تمیزترین راه: استفاده مستقیم از View آماده در دیتابیس
export type ProductWithRelations = View<"products_with_relations">;

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

// اگر به هر دلیلی بخوای دستی بسازی (مثلاً برای کوئری‌های خاص)
export type ProductWithRelationsManual = Product & {
  inventory: Inventory | null;
  categories: Category[];
  reviews: ReviewWithProfile[];
  related_products?: Product[];
};

// Review + اطلاعات نویسنده (profile)
export type ReviewWithProfile = Review & {
  profiles: Profile | null; // دقیقاً همون چیزی که supabase برمی‌گردونه
};

// اگر در کوئری از alias استفاده کردی (مثلاً user:profiles(*))
export type ReviewWithUser = Review & {
  user: Profile | null;
};

// ──────────────────────────────────────────────────────────────
// ۳. تایپ‌های کاربردی برای UI و فرانت‌اند
// ──────────────────────────────────────────────────────────────
export type ProductCard = ProductWithRelations & {
  mainImage?: string;
  avgRating?: number;
  reviewCount?: number;
  inStock?: boolean;
  isLowStock?: boolean;
};

export type ProductDetailPage = ProductWithRelations & {
  translatedName?: string;
  translatedDescription?: string;
  translatedShortDescription?: string;
};

// برای وقتی که reviews رو جداگانه می‌گیری
export type ReviewWithAuthor = Review & {
  profiles: Profile | null;
};

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
  realStock: number;
  inStock: boolean;
  isLowStock: boolean;
  avgRating: number;
  reviewCount: number;
  mainImage: string | null;
  reviews: ReviewWithProfile[]; // دقیقاً همون چیزی که از View میاد (profiles جوین شده)
  related_products: RelatedProductFromView[] | null;
};

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

// OrderItem Input
// این همان ساختاری است که شما برای هر آیتم در آرایه items در CartPage ساختید.
export type OrderItemInput = {
  product_id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string | null;
};

// Order Input for API
// این تایپ، فیلدهای اصلی جدول orders را دارد (با حذف فیلدهای تولیدشده توسط دیتابیس)
// به علاوه، فیلد 'items' را که فقط برای انتقال داده به API است، اضافه می‌کند.
export type CreateOrderInput = Omit<
  Order,
  "id" | "created_at" | "updated_at"
> & {
  items: OrderItemInput[]; // این فیلدی است که شما در CartPage اضافه کردید.
};

// تایپ استاندارد Insert برای جدول reviews
// توجه: اسکیما شما profile_id را نشان می‌دهد، اما کد شما user_id را می‌فرستد.
// ما تایپ را طوری تنظیم می‌کنیم که user_id: string را بپذیرد، با فرض اینکه
// Supabase Auth ID به این نام درج می‌شود. اگر دیتابیس شما واقعاً profile_id (number) نیاز دارد،
// باید قبل از درج، profile_id را از user_id پیدا کنید.
type StandardReviewInsert = TablesInsert<"reviews">;

export type ReviewInsert = Omit<StandardReviewInsert, "profile_id"> & {
  user_id: string; // ستون مورد انتظار شما برای Auth ID
  profile_id?: number | null; // اگر profile_id هم نیاز باشد، آن را اختیاری می‌کنیم
};

// ──────────────────────────────────────────────────────────────
// ۴. اکسپورت‌های قبلی (Contextها و کامپوننت‌ها)
// ──────────────────────────────────────────────────────────────
export * from "./cartContextType";
export * from "./wishlistContextType";
export * from "./themeContextType";
export * from "./SearchContextType";
export * from "./productGalleryProps";
export * from "./cartItem";
export * from "./ProductCategory";
export * from "./AvatarProps";
export * from "./ReviewsSectionProps";
export * from "./ProductsApiResponse";
export * from "./AvatarProps";
export * from "./ApiResponse";
export * from "./CategoryItem";
export * from "./User";
export * from "./Account";
export * from "./Session";
export * from "./VerificationToken";
