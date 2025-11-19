// import { NextResponse } from "next/server";
// import productsData from "@/data/products.json";

// export async function GET() {
//     return NextResponse.json(productsData);
// }

// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { loadConfig } from '@/lib/config';
import { createProductRepository } from '@/lib/repositories/products';

export async function GET() {
  const config = loadConfig();
  const productRepo = createProductRepository(config.adapter);
  const products = await productRepo.getAll();
  return NextResponse.json(products);
}
