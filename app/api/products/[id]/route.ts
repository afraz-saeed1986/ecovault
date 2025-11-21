import { NextResponse } from "next/server";
import { getProducts } from "@/lib/api";

export async function GET(
    request: Request,
    {params}: {params: Promise<{id: string}>}
) {
    const {id} = await params;
    const productId = parseInt(id);

    const productsData = await getProducts();
    const product = productsData.find(p => p.id === productId);

    if(!product) {
        return new NextResponse("Product Not Found", {status: 404});
    }

    return NextResponse.json(product);
}