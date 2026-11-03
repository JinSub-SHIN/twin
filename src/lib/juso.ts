import { jusoApiUrl } from './jusoApiUrl'

export type JusoItem = {
  roadAddr: string
  jibunAddr: string
  zipNo: string
  emdNm?: string
  siNm?: string
  sggNm?: string
}

type JusoResponse = {
  results?: {
    common?: {
      errorCode?: string
      errorMessage?: string
    }
    juso?: JusoItem[] | null
  }
}

function jusoConfmKey() {
  const fromEnv = (import.meta.env.VITE_JUSO_CONFM_KEY ?? '').trim()
  if (fromEnv) return fromEnv
  return 'U01TX0FVVEgyMDIxMDEyODExMTIxODExMDc1MTU='
}

export async function searchJuso(keyword: string, page = 1): Promise<JusoItem[]> {
  const query = keyword.trim()
  if (query.length < 2) return []

  const params = new URLSearchParams({
    confmKey: jusoConfmKey(),
    currentPage: String(page),
    countPerPage: '15',
    keyword: query,
    resultType: 'json',
  })

  const response = await fetch(jusoApiUrl(params))
  if (!response.ok) {
    throw new Error('주소 검색에 실패했습니다.')
  }

  const raw = await response.text()
  let data: JusoResponse
  try {
    data = JSON.parse(raw) as JusoResponse
  } catch {
    throw new Error(
      raw.trimStart().startsWith('<')
        ? '주소 검색 서버에 연결할 수 없습니다. 배포 환경이면 /juso-api 프록시(vercel.json 등)를 확인해 주세요.'
        : '주소 검색 응답을 처리할 수 없습니다.',
    )
  }

  const errorCode = data.results?.common?.errorCode
  if (errorCode && errorCode !== '0') {
    throw new Error(
      data.results?.common?.errorMessage || '주소 검색에 실패했습니다.',
    )
  }

  return data.results?.juso ?? []
}
