import type { Gender } from '@/types/user'

export type SignupRequest = {
  id: string
  password: string
  gender: Gender
  birth: string
  phone: string
}

export type SignupResponse = unknown
