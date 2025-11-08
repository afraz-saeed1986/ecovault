import ProductCard from "@/components/ProductCard";
import productsData from "@/data/products.json";

interface RelatedProductsProps {
    relatedIds: number[];
}

export default function RelatedProducts({relatedIds} : RelatedProductsProps) {
    const related = productsData.filter(p => relatedIds.includes(p.id));

    if(related.length === 0) return null;

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-eco-dark mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> 
                {related.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}