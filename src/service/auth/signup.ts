import { apiRequest } from '@/service/http'
import type { SignupRequest, SignupResponse } from './types'

export function signupUser(body: SignupRequest) {
  return apiRequest<SignupResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
