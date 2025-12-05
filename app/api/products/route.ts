// app/api/products/route.ts
import { NextResponse } from "next/server";
import { productService } from "@/services/product.service";
import type { EnhancedProduct } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "12")));

  // اصلاح: استفاده از پارامتر category به جای categoryId
  const categoryParam = searchParams.get("category");
  const categoryId = (categoryParam && categoryParam !== "all") ? categoryParam : undefined;

  const inStockOnly = searchParams.get("inStock") === "true";
  const searchQuery = searchParams.get("search") || undefined;

  try {
    if (searchQuery) {
      const result = await productService.getAll({ limit: 200 });
      return NextResponse.json({
        products: result.products,
        total: result.total,
        page: 1,
        limit: result.products.length,
        totalPages: 1,
      });
    }

    // اصلاح: ارسال صحیح پارامترها به سرویس
    const result = await productService.getAll({
      page,
      limit,
      categoryId, // اینجا باید categoryId باشد
      inStockOnly,
    });

    return NextResponse.json({
      products: result.products as EnhancedProduct[],
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("API /products error:", error);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}

export const revalidate = 60;









// // app/api/products/route.ts
// import { NextResponse } from "next/server";
// import { productService } from "@/services/product.service";
// import type { EnhancedProduct } from "@/types";

// interface SearchParams {
//   page?: string;
//   limit?: string;
//   category?: string;
//   inStock?: string;
//   search?: string;
// }

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);

//   const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
//   const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "12")));
//   const categoryId = searchParams.get("category") || undefined;
//   const inStockOnly = searchParams.get("inStock") === "true";
//   const searchQuery = searchParams.get("search") || undefined;

//   try {
//     // اگر سرچ داریم، از سرویس ساده استفاده کن (بعداً می‌تونیم سرچ سرور-ساید هم اضافه کنیم)
//     if (searchQuery) {
//       // فعلاً از کلاینت سرچ می‌کنیم، پس فقط محصولات رو برمی‌گردونیم
//       const result = await productService.getAll({ limit: 200 });
//       return NextResponse.json({
//         products: result.products,
//         total: result.total,
//         page: 1,
//         limit: result.products.length,
//         totalPages: 1,
//       });
//     }

//     // دریافت با pagination و فیلتر
//     const result = await productService.getAll({
//       page,
//       limit,
//       categoryId,
//       inStockOnly,
//     });

//     return NextResponse.json({
//       products: result.products as EnhancedProduct[],
//       total: result.total,
//       page: result.page,
//       limit: result.limit,
//       totalPages: result.totalPages,
//     });
//   } catch (error) {
//     console.error("API /products error:", error);
//     return NextResponse.json(
//       { error: "Failed to load products" },
//       { status: 500 }
//     );
//   }
// }

// // اختیاری: کش کردن نتایج (عالی برای عملکرد)
// export const revalidate = 60; // هر ۶۰ ثانیه یکبار ری‌والیدیت کن