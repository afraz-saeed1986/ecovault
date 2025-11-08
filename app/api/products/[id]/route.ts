import { NextResponse } from "next/server";
import productsData from "@/data/products.json";

export async function GET(
    request: Request,
    {params}: {params: {id: string}}
) {
    const {id} = await params;
    const productId = parseInt(id);
    const product = productsData.find(p => p.id === productId);

    if(!product) {
        return new NextResponse("Product Not Found", {status: 404});
    }

    return NextResponse.json(product);
}