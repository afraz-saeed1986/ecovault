// app/api/products/route.ts
import { NextResponse } from "next/server";
import { productService } from "@/services/product.service";
import type { EnhancedProduct } from "@/types";

interface ProductsApiResponse {
  products: EnhancedProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "12")));
  const categoryId = searchParams.get("category") || undefined;
  const inStockOnly = searchParams.get("inStock") === "true";
  const search = searchParams.get("search")?.trim() || undefined;

  try {
    let result: ProductsApiResponse;

    // اگر سرچ داریم (فعلاً کلاینت‌ساید سرچ می‌کنیم)
    if (search) {
      const all = await productService.getAll({ limit: 500 });
      result = {
        products: all.products,
        total: all.products.length,
        page: 1,
        limit: all.products.length,
        totalPages: 1,
      };
    } else {
      // دریافت با pagination و فیلتر
      const data = await productService.getAll({
        page,
        limit,
        categoryId,
        inStockOnly,
      });

      result = {
        products: data.products,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /products] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// کش کردن نتایج (هر ۶۰ ثانیه یکبار از دیتابیس بگیره)
export const revalidate = 60;
export const dynamic = "force-dynamic";




// // app/api/products/[id]/route.ts
// import { NextResponse } from 'next/server';
// import { loadConfig } from '@/lib/config';
// import { createProductRepository } from '@/lib/repositories/products';
// import { supabase } from '@/lib/supabaseClient';

// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const id = parseInt(params.id);
//   if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

//   try {
//     const { adapter } = loadConfig();
//     const repo = createProductRepository(adapter);

//       const { data} = await supabase
//         .from('products_with_relations')
//         .select('*');

//     const product = data?.filter(d => parseInt(d.id) === id);

//     if (!product)
//       return NextResponse.json({ message: 'Product not found' }, { status: 404 });

//     return NextResponse.json(product); // فقط داده خالص JSON
//   } catch (err: any) {
//     console.error('GET /api/products/[id] error:', err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
