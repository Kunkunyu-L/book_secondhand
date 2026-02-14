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
        { path: 'book-audit', name: 'BookAudit', component: () => import('../views/BookAudit.vue'), meta: { title: '书籍审核' } },
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
        { path: 'help-articles', name: 'HelpArticles', component: () => import('../views/HelpArticleManage.vue'), meta: { title: '帮助中心' } },
        { path: 'banners', name: 'Banners', component: () => import('../views/BannerManage.vue'), meta: { title: '轮播图管理' } },
        // 客服管理
        { path: 'chat-sessions', name: 'ChatSessions', component: () => import('../views/ChatSessionManage.vue'), meta: { title: '在线咨询' } },
        { path: 'tickets', name: 'Tickets', component: () => import('../views/TicketManage.vue'), meta: { title: '咨询工单' } },
        { path: 'faq-manage', name: 'FaqManage', component: () => import('../views/FaqManage.vue'), meta: { title: '常见问题库' } },
        { path: 'service-staff', name: 'ServiceStaff', component: () => import('../views/ServiceStaffManage.vue'), meta: { title: '客服人员' } },
        { path: 'quick-reply', name: 'QuickReply', component: () => import('../views/QuickReplyManage.vue'), meta: { title: '话术库' } },
        // 系统设置
        { path: 'roles', name: 'Roles', component: () => import('../views/RoleManage.vue'), meta: { title: '角色权限' } },
        { path: 'system-config', name: 'SystemConfig', component: () => import('../views/SystemConfig.vue'), meta: { title: '基础设置' } },
        { path: 'notification-config', name: 'NotificationConfig', component: () => import('../views/NotificationConfig.vue'), meta: { title: '消息通知' } },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) next('/login')
  else if (to.path === '/login' && token) next('/dashboard')
  else next()
})

export default router
