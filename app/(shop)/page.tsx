// app/page.tsx
import ProductsPageClient from "@/components/ProductsPageClient";

export default function Page() {
  return <ProductsPageClient />;
}

export const revalidate = 60; // هر ۶۰ ثانیه یکبار از سرور بگیره (اختیاری ولی عالیه)