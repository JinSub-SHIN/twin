import { apiRequest } from '@/service/http'
import type { CheckIdResponse } from './types'

export async function checkLoginId(id: string) {
  const body = await apiRequest<CheckIdResponse>(
    `/auth/check-id?id=${encodeURIComponent(id)}`,
  )
  return body.available === true
}
