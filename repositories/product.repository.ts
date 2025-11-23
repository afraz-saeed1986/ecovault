// repositories/product.repository.ts
import { api } from "@/lib/axios/instance"
import type { ProductWithRelations } from "@/types"

interface GetAllParams {
  page?: number
  limit?: number
  categoryId?: string
  inStockOnly?: boolean
}

interface PaginatedResponse {
  products: ProductWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class ProductRepository {
  async getAll(params: GetAllParams = {}): Promise<PaginatedResponse> {
    const { page = 1, limit = 12, categoryId, inStockOnly } = params
    const offset = (page - 1) * limit

    let url = `/products_with_relations?select=*&order=created_at.desc`
    const headers: Record<string, string> = {
      Prefer: "count=exact",
      Range: `${offset}-${offset + limit - 1}`,
    }

    if (categoryId) {
      url += `&categories=cs.{"id":"${categoryId}"}`
    }
    if (inStockOnly) {
      url += "&inventory_stock=gt.0"
    }

    const response = await api.get<ProductWithRelations[]>(url, { headers })
    const total = Number(response.headers["content-range"]?.split("/")[1] ?? "0")

    return {
      products: response.data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getById(id: number): Promise<ProductWithRelations> {
    const response = await api.get<ProductWithRelations[]>(
      `/products_with_relations?id=eq.${id}&select=*`
    )

    if (!response.data[0]) {
      throw new Error(`Product with id ${id} not found`)
    }

    return response.data[0]
  }

  async getFeatured(limit = 8): Promise<ProductWithRelations[]> {
    const response = await api.get<ProductWithRelations[]>(
      `/products_with_relations?inventory_stock=gt.0&order=created_at.desc&limit=${limit}`
    )
    return response.data
  }
}

export const productRepository = new ProductRepository()