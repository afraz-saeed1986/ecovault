import type { CollectionDataSource } from "@/lib/db/adapters";
import type { Coupon } from "@/types";
import { createCouponRepository } from "@/lib/repositories/coupons";

/**
 * Utility: check if coupon is expired.
 */
function isExpired(coupon: Coupon): boolean {
  // Treat missing or empty string as "no expiration"
  if (!coupon.expiresAt || coupon.expiresAt.trim().length === 0) return false;

  // Parse expiresAt as date; invalid dates yield NaN
  const expiresTs = new Date(coupon.expiresAt).getTime();

  // If parsing failed, do not expire (or choose to fail hard based on your policy)
  if (Number.isNaN(expiresTs)) return false;

  // Compare against current time in ms
  return Date.now() > expiresTs;
}

// utils: validate coupon against business rules
function validateCoupon(coupon: Coupon, subtotal: number): void {
  if (coupon.enabled === false) throw new Error("Coupon is disabled");
  if (isExpired(coupon)) throw new Error("Coupon has expired");

  if (
    typeof coupon.minOrderAmount === "number" &&
    subtotal < coupon.minOrderAmount
  ) {
    throw new Error("Order amount is below minimum required for this coupon");
  }

  if (typeof coupon.maxUsage === "number") {
    const used = coupon.usedCount ?? 0;
    if (used > coupon.maxUsage) throw new Error("Coupon usage limit reached");
  }
}

/**
 * Utility: calculate discount based on coupon definition.
 */

function calculateDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.discountPercent) {
    return Math.round((subtotal * coupon.discountPercent) / 100);
  }

  if (coupon.discountAmount) {
    return Math.min(coupon.discountAmount, subtotal);
  }

  return 0;
}

/**
 * Coupon service: wraps repository with business logic.
 */

export function createCouponService(dataSource: CollectionDataSource) {
  const repo = createCouponRepository(dataSource);

  return {
    /**
     * Apply a coupon by code to an order subtotal.
     * Returns discount amount and the coupon used.
     */

    async applyCoupon(
      code: string,
      subtotal: number
    ): Promise<{ discount: number; coupon: Coupon }> {
      const coupon = await repo.getByCode(code);
      if (!coupon) throw new Error("Coupon not found");

      validateCoupon(coupon, subtotal);
      const discount = calculateDiscount(coupon, subtotal);

      // increment usage after successful application
      await repo.incrementUsage(coupon.id);

      return { discount, coupon };
    },

    /**
     * Get all coupons.
     */

    async list(): Promise<Coupon[]> {
      return repo.getAll();
    },

    /**
     * Create a new coupon.
     */

    async create(coupon: Omit<Coupon, "id">): Promise<Coupon> {
      return repo.create(coupon);
    },

    /**
     * Update an existing coupon.
     */

    async update(coupon: Coupon): Promise<Coupon> {
      return repo.update(coupon);
    },

    /**
     * Delete a coupon by id.
     */

    async delete(id: number): Promise<boolean> {
      return repo.delete(id);
    },

    /**
     * Enable or disable a coupon.
     */

    async setEnabled(id: number, enabled: boolean): Promise<Coupon> {
      return repo.setEnabled(id, enabled);
    },
  };
}
