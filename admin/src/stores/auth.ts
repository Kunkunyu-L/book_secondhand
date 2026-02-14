import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginApi } from '../api'

// 解码 JWT Token
function decodeToken(token: string) {
  try {
    const parts = token.replace('Bearer ', '').split('.')
    if (parts.length < 2) return null
    const payload = parts[1]!
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const username = ref(localStorage.getItem('admin_username') || '')

  const login = async (credentials: {
    username: string
    password: string
    captchaToken?: string
    captchaValue?: string
    identity?: 'admin' | 'service'
  }) => {
    const res: any = await loginApi(credentials)
    if (res.status === 200 && res.token) {
      const payload = decodeToken(res.token)
      if (!payload) throw new Error('登录信息无效')
      // 管理员或客服均可进入后台
      const allowed = payload.role === 'admin' || payload.is_service === 1
      if (!allowed) throw new Error('该账号无后台权限')
      token.value = res.token
      username.value = payload.username
      localStorage.setItem('admin_token', res.token)
      localStorage.setItem('admin_username', payload.username)
      return true
    }
    throw new Error(res.message || '登录失败')
  }

  const logout = () => {
    token.value = ''
    username.value = ''
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
  }

  return { token, username, login, logout }
})
