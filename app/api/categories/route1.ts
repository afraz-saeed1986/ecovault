// // app/api/categories/route.ts
// import { NextResponse } from "next/server";
// import { api } from "@/lib/axios/instance";

// export async function GET() {
//   try {
//     const response = await api.get("/categories?select=id,name,icon");
//     return NextResponse.json(response.data);
//   } catch (error) {
//     return NextResponse.json([], { status: 500 });
//   }
// }