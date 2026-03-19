const baseURL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

/**
 * 将相对路径转为完整图片 URL
 * 用于显示服务器上传的图片（如 /uploads/banner/xxx.jpg）
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return url.startsWith('/') ? baseURL + url : baseURL + '/' + url
}
