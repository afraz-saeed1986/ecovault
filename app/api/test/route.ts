import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data } = await supabase
    .from('products_with_relations')
    .select('*')
    .eq('id', 1)
    .single()

  return NextResponse.json({ test: true, data })
}