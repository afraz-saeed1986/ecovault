import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import RelatedProducts from "@/components/RelatedProducts";
import productsData from "@/data/products.json";
import {Star,Package, Recycle, Leaf } from "lucide-react";


export default async function ProductPage({params}:{ params: Promise<{ id: string }> }) {
    const {id} = await params;
    const productId = parseInt(id);

    const product = productsData.find(p => p.id === productId);

    if(!product) return notFound();

    const avgRating = product.reviews.reduce((a,r) => a + r.rating, 0) / product.reviews.length;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8">
                <ProductGallery images={product.images} name={product.name}/>
                
                {/* Informaitions */}
                <div className="space-y-6">
                    <div>
                        <p className="text-sm text-eco-blue uppercase font-medium">
                            {product.categories.join(" . ")}
                        </p>
                        <h1 className="text-3xl font-bold text-eco-dark mt-1">{product.name}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <Star className="w-5 h-5 fill-eco-accent text-eco-accent" />
                            <span className="ml-1 font-semibold">{avgRating.toFixed(1)}</span>
                            <span className="ml-1 text-gray-600">({product.reviews.length} reviews)</span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="text-4xl font-bold text-eco-dark">${product.price}</div>

                    {/* Description */}
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Description</h3>
                        <p className="text-gray-700 leading-relaxed">{product.description}</p>
                    </div>

                    {/* Green Features */}
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-eco-green">
                            <Leaf className="w-5 h-5" />
                            <span className="text-sm">Eco-Friendly</span>
                        </div>
                        <div className="flex items-center gap-2 text-eco-green">
                            <Recycle className="w-5 h-5" />
                            <span className="text-sm">Recyclable</span>
                        </div>
                    </div>

                    {/* BY Button */}
                    <button className="w-full bg-eco-green text-white py-3 rounded-lg font-semibold hover:bg-eco-dark transition-colors text-lg">
                        Add to cart
                    </button>

                    {/* Sustainability Score */}
                    <div className="bg-eco-light p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Sustainability Score</span>
                            <span className="text-2xl font-bold text-eco-green">{product.sustainabilityScore}%</span>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-3">
                            <div className="bg-eco-green h-full rounded-full transition-all"
                                style={{width: `${product.sustainabilityScore}%`}}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Comments */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-eco-dark mb-6">Customer Reviews</h2>
                <div className="space-y-4">
                    {product.reviews.map((review, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{review.user}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[...Array(5)].map((_,j) => (
                                            <Star 
                                              key={j}
                                              className={`w-4 h-4 ${j < Math.floor(review.rating)
                                                 ? "fill-eco-accent text-eco-accent" : "text-gray-300"}`}
                                            />
                                        ))}
                                        <span className="ml-2 text-sm text-gray-600">{review.rating}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-2 text-gray-700">{review.comment}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Related products */}
            <RelatedProducts relatedIds={product.relatedProducts} />
        </div>
    )
}