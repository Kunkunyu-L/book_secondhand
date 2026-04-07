import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginApi } from '@/api'

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

const ADMIN_ROLES = ['superAdmin', 'operationAdmin', 'customerService']

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const username = ref(localStorage.getItem('admin_username') || '')
  const role = ref(localStorage.getItem('admin_role') || '')

  const login = async (credentials: {
    username: string
    password: string
    captchaToken?: string
    captchaValue?: string
  }) => {
    const res: any = await loginApi(credentials)
    if (res.status === 200 && res.token) {
      const payload = decodeToken(res.token)
      if (!payload) throw new Error('登录信息无效')
      if (!ADMIN_ROLES.includes(payload.role)) throw new Error('该账号无后台权限')
      token.value = res.token
      username.value = payload.username
      role.value = payload.role || ''
      localStorage.setItem('admin_token', res.token)
      localStorage.setItem('admin_username', payload.username)
      localStorage.setItem('admin_role', role.value)
      return true
    }
    throw new Error(res.message || '登录失败')
  }

  const logout = () => {
    token.value = ''
    username.value = ''
    role.value = ''
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
    localStorage.removeItem('admin_role')
  }

  return { token, username, role, login, logout }
})
