const baseURL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return url.startsWith('/') ? baseURL + url : baseURL + '/' + url
}
