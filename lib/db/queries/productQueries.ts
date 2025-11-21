import { supabase } from '@/lib/supabaseClient'
import type {ProductWithRelations } from '@/types'

export async function getAllProducts(): Promise<ProductWithRelations[]> {
  const { data, error } = await  supabase
    .from("products")
    .select(`
      *,
      inventory(*),
      product_categories(*, category:categories(*)),
      reviews(*, user:profiles(*))
    `);


  if (error) {
    console.error('getAllProducts error:', error)
    return []
  }

  return data
}