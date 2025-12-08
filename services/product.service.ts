// services/product.service.ts
import { productRepository } from "@/repositories/product.repository";
import type {
  ProductWithRelations,
  EnhancedProduct,
  ReviewWithProfile,
  RelatedProductFromView,
} from "@/types";

export class ProductService {
  private calculateStock(product: ProductWithRelations) {
    const stock =
      (product.inventory_stock ?? 0) - (product.inventory_reserved ?? 0);
    const threshold = product.low_stock_threshold ?? 5;
    return {
      realStock: stock,
      inStock: stock > 0,
      isLowStock: stock > 0 && stock <= threshold,
    };
  }

  private calculateRating(reviews: ReviewWithProfile[] = []) {
    if (reviews.length === 0) {
      return { avgRating: 0, reviewCount: 0 };
    }
    const sum = reviews.reduce((acc, r) => acc + (r.rating ?? 0), 0);
    return {
      avgRating: Number((sum / reviews.length).toFixed(1)),
      reviewCount: reviews.length,
    };
  }

  private enhance(product: ProductWithRelations): EnhancedProduct {
    const { realStock, inStock, isLowStock } = this.calculateStock(product);
    const reviews = (product.reviews as ReviewWithProfile[] | null) ?? [];
    const { avgRating, reviewCount } = this.calculateRating(reviews);

    // تبدیل related_products از Json به نوع دقیق
    const relatedProducts = Array.isArray(product.related_products)
      ? (product.related_products as RelatedProductFromView[])
      : null;

    return {
      ...product,
      realStock,
      inStock,
      isLowStock,
      avgRating,
      reviewCount,
      mainImage: product.images?.[0] ?? null,
      reviews,
      related_products: relatedProducts, // حالا کاملاً Type-Safe
    };
  }

  async getAll(params = {}) {
    const result = await productRepository.getAll(params);
    console.log("Result>>>>>>>>>>>>>>>>", result);
    return {
      ...result,
      products: result.products.map((p) => this.enhance(p)),
    };
  }

  async getById(id: number): Promise<EnhancedProduct> {
    const product = await productRepository.getById(id);
    return this.enhance(product);
  }

  async getFeatured(limit = 8): Promise<EnhancedProduct[]> {
    const products = await productRepository.getFeatured(limit);
    return products.map((p) => this.enhance(p));
  }
}

export const productService = new ProductService();
