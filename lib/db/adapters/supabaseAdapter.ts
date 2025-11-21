// src/lib/db/adapters/supabaseAdapter.ts
import { supabase } from '@/lib/supabaseClient'
import type { CollectionDataSource, ID } from '@/lib/db/adapters'

/**
 * createSupabaseAdapter
 * دقیقاً همون interface CollectionDataSource رو پیاده‌سازی می‌کنه
 * که fileAdapter هم داره — پس هیچ کدی نمی‌شکنه!
 */
export function createSupabaseAdapter(): CollectionDataSource {
  return {
    // خواندن کل مجموعه (مثل products, categories, coupons)
    async read<T>(collection: string): Promise<T[]> {
      const { data, error } = await supabase
        .from(collection)
        .select('*')
        .order('id', { ascending: true })

      if (error) {
        console.error(`[Supabase Adapter] read error on ${collection}:`, error.message)
        return [] // fallback — مثل fileAdapter رفتار می‌کنه
      }

      return data as T[]
    },

    // گرفتن یک آیتم با id
    async get<T>(collection: string, id: ID): Promise<T | null> {
      const { data, error } = await supabase
        .from(collection)
        .select('*')
        .eq('id', id)
        .maybeSingle() // اگر نبود null برمی‌گردونه

      if (error) {
        console.error(`[Supabase Adapter] get error on ${collection}/${id}:`, error.message)
        return null
      }

      return (data as T) || null
    },

    // نوشتن کل مجموعه (overwrite — مثل fileAdapter)
    async write<T>(collection: string, items: T[]): Promise<void> {
      // اول همه رو حذف می‌کنیم (truncate-like)
      const ids = items.map(item => (item as any).id).filter(Boolean)
      if (ids.length > 0) {
        await supabase.from(collection).delete().in('id', ids)
      }

      // بعد همه رو دوباره insert می‌کنیم
      if (items.length > 0) {
        const { error } = await supabase.from(collection).insert(items as T[])
        if (error) throw new Error(`[Supabase Adapter] write error on ${collection}: ${error.message}`)
      }
    },

    // upsert یک آیتم (insert or update)
    async upsert<T extends { id?: ID }>(collection: string, item: T): Promise<T> {
      const { data, error } = await supabase
        .from(collection)
        .upsert(item as T, { onConflict: 'id' })
        .select()
        .single()

      if (error) {
        throw new Error(`[Supabase Adapter] upsert error on ${collection}: ${error.message}`)
      }

      return data as T
    },

    // حذف یک آیتم با id
    async delete(collection: string, id: ID): Promise<boolean> {
      const { error } = await supabase
        .from(collection)
        .delete()
        .eq('id', id)

      if (error) {
        console.error(`[Supabase Adapter] delete error on ${collection}/${id}:`, error.message)
        return false
      }

      return true
    },
  }
}