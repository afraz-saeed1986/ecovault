// repositories/product.repository.ts
import { supabase } from "@/lib/supabase/client";
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
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("products_with_relations")
      .select("*", { count: "exact", head: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    // if (categoryId) {
    //   query = query.contains("categories", [{ id: categoryId }]);
    // }

    if (categoryId && categoryId !== "all") {
  query = query.contains("categories", JSON.stringify([{ id: categoryId }]));
}

    if (inStockOnly) {
      query = query.gt("inventory_stock", 0);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error.message);
      return {
        products: [],
        total: 0,
        page,
        limit,
        totalPages: 1,
      };
    }

    return {
      products: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit) || 1,
    };
  }

  async getById(id: number): Promise<ProductWithRelations> {
    const { data, error } = await supabase
      .from("products_with_relations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message || "Not found");
    return data;
  }

  async getFeatured(limit = 8): Promise<ProductWithRelations[]> {
    const { data, error } = await supabase
      .from("products_with_relations")
      .select("*")
      .gt("inventory_stock", 0)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }

    return data || [];
  }
}

export const productRepository = new ProductRepository();
