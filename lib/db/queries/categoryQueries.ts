// src/lib/db/queries/categoryQueries.ts
import { supabase } from '@/lib/supabaseClient'
import type { Category } from '@/types'

export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })  // مرتب بر اساس نام

  if (error) {
    console.error('getAllCategories error:', error)
    return []
  }

  return data
}