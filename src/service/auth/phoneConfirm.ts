import { apiRequest } from '@/service/http'
import type { PhoneConfirmBody, PhoneConfirmResponse } from './types'

export function confirmPhoneCode(body: PhoneConfirmBody) {
  return apiRequest<PhoneConfirmResponse>('/auth/phone/confirm', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
