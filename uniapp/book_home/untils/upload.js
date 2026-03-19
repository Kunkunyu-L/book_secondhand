/**
 * 上传图片到服务器（server 转发到 upload 服务）
 * @param {string} filePath 本地临时文件路径（来自 uni.chooseImage 的 tempFilePaths）
 * @param {string} type 图片类型：avatar|book|banner|category|logo|discover|platform|other
 * @returns {Promise<{url: string, path?: string}>} 上传成功返回 { url }，url 为完整地址
 */
import { baseURL } from './config.js'

export function uploadImage(filePath, type = 'book') {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    const auth = token && !token.startsWith('Bearer ') ? 'Bearer ' + token : token || ''
    uni.uploadFile({
      url: baseURL + '/upload/image?type=' + (type || 'book'),
      filePath,
      name: 'file',
      header: auth ? { Authorization: auth } : {},
      success: (res) => {
        try {
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          if (data.status === 200 && data.data) {
            resolve(data.data)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (e) {
          reject(new Error('解析响应失败'))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '上传失败'))
      },
    })
  })
}

/**
 * 上传文件（图片+文档 pdf/doc/docx/xls/xlsx，最大 10MB）
 * @param {string} filePath 本地临时文件路径
 * @param {string} type 分类
 */
export function uploadFile(filePath, type = 'other') {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    const auth = token && !token.startsWith('Bearer ') ? 'Bearer ' + token : token || ''
    uni.uploadFile({
      url: baseURL + '/upload/file?type=' + (type || 'other'),
      filePath,
      name: 'file',
      header: auth ? { Authorization: auth } : {},
      success: (res) => {
        try {
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          if (data.status === 200 && data.data) {
            resolve(data.data)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (e) {
          reject(new Error('解析响应失败'))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '上传失败'))
      },
    })
  })
}
