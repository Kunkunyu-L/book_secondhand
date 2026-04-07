import { ref } from 'vue'
import request from '@/untils/request.js'

/**
 * 用户认证相关的composable
 */
export function useAuth() {
  const token = ref('')
  const userInfo = ref({})

  /**
   * 初始化认证状态
   */
  function initAuth() {
    token.value = uni.getStorageSync('token') || ''
    userInfo.value = uni.getStorageSync('userInfo') || {}
  }

  /**
   * 检查是否已登录
   * @param {boolean} showToast - 是否显示提示
   * @returns {boolean} 是否已登录
   */
  function checkLogin(showToast = true) {
    if (!token.value) {
      if (showToast) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/auth/login' })
        }, 500)
      }
      return false
    }
    return true
  }

  /**
   * 加载用户信息
   */
  async function loadUserInfo() {
    if (!token.value) return

    try {
      const res = await request({ url: '/my/getUserInfo', method: 'GET' })
      userInfo.value = res.data || {}
      uni.setStorageSync('userInfo', userInfo.value)
    } catch (err) {
      console.error('获取用户信息失败:', err)
    }
  }

  /**
   * 退出登录
   */
  async function logout() {
    try {
      await request({ url: '/my/logout', method: 'POST' })
    } catch (e) {}
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    token.value = ''
    userInfo.value = {}
    uni.showToast({ title: '退出登录成功', icon: 'success' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    }, 1000)
  }

  return {
    token,
    userInfo,
    initAuth,
    checkLogin,
    loadUserInfo,
    logout
  }
}

/**
 * 简化的登录检查hook
 * @param {boolean} autoNavigate - 未登录时是否自动跳转
 * @returns {Function} 登录检查函数
 */
export function useLoginCheck(autoNavigate = true) {
  const checkLogin = () => {
    const token = uni.getStorageSync('token')
    if (!token) {
      if (autoNavigate) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/auth/login' })
        }, 500)
      }
      return false
    }
    return true
  }

  return { checkLogin }
}
