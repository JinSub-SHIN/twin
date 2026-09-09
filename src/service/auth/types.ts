import type { Gender } from '@/types/user'

export type SignupRequest = {
  id: string
  password: string
  gender: Gender
  birth: string
  phone: string
}

export type SignupResponse = unknown

export type CheckIdResponse = {
  available: boolean
}

export type PhoneCarrier = 'SKT' | 'KT' | 'LGU+' | '알뜰폰'

export type PhoneRequestBody = {
  phone: string
  carrier: PhoneCarrier
  birth6: string
  gender_code: string
}

export type PhoneRequestResponse = {
  code: string
}

export type PhoneConfirmBody = {
  phone: string
  code: string
}

export type PhoneConfirmResponse = {
  success: boolean
}

export type LoginRequest = {
  id: string
  password: string
}

export type LoginResponse = unknown
