export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrderAmount?: number;
  maxUsage?: number;
  usedCount?: number;
  expiresAt?: string;
  enabled?: boolean;
  createdAt?: string;
}
