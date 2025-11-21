// src/lib/db/registry.ts
import { createFileAdapter } from '@/lib/db/adapters/fileAdapter'
import { createSupabaseAdapter } from '@/lib/db/adapters/supabaseAdapter' // این فایل رو بعداً می‌سازیم
import type { CollectionDataSource } from './index'

export type { CollectionDataSource } from './index'

export function getAdapterFromEnv(): CollectionDataSource {
  const adapter = (process.env.DATA_ADAPTER || 'file').toLowerCase()

  switch (adapter) {
    case 'file':
      console.log('🔌 Adapter: File (JSON local)')
      return createFileAdapter()

    case 'supabase':
      console.log('🔌 Adapter: Supabase (Live Database)')
      return createSupabaseAdapter() // <--- اینو فعال کردیم

    // بعداً اگر خواستی memory یا http هم اضافه کنی
    // case 'memory':
    //   return createMemoryAdapter()

    default:
      console.warn(`Unknown adapter "${adapter}", falling back to file`)
      return createFileAdapter()
  }
}

// برای راحتی، یه export مستقیم هم داشته باشیم
export const db = getAdapterFromEnv()