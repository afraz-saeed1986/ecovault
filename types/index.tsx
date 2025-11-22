// src/types/index.ts   ← این همون فایل قدیمیته، فقط آپدیتش کن
import type { Database } from '@/types/database.types'

// ──────────────────────────────────────────────────────────────
// ۱. تایپ‌های دیتابیس (از Supabase — همیشه sync با دیتابیس واقعی)
// ──────────────────────────────────────────────────────────────
type Tables = Database['public']['Tables']

export type Review = Tables['reviews']['Row']

export type ReviewWithRealations = Review & {
  user: Tables['profiles']['Row']
}

// Product با رابطه‌ها (دقیقاً همون شکلی که تو کدهایت استفاده می‌کنی)
// تایپ پایه محصول (بدون رابطه)
export type Product = Tables['products']['Row']

// محصول کامل با همه رابطه‌ها (برای ProductCard و صفحه جزئیات)
export type ProductWithRelations = Product & {
  inventory?: Tables['inventory']['Row'] | null
  reviews: ReviewWithRealations[]
  categories: Tables['categories']['Row'][]           // ← اینو حتماً داشته باش
  product_categories?: Array<{                         // ساختار موقتی که Supabase برمی‌گردونه
    category_id: string
    categories: Tables['categories']['Row']
  }>
}


// بقیه تایپ‌های داده‌ای (فقط alias — هیچ دستی ننوشته شده)
export type Category = Tables['categories']['Row']
export type Coupon = Tables['coupons']['Row']
export type Order = Tables['orders']['Row']
export type OrderItem = Tables['order_items']['Row']
export type InventoryItem = Tables['inventory']['Row']
export type User = Tables['profiles']['Row']
export type ProductCategory = Tables['product_categories']['Row']

// ──────────────────────────────────────────────────────────────
// ۲. تایپ‌های UI و Context (دقیقاً همون قبلی‌ها — دست نخورده!)
// ──────────────────────────────────────────────────────────────
export * from './cartContextType'
export * from './wishlistContextType'
export * from './themeContextType'
export * from './SearchContextType'
export * from './productGalleryProps'
export * from './cartItem'

