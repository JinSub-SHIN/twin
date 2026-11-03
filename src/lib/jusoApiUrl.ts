/** dev: vite proxy, prod: vercel/netlify rewrite — 경로는 동일 */
export const JUSO_PROXY_PREFIX = '/juso-api'

export function jusoApiUrl(searchParams: URLSearchParams) {
  const prefix = JUSO_PROXY_PREFIX.replace(/\/$/, '')
  return `${prefix}/addrlink/addrLinkApi.do?${searchParams.toString()}`
}
