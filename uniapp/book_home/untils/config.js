const isDev = process.env.NODE_ENV === 'development'

/**
 * 接口基础地址
 * 开发环境：http://localhost:3000
 * 生产环境：http://59.110.64.215:3000
 */
export const baseURL = isDev ? 'http://localhost:3000' : 'http://59.110.64.215:3000'

/** 腾讯地图 API Key（行政区划：省市区） */
export const QQ_MAP_KEY = 'E36BZ-DBRKQ-IZ25K-25WGD-CFUT3-V5BL7'

/** 将相对路径转为完整图片 URL */
export function getImageUrl(url) {
  if (!url) return '/static/common.jpg'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = baseURL.replace(/\/$/, '')
  return url.startsWith('/') ? base + url : base + '/' + url
}
