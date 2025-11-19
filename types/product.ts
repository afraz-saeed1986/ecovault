import type { Category } from "./category";
import type { Review } from "./review";
import type { Coupon } from "./coupon";

export interface Product {
    id: number;
    name: string;
    price: number;
    currency: string;
    categories: Category[];
    images: string[];
    description: string;
    shortDescription: string;
    reviews: Review[];
    sustainabilityScore: number;
    relatedProducts: number[];
    stock: number;
    unit: string;
    createdAt: string;
    updatedAt: string;
    coupon: Coupon;
    isActive: boolean;
}