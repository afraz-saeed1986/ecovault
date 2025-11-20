// src/app/api/coupons/apply/route.ts
import { NextResponse } from "next/server";
import { loadConfig } from "@/lib/config";
import { createCouponService } from "@/lib/services/couponService";

export async function POST(req: Request) {
  try {
    const { adapter } = loadConfig();
    const service = createCouponService(adapter);

    const { code, subtotal } = await req.json();
    const result = await service.applyCoupon(code, subtotal);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
