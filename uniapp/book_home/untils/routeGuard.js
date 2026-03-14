// 路由守卫 - 需要登录才能访问的页面
const needLoginPages = [
  '/pages/order/confirm',
  '/pages/order/list',
  '/pages/order/detail',
  '/pages/address/address',
  '/pages/profile/edit',
  '/pages/collection/collection',
  '/pages/setting/setting',
  '/pages/publish/publish',
  '/pages/publish/mybooks',
  '/pages/discover/my-posts',
  '/pages/discover/post-publish'
]

export function setupRouteGuard() {
  // 拦截 uni.navigateTo
  const originalNavigateTo = uni.navigateTo
  uni.navigateTo = function (options) {
    const url = options.url.split('?')[0]
    if (needLoginPages.includes(url)) {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => {
          originalNavigateTo.call(this, { url: '/pages/auth/login' })
        }, 500)
        return
      }
    }
    return originalNavigateTo.call(this, options)
  }

  const originalSwitchTab = uni.switchTab
  uni.switchTab = function (options) {
    return originalSwitchTab.call(this, options)
  }
}
