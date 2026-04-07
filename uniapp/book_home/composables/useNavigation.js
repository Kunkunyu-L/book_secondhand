/**
 * 导航相关的composable
 */

/**
 * 安全跳转页面（带登录检查）
 * @param {string} url - 目标页面路径
 * @param {boolean} needLogin - 是否需要登录
 */
export function navigateTo(url, needLogin = false) {
  if (needLogin) {
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/auth/login' })
      }, 500)
      return
    }
  }

  uni.navigateTo({ url }).catch(() => {
    uni.switchTab({ url }).catch(() => {})
  })
}

/**
 * 跳转到图书详情页
 * @param {number|string} bookId - 图书ID
 * @param {string} bookType - 图书类型 'user' | 'platform'
 */
export function goToBookDetail(bookId, bookType = 'user') {
  uni.navigateTo({
    url: `/components/detail?bookType=${bookType}&bookId=${bookId}`
  })
}

/**
 * 跳转到订单列表页
 * @param {string} tab - 订单类型
 */
export function goToOrders(tab = 'all') {
  navigateTo(`/pages/order/list?tab=${tab}`, true)
}

/**
 * 跳转到客服聊天
 */
export function goToService() {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  const request = require('@/untils/request.js').default
  request({ url: '/chat/session', method: 'POST', data: { target_id: 0, target_type: 'service' } })
    .then(res => {
      if (res.status === 200 && res.data) {
        uni.navigateTo({
          url: `/pages/chat/chat?session_id=${res.data.id}&target_name=${encodeURIComponent('平台客服')}`
        })
      }
    })
}

/**
 * 返回上一页
 * @param {number} delta - 返回层数
 */
export function goBack(delta = 1) {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({ delta })
  } else {
    uni.reLaunch({ url: '/pages/index/index' })
  }
}

/**
 * 跳转到首页（tab页）
 */
export function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

/**
 * 跳转到发布页
 * @param {string} type - 发布类型 'book' | 'post'
 */
export function goToPublish(type = 'book') {
  if (type === 'book') {
    navigateTo('/pages/publish/publish-entry', true)
  } else if (type === 'post') {
    navigateTo('/pages/discover/post-publish', true)
  }
}
