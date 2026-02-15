/**
 * 接口基础地址
 * - 本机浏览器/模拟器：localhost 即可
 * - 真机调试：改为电脑局域网 IP，例如 http://192.168.1.100:3000
 */
export const baseURL = 'http://localhost:3000'

/** 腾讯地图 API Key（行政区划：省市区） */
export const QQ_MAP_KEY = 'E36BZ-DBRKQ-IZ25K-25WGD-CFUT3-V5BL7'

/** 将相对路径转为完整图片 URL */
export function getImageUrl(url) {
  if (!url) return '/static/common.jpg'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = baseURL.replace(/\/$/, '')
  return url.startsWith('/') ? base + url : base + '/' + url
}
