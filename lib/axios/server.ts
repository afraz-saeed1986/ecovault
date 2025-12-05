// lib/axios/server.ts
import { cookies } from "next/headers"
import { apiServer } from "./instance"

export const getServerApi = async () => {
  const cookieStore = await cookies()
  const cookieList = cookieStore.getAll()
  return apiServer(cookieList)
}