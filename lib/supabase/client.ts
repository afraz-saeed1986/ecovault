// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)