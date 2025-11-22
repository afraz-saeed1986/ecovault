
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/api";
import ProductClient from "./ProductClient";
import { loadConfig } from "@/lib/config";
import { createProductRepository } from "@/lib/repositories/products";


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
const {id } = await params;
const { adapter } = loadConfig();
const repo = createProductRepository(adapter);


const product = await repo.getById(id);

  console.log("id, product>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",id,  product)

  if (!product) {
    console.log("Product not found → calling notFound()"); // دیباگ
    notFound();
  }
 
  return <ProductClient product={product} />
  
}
