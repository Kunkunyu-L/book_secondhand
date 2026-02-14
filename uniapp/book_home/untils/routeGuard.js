// 路由守卫 - 需要登录才能访问的页面
const needLoginPages = [
  '/pages/cart/cart',
  '/pages/order/confirm',
  '/pages/order/list',
  '/pages/order/detail',
  '/pages/address/address',
  '/pages/profile/edit',
  '/pages/collection/collection',
  '/pages/setting/setting',
  '/pages/publish/publish',
  '/pages/publish/mybooks'
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

  // 拦截 uni.switchTab（购物车tab）
  const originalSwitchTab = uni.switchTab
  uni.switchTab = function (options) {
    // switchTab不做强制拦截，只在购物车页面onShow中检查
    return originalSwitchTab.call(this, options)
  }
}
