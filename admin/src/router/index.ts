import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
    {
      path: '/',
      component: () => import('../views/Layout.vue'),
      redirect: '/dashboard',
      children: [
        { path: 'dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '仪表盘' } },
        // 书籍管理
        { path: 'categories', name: 'Categories', component: () => import('../views/CategoryManage.vue'), meta: { title: '分类管理' } },
        { path: 'platform-books', name: 'PlatformBooks', component: () => import('../views/PlatformBookManage.vue'), meta: { title: '平台图书' } },
        { path: 'user-books', name: 'UserBooks', component: () => import('../views/UserBookManage.vue'), meta: { title: '用户图书' } },
        // 订单管理
        { path: 'orders', name: 'Orders', component: () => import('../views/OrderManage.vue'), meta: { title: '订单列表' } },
        { path: 'refunds', name: 'Refunds', component: () => import('../views/RefundManage.vue'), meta: { title: '退款/售后' } },
        { path: 'order-stats', name: 'OrderStats', component: () => import('../views/OrderStats.vue'), meta: { title: '订单统计' } },
        // 用户管理
        { path: 'users', name: 'Users', component: () => import('../views/UserManage.vue'), meta: { title: '用户列表' } },
        { path: 'violations', name: 'Violations', component: () => import('../views/ViolationManage.vue'), meta: { title: '违规处理' } },
        // 交易管理
        { path: 'payments', name: 'Payments', component: () => import('../views/PaymentRecord.vue'), meta: { title: '支付记录' } },
        { path: 'withdrawals', name: 'Withdrawals', component: () => import('../views/WithdrawalManage.vue'), meta: { title: '提现管理' } },
        { path: 'coupons', name: 'Coupons', component: () => import('../views/CouponManage.vue'), meta: { title: '优惠券管理' } },
        // 内容管理
        { path: 'announcements', name: 'Announcements', component: () => import('../views/AnnouncementManage.vue'), meta: { title: '公告管理' } },
        { path: 'banners', name: 'Banners', component: () => import('../views/BannerManage.vue'), meta: { title: '轮播图管理' } },
        // 客服管理
        { path: 'chat-sessions', name: 'ChatSessions', component: () => import('../views/ChatSessionManage.vue'), meta: { title: '在线咨询' } },
        { path: 'tickets', name: 'Tickets', component: () => import('../views/TicketManage.vue'), meta: { title: '咨询工单' } },
        { path: 'faq-manage', name: 'FaqManage', component: () => import('../views/FaqManage.vue'), meta: { title: '常见问题库' } },
        // 系统设置
        { path: 'system-config', name: 'SystemConfig', component: () => import('../views/SystemConfig.vue'), meta: { title: '全局设置' } },
        { path: 'role-pages', name: 'RolePages', component: () => import('../views/RolePageManage.vue'), meta: { title: '页面权限' } },
        // 帖子管理
        { path: 'discover-posts', name: 'DiscoverPosts', component: () => import('../views/DiscoverPostManage.vue'), meta: { title: '帖子管理' } },
        { path: 'discover-posts/:id/comments', name: 'DiscoverPostComments', component: () => import('../views/DiscoverPostComments.vue'), meta: { title: '帖子评论' } },
      ],
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    next('/login')
    return
  }
  if (to.path === '/login' && token) {
    next('/dashboard')
    return
  }
  if (token && to.path !== '/login') {
    const { useAuthStore } = await import('../stores/auth')
    const { usePermissionStore } = await import('../stores/permission')
    const authStore = useAuthStore()
    const permissionStore = usePermissionStore()
    let role = authStore.role || localStorage.getItem('admin_role') || ''
    if (!role && token) {
      try {
        const payload = JSON.parse(atob(token.replace('Bearer ', '').split('.')[1]))
        role = payload.role || ''
        authStore.role = role
        localStorage.setItem('admin_role', role)
      } catch { /* ignore */ }
    }
    if (!permissionStore.rolePagePermission.superAdmin?.length) {
      try {
        await permissionStore.loadRolePagePermission()
      } catch { /* ignore */ }
    }
    const can = permissionStore.canAccess(to.path, role)
    if (!can) {
      next('/dashboard')
      return
    }
  }
  next()
})

export default router
