import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/auth/Login.vue'),
      meta: { module: 'auth' }
    },
    {
      path: '/',
      component: () => import('../views/layout/Layout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/dashboard/Dashboard.vue'),
          meta: { title: '仪表盘', module: 'dashboard' }
        },
        {
          path: 'categories',
          name: 'Categories',
          component: () => import('../views/books/CategoryManage.vue'),
          meta: { title: '分类管理', module: 'books' }
        },
        {
          path: 'platform-books',
          name: 'PlatformBooks',
          component: () => import('../views/books/PlatformBookManage.vue'),
          meta: { title: '平台图书', module: 'books' }
        },
        {
          path: 'user-books',
          name: 'UserBooks',
          component: () => import('../views/books/UserBookManage.vue'),
          meta: { title: '用户图书', module: 'books' }
        },
        {
          path: 'orders',
          name: 'Orders',
          component: () => import('../views/orders/OrderManage.vue'),
          meta: { title: '订单列表', module: 'orders' }
        },
        {
          path: 'refunds',
          name: 'Refunds',
          component: () => import('../views/orders/RefundManage.vue'),
          meta: { title: '退款/售后', module: 'orders' }
        },
        {
          path: 'order-stats',
          name: 'OrderStats',
          component: () => import('../views/orders/OrderStats.vue'),
          meta: { title: '订单统计', module: 'orders' }
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('../views/users/UserManage.vue'),
          meta: { title: '用户列表', module: 'users' }
        },
        {
          path: 'violations',
          name: 'Violations',
          component: () => import('../views/users/ViolationManage.vue'),
          meta: { title: '违规处理', module: 'users' }
        },
        {
          path: 'payments',
          name: 'Payments',
          component: () => import('../views/transactions/PaymentRecord.vue'),
          meta: { title: '支付记录', module: 'transactions' }
        },
        {
          path: 'withdrawals',
          name: 'Withdrawals',
          component: () => import('../views/transactions/WithdrawalManage.vue'),
          meta: { title: '提现管理', module: 'transactions' }
        },
        {
          path: 'coupons',
          name: 'Coupons',
          component: () => import('../views/transactions/CouponManage.vue'),
          meta: { title: '优惠券管理', module: 'transactions' }
        },
        {
          path: 'announcements',
          name: 'Announcements',
          component: () => import('../views/content/AnnouncementManage.vue'),
          meta: { title: '公告管理', module: 'content' }
        },
        {
          path: 'banners',
          name: 'Banners',
          component: () => import('../views/content/BannerManage.vue'),
          meta: { title: '轮播图管理', module: 'content' }
        },
        {
          path: 'discover-posts',
          name: 'DiscoverPosts',
          component: () => import('../views/content/DiscoverPostManage.vue'),
          meta: { title: '帖子管理', module: 'content' }
        },
        {
          path: 'discover-posts/:id/comments',
          name: 'DiscoverPostComments',
          component: () => import('../views/content/DiscoverPostComments.vue'),
          meta: { title: '帖子评论', module: 'content' }
        },
        {
          path: 'chat-sessions',
          name: 'ChatSessions',
          component: () => import('../views/service/CustomerChatPage.vue'),
          meta: { title: '在线咨询', module: 'service' }
        },
        {
          path: 'chat-sessions-manage',
          name: 'ChatSessionsManage',
          component: () => import('../views/service/ChatSessionManage.vue'),
          meta: { title: '会话管理', module: 'service' }
        },
        {
          path: 'tickets',
          name: 'Tickets',
          component: () => import('../views/service/TicketManage.vue'),
          meta: { title: '咨询工单', module: 'service' }
        },
        {
          path: 'faq-manage',
          name: 'FaqManage',
          component: () => import('../views/service/FaqManage.vue'),
          meta: { title: '常见问题库', module: 'service' }
        },
        {
          path: 'system-config',
          name: 'SystemConfig',
          component: () => import('../views/system/SystemConfig.vue'),
          meta: { title: '全局设置', module: 'system' }
        },
        {
          path: 'role-pages',
          name: 'RolePages',
          component: () => import('../views/system/RolePageManage.vue'),
          meta: { title: '页面权限', module: 'system' }
        },
      ],
    },
    // 404页面 - 必须放在最后
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/error/NotFound.vue')
    }
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
    const { useAuthStore } = await import('../stores/modules/auth')
    const { usePermissionStore } = await import('../stores/modules/permission')
    const authStore = useAuthStore()
    const permissionStore = usePermissionStore()

    let role = authStore.role || localStorage.getItem('admin_role') || ''
    if (!role && token) {
      try {
        const tokenPart = token.replace('Bearer ', '').split('.')[1]
        if (tokenPart) {
          const payload = JSON.parse(atob(tokenPart))
          role = payload.role || ''
          authStore.role = role
          localStorage.setItem('admin_role', role)
        }
      } catch { /* ignore */ }
    }

    if (role !== 'superAdmin') {
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
  }

  next()
})

export default router
