// app/product/[id]/page.tsx
import { notFound } from "next/navigation";
import { productService } from "@/services/product.service";
import ProductClient from "./ProductClient";
import type { EnhancedProduct } from "@/types";

interface Props {
  params: Promise<{ id: string }>; // مهم: Promise!
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params; // await لازم
  try {
    const product = await productService.getById(Number(id));
    return {
      title: `${product.name} | EcoShop`,
      description:
        product.short_description || product.description?.slice(0, 160),
    };
  } catch {
    return { title: "Product Not Found" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params; // await اینجا
  let product: EnhancedProduct;

  try {
    product = await productService.getById(Number(id));
  } catch {
    notFound();
  }

  return <ProductClient product={product} />;
}
