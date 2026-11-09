import { authHeaders } from '@/lib/authStorage'
import { apiRequest, ApiError } from '@/service/http'

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

export type ReceivedApplication = {
  id: string
  status: ApplicationStatus
  message: string | null
  created_at: string
  responded_at: string | null
  room_id: string
  room_district: string
  room_subway_stn: string
  applicant_nick: string
  applicant_gender: string
  applicant_age: number
}

export type SentApplication = {
  id: string
  status: ApplicationStatus
  message: string | null
  created_at: string
  responded_at: string | null
  room_id: string
  room_district: string
  room_subway_stn: string
}

export type ReceivedApplicationsResponse = {
  applications: ReceivedApplication[]
}

export type SentApplicationsResponse = {
  applications: SentApplication[]
}

export type RespondApplicationBody = {
  status: 'accepted' | 'rejected'
}

export type RespondApplicationResponse = {
  success: boolean
  status: 'accepted' | 'rejected'
  chat_room_id?: string
}

export function getReceivedApplications() {
  return apiRequest<ReceivedApplicationsResponse>(
    '/room/applications/received',
    { headers: authHeaders() },
  )
}

export function getSentApplications() {
  return apiRequest<SentApplicationsResponse>('/room/applications/sent', {
    headers: authHeaders(),
  })
}

export function respondToApplication(
  applyId: string,
  body: RespondApplicationBody,
) {
  return apiRequest<RespondApplicationResponse>(
    `/room/applications/${encodeURIComponent(applyId)}`,
    {
      method: 'PATCH',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )
}

export type CancelApplicationResponse = {
  success: boolean
}

/** 신청자 · 대기 중 신청 취소 */
export function cancelApplication(applyId: string) {
  return apiRequest<CancelApplicationResponse>(
    `/room/applications/${encodeURIComponent(applyId)}`,
    {
      method: 'DELETE',
      headers: authHeaders(),
    },
  )
}

export function applicationErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'body' in error) {
    const body = (error as { body: unknown }).body
    if (body && typeof body === 'object') {
      const record = body as { code?: string; message?: string }
      switch (record.code) {
        case 'MISSING_TOKEN':
        case 'INVALID_TOKEN':
          return '로그인이 필요해요. 다시 로그인해 주세요.'
        case 'APPLY_NOT_FOUND':
          return '신청 내역을 찾을 수 없어요.'
        case 'FORBIDDEN':
          return '이 신청을 처리할 수 없어요.'
        case 'ALREADY_RESPONDED':
          return '이미 처리된 신청이에요.'
        case 'APPLY_NOT_PENDING':
          return '대기 중인 신청만 취소할 수 있어요.'
        default:
          if (typeof record.message === 'string' && record.message.trim()) {
            return record.message
          }
      }
    }
  }
  if (error instanceof ApiError && error.message) return error.message
  if (error instanceof Error && error.message) return error.message
  return '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.'
}
