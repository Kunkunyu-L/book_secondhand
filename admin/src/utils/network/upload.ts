import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export type UploadType = 'avatar' | 'book' | 'banner' | 'category' | 'logo' | 'discover' | 'platform' | 'other'

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
