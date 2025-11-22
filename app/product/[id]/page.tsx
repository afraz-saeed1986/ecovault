
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/api";
import ProductClient from "./ProductClient";
import { loadConfig } from "@/lib/config";
import { createProductRepository } from "@/lib/repositories/products";
import { ProductWithRelations } from "@/types";


// --- SEO Metadata ---
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
const {id} = await params;
  const product = await getProductById(Number(id));
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | EcoVault`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images[0]],
      url: `https://ecovault-afraz.vercel.app/product/${id}`,
      type: "website",
    },
  };
}

// --- Server Component ---
// export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
// const {id } = await params;
//   const product = await getProductById(Number(id));

//   console.log("id, product>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",id,  product)

//   if (!product) {
//     console.log("Product not found → calling notFound()"); // دیباگ
//     notFound();
//   }

//   return <ProductClient product={product} />
  
// }

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  let product: ProductWithRelations[] = [];
  const {id} = await params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${id}`, {
    cache: "no-store"
  });

  if (!res.ok) return <div>Product not found</div>;

  product = await res.json();
  console.log(typeof product);
 
  return <ProductClient product={product[0]} />
  
}
