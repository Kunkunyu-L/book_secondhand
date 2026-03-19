import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export type UploadType = 'avatar' | 'book' | 'banner' | 'category' | 'logo' | 'discover' | 'platform' | 'other'

/**
 * 上传图片到服务器（server 转发到 upload 服务）
 * @param file 文件对象（来自 input[type=file] 或 el-upload）
 * @param type 图片类型，用于存储到对应子目录
 * @returns 上传成功返回 { url, path, filename }，url 为完整地址
 */
export async function uploadImage(file: File, type: UploadType = 'book'): Promise<{ url: string; path: string; filename?: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const token = localStorage.getItem('admin_token')
  const res = await axios.post(`${baseURL}/upload/image?type=${type}`, formData, {
    headers: {
      ...(token ? { Authorization: token } : {}),
    },
    timeout: 30000,
  })
  const data = res.data
  if (data.status !== 200) throw new Error(data.message || '上传失败')
  return data.data
}

/**
 * 上传文件（图片+文档 pdf/doc/docx/xls/xlsx，最大 10MB）
 * @param file 文件对象
 * @param type 分类
 */
export async function uploadFile(file: File, type: UploadType = 'other'): Promise<{ url: string; path: string; filename?: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const token = localStorage.getItem('admin_token')
  const res = await axios.post(`${baseURL}/upload/file?type=${type}`, formData, {
    headers: {
      ...(token ? { Authorization: token } : {}),
    },
    timeout: 30000,
  })
  const data = res.data
  if (data.status !== 200) throw new Error(data.message || '上传失败')
  return data.data
}
