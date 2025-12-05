// repositories/product.repository.ts
import { api } from "@/lib/axios/instance";
import type { ProductWithRelations } from "@/types";

interface GetAllParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  inStockOnly?: boolean;
}

interface PaginatedResponse {
  products: ProductWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ProductRepository {
  async getAll(params: GetAllParams = {}): Promise<PaginatedResponse> {
    const { page = 1, limit = 12, categoryId, inStockOnly } = params;
    const offset = (page - 1) * limit;

    let url = `/products_with_relations?select=*&order=created_at.desc`;
    const headers: Record<string, string> = {
      Prefer: "count=exact",
      Range: `${offset}-${offset + limit - 1}`,
    };

    // اصلاح: فیلتر صحیح دسته‌بندی در Supabase
    if (categoryId) {
      // استفاده از contains برای فیلتر کردن آرایه‌های JSON
      url += `&categories=cs.[{"id":"${categoryId}"}]`;
    }

    if (inStockOnly) {
      url += "&inventory_stock=gt.0";
    }

    try {
      const response = await api.get<ProductWithRelations[]>(url, { headers });
      const total = Number(response.headers["content-range"]?.split("/")[1] ?? "0");

      return {
        products: response.data || [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (error: unknown) {
      // 1. تغییر 'any' به 'unknown': این استاندارد مدرن مدیریت خطا در TypeScript است.
      // 2. استفاده از Type Guard برای دسترسی ایمن به 'message'

      let errorMessage = "An unknown error occurred.";

      if (error instanceof Error) {
        // این برای خطاهای استاندارد جاوااسکریپت (مانند ReferenceError، TypeError و غیره)
        errorMessage = error.message;
      } else if (
        // این بلوک برای مدیریت خطاهای سفارشی یا خطاهای Postgrest Supabase است
        // که ممکن است شیء باشند و دارای ویژگی 'message'
        typeof error === 'object' &&
        error !== null &&
        'message' in error
      ) {
        // با اطمینان آن را به یک نوع با ویژگی message تبدیل می کنیم.
        const customError = error as { message: string }; 
        errorMessage = customError.message;
      }
      
      console.error("Supabase error:", errorMessage);

      return {
        products: [],
        total: 0,
        page,
        limit,
        totalPages: 1,
      };
    }
  }

  async getById(id: number): Promise<ProductWithRelations> {
    const response = await api.get<ProductWithRelations[]>(
      `/products_with_relations?id=eq.${id}&select=*`
    );
    if (!response.data[0]) throw new Error("Not found");
    return response.data[0];
  }

  async getFeatured(limit = 8): Promise<ProductWithRelations[]> {
    const response = await api.get<ProductWithRelations[]>(
      `/products_with_relations?inventory_stock=gt.0&order=created_at.desc&limit=${limit}`
    );
    return response.data;
  }
}

export const productRepository = new ProductRepository();


// // repositories/product.repository.ts
// import { api } from "@/lib/axios/instance"
// import type { ProductWithRelations } from "@/types"

// interface GetAllParams {
//   page?: number
//   limit?: number
//   categoryId?: string
//   inStockOnly?: boolean
// }

// interface PaginatedResponse {
//   products: ProductWithRelations[]
//   total: number
//   page: number
//   limit: number
//   totalPages: number
// }

// export class ProductRepository {
//   async getAll(params: GetAllParams = {}): Promise<PaginatedResponse> {
//     const { page = 1, limit = 12, categoryId, inStockOnly } = params
//     const offset = (page - 1) * limit

//     let url = `/products_with_relations?select=*&order=created_at.desc`
//     const headers: Record<string, string> = {
//       Prefer: "count=exact",
//       Range: `${offset}-${offset + limit - 1}`,
//     }

//     if (categoryId) {
//       url += `&categories=cs.{"id":"${categoryId}"}`
//     }
//     if (inStockOnly) {
//       url += "&inventory_stock=gt.0"
//     }

//     const response = await api.get<ProductWithRelations[]>(url, { headers })
//     const total = Number(response.headers["content-range"]?.split("/")[1] ?? "0")

//     return {
//       products: response.data,
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     }
//   }

//   async getById(id: number): Promise<ProductWithRelations> {
//     const response = await api.get<ProductWithRelations[]>(
//       `/products_with_relations?id=eq.${id}&select=*`
//     )

//     if (!response.data[0]) {
//       throw new Error(`Product with id ${id} not found`)
//     }

//     return response.data[0]
//   }

//   async getFeatured(limit = 8): Promise<ProductWithRelations[]> {
//     const response = await api.get<ProductWithRelations[]>(
//       `/products_with_relations?inventory_stock=gt.0&order=created_at.desc&limit=${limit}`
//     )
//     return response.data
//   }
// }

// export const productRepository = new ProductRepository()