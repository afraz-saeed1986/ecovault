import { supabase } from '@/lib/supabaseClient'
import type {ProductWithRelations } from '@/types'

export async function getAllProducts(): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from('products_with_relations')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    console.error('getAllProducts error:', error)
    return []
  }

  return data
}