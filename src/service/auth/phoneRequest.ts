import { apiRequest } from '@/service/http'
import type { PhoneRequestBody, PhoneRequestResponse } from './types'

export function requestPhoneCode(body: PhoneRequestBody) {
  return apiRequest<PhoneRequestResponse>('/auth/phone/request', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
