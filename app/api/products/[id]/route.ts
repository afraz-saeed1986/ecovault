// app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { loadConfig } from '@/lib/config';
import { createProductRepository } from '@/lib/repositories/products';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    const { adapter } = loadConfig();
    const repo = createProductRepository(adapter);

      const { data} = await supabase
        .from('products_with_relations')
        .select('*');

    const product = data?.filter(d => parseInt(d.id) === id);

    if (!product)
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    return NextResponse.json(product); // فقط داده خالص JSON
  } catch (err: any) {
    console.error('GET /api/products/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
