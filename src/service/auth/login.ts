import { apiRequest } from '@/service/http'
import type { LoginRequest, LoginResponse } from './types'

export function loginUser(body: LoginRequest) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
