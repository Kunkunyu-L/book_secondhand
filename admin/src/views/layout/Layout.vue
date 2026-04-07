<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'
import { usePermissionStore } from '@/stores/modules/permission'
import { getNotificationsApi, markNotificationReadApi, deleteNotificationApi, getConfigsApi } from '@/api'
import { connectSocket } from '@/utils/network'
import { playOrderNotifySound, playChatNotifySound } from '@/utils/helpers'
import { ElNotification } from 'element-plus'
import { Reading, DataBoard, Document, User, Money, Notebook, Service, Setting, Key, Bell, UserFilled, SwitchButton, Fold, Expand } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const isCollapse = ref(false)
const unreadCount = ref(0)
const notifications = ref<any[]>([])
const notifyVisible = ref(false)
const siteName = ref('二手书')
let notifyTimer: any = null

const activeMenu = computed(() => route.path)

const defaultOpeneds = computed(() => {
  const path = route.path
  if (['/platform-books', '/user-books', '/categories'].includes(path)) return ['books']
  if (['/orders', '/refunds', '/order-stats'].includes(path)) return ['order-group']
  if (['/users', '/violations'].includes(path)) return ['user-group']
  if (['/payments', '/withdrawals', '/coupons'].includes(path)) return ['transactions']
  if (['/announcements', '/banners', '/discover-posts'].includes(path)) return ['content']
  if (['/chat-sessions', '/chat-sessions-manage', '/tickets', '/faq-manage'].includes(path)) return ['service']
  if (path === '/system-config') return []
  return []
})

const canAccess = (path: string) => {
  const role = authStore.role || localStorage.getItem('admin_role') || ''
  return permissionStore.canAccess(path, role)
}

const loadNotifications = async () => {
  try {
    const res: any = await getNotificationsApi()
    if (res.status === 200) {
      unreadCount.value = res.data.unreadCount || 0
      notifications.value = res.data.list?.slice(0, 20) || []
    }
  } catch {}
}

const markAllRead = async () => {
  try {
    await markNotificationReadApi({ id: 'all' })
    unreadCount.value = 0
    notifications.value.forEach(n => n.is_read = 1)
  } catch {}
}

const markOneRead = async (n: any, e: Event) => {
  e.stopPropagation()
  if (n.is_read) return
  try {
    await markNotificationReadApi({ id: n.id })
    n.is_read = 1
    if (unreadCount.value > 0) unreadCount.value--
  } catch {}
}

const deleteOne = async (n: any, e: Event) => {
  e.stopPropagation()
  try {
    await deleteNotificationApi({ id: n.id })
    notifications.value = notifications.value.filter((x: any) => x.id !== n.id)
    if (!n.is_read && unreadCount.value > 0) unreadCount.value--
  } catch {}
}

function setupRealtimeNotify() {
  const socket = connectSocket()
  if (!socket) return

  socket.off('notification').on('notification', (payload: any) => {
    const title = payload?.title || '系统通知'
    const content = payload?.content || ''
    const type = payload?.type || 'order'
    ElNotification({
      title,
      message: content,
      type: type === 'refund' ? 'warning' : 'info',
      position: 'top-right',
      duration: 5000,
      onClick: () => {
        if (type === 'order') router.push('/orders')
        else if (type === 'refund') router.push('/refunds')
      },
    })
    playOrderNotifySound()
    loadNotifications()
  })

  socket.off('new_message').on('new_message', (payload: any) => {
    if (payload?.sender_role === 'user') {
      ElNotification({
        title: '新客服消息',
        message: '有用户发来客服消息，请及时回复',
        type: 'info',
        position: 'top-right',
        duration: 5000,
        onClick: () => router.push('/chat-sessions'),
      })
      playChatNotifySound()
      loadNotifications()
    }
  })

  socket.off('new_ticket').on('new_ticket', (payload: any) => {
    ElNotification({
      title: payload?.title || '新咨询工单',
      message: payload?.content || '有用户提交了新工单，请及时处理',
      type: 'warning',
      position: 'top-right',
      duration: 6000,
      onClick: () => router.push('/tickets'),
    })
    playOrderNotifySound()
    loadNotifications()
  })
}

const loadSiteConfig = async () => {
  try {
    const res: any = await getConfigsApi()
    if (res.status === 200 && res.data?.configs?.site_name) {
      siteName.value = res.data.configs.site_name
    }
  } catch {}
}

const pageTitle = computed(() => {
  const t = route.meta?.title
  return t ? `${siteName.value}后台管理 - ${t}` : `${siteName.value}后台管理`
})

onMounted(() => {
  loadSiteConfig()
  loadNotifications()
  if (!permissionStore.rolePagePermission.superAdmin?.length) {
    permissionStore.loadRolePagePermission().catch(() => {})
  }
  notifyTimer = setInterval(loadNotifications, 30000)
  setupRealtimeNotify()
})

onUnmounted(() => { if (notifyTimer) clearInterval(notifyTimer) })

watch(pageTitle, (v) => { document.title = v }, { immediate: true })

const handleLogout = () => { authStore.logout(); router.push('/login') }
</script>

<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo">
        <el-icon :size="22" class="logo-icon"><Reading /></el-icon>
        <span v-if="!isCollapse" class="logo-text">{{ siteName }} 后台</span>
      </div>
      <el-scrollbar>
        <el-menu
          :default-active="activeMenu"
          :default-openeds="defaultOpeneds"
          :collapse="isCollapse"
          router
          background-color="#fafafa"
          text-color="#4b5563"
          active-text-color="#1f2937"
          :collapse-transition="false"
          unique-opened
          class="sidebar-menu"
        >
          <el-menu-item v-if="canAccess('/dashboard')" index="/dashboard">
            <el-icon><DataBoard /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>

          <el-sub-menu v-if="canAccess('/categories') || canAccess('/platform-books') || canAccess('/user-books')" index="books">
            <template #title><el-icon><Reading /></el-icon><span>书籍管理</span></template>
            <el-menu-item v-if="canAccess('/categories')" index="/categories">分类管理</el-menu-item>
            <el-menu-item v-if="canAccess('/platform-books')" index="/platform-books">平台图书</el-menu-item>
            <el-menu-item v-if="canAccess('/user-books')" index="/user-books">用户图书</el-menu-item>
          </el-sub-menu>

          <el-sub-menu v-if="canAccess('/orders') || canAccess('/refunds') || canAccess('/order-stats')" index="order-group">
            <template #title><el-icon><Document /></el-icon><span>订单管理</span></template>
            <el-menu-item v-if="canAccess('/orders')" index="/orders">订单列表</el-menu-item>
            <el-menu-item v-if="canAccess('/refunds')" index="/refunds">退款/售后</el-menu-item>
            <el-menu-item v-if="canAccess('/order-stats')" index="/order-stats">订单统计</el-menu-item>
          </el-sub-menu>

          <el-sub-menu v-if="canAccess('/users') || canAccess('/violations')" index="user-group">
            <template #title><el-icon><User /></el-icon><span>用户管理</span></template>
            <el-menu-item v-if="canAccess('/users')" index="/users">用户列表</el-menu-item>
            <el-menu-item v-if="canAccess('/violations')" index="/violations">违规处理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu v-if="canAccess('/payments') || canAccess('/withdrawals') || canAccess('/coupons')" index="transactions">
            <template #title><el-icon><Money /></el-icon><span>交易管理</span></template>
            <el-menu-item v-if="canAccess('/payments')" index="/payments">支付记录</el-menu-item>
            <el-menu-item v-if="canAccess('/withdrawals')" index="/withdrawals">提现管理</el-menu-item>
            <el-menu-item v-if="canAccess('/coupons')" index="/coupons">优惠券管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu v-if="canAccess('/announcements') || canAccess('/banners') || canAccess('/discover-posts')" index="content">
            <template #title><el-icon><Notebook /></el-icon><span>内容管理</span></template>
            <el-menu-item v-if="canAccess('/announcements')" index="/announcements">公告管理</el-menu-item>
            <el-menu-item v-if="canAccess('/banners')" index="/banners">轮播图管理</el-menu-item>
            <el-menu-item v-if="canAccess('/discover-posts')" index="/discover-posts">帖子管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu v-if="canAccess('/chat-sessions') || canAccess('/chat-sessions-manage') || canAccess('/tickets') || canAccess('/faq-manage')" index="service">
            <template #title><el-icon><Service /></el-icon><span>客服管理</span></template>
            <el-menu-item v-if="canAccess('/chat-sessions-manage')" index="/chat-sessions-manage">会话管理</el-menu-item>
            <el-menu-item v-if="canAccess('/chat-sessions')" index="/chat-sessions">在线咨询</el-menu-item>
            <el-menu-item v-if="canAccess('/tickets')" index="/tickets">咨询工单</el-menu-item>
            <el-menu-item v-if="canAccess('/faq-manage')" index="/faq-manage">常见问题库</el-menu-item>
          </el-sub-menu>

          <el-menu-item v-if="canAccess('/system-config')" index="/system-config">
            <el-icon><Setting /></el-icon>
            <template #title>全局设置</template>
          </el-menu-item>

          <el-menu-item v-if="canAccess('/role-pages')" index="/role-pages">
            <el-icon><Key /></el-icon>
            <template #title>页面权限</template>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" /><Expand v-else />
          </el-icon>
          <span class="page-title">{{ route.meta.title || '后台管理' }}</span>
        </div>
        <div class="header-right">
          <el-popover v-model:visible="notifyVisible" placement="bottom-end" :width="360" trigger="click" @show="loadNotifications">
            <template #reference>
              <el-badge :value="unreadCount" :hidden="!unreadCount" class="notify-badge">
                <el-icon :size="20" class="notify-icon"><Bell /></el-icon>
              </el-badge>
            </template>
            <div class="notify-header">
              <span style="font-weight:600">通知</span>
              <el-button v-if="unreadCount > 0" type="primary" text size="small" @click="markAllRead">全部已读</el-button>
            </div>
            <el-scrollbar max-height="320px">
              <div v-if="notifications.length === 0" style="text-align:center;padding:20px;color:#909399">暂无通知</div>
              <div v-for="n in notifications" :key="n.id" class="notify-item" :class="{ unread: !n.is_read }" @click="markOneRead(n, $event)">
                <div class="notify-body">
                  <div class="notify-title">{{ n.title }}</div>
                  <div class="notify-content">{{ n.content }}</div>
                  <div class="notify-time">{{ n.created_at }}</div>
                </div>
                <el-button type="danger" link size="small" class="notify-del" @click="deleteOne(n, $event)">删除</el-button>
              </div>
            </el-scrollbar>
          </el-popover>

          <el-divider direction="vertical" />
          <el-icon><UserFilled /></el-icon>
          <span class="username">{{ authStore.username || 'Admin' }}</span>
          <el-divider direction="vertical" />
          <el-button type="primary" text size="small" @click="handleLogout">
            <el-icon style="margin-right:4px"><SwitchButton /></el-icon>退出
          </el-button>
        </div>
      </el-header>
      <el-main class="layout-main"><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container { height: 100vh; }
.layout-aside {
  background: #fafafa;
  border-right: 1px solid #e5e7eb;
  transition: width 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.logo-icon { color: #374151; }
.logo-text { color: #1f2937; font-size: 15px; font-weight: 600; letter-spacing: 0.02em; white-space: nowrap; }
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 20px;
  height: 56px;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.collapse-btn { font-size: 18px; cursor: pointer; color: #6b7280; transition: color 0.2s; }
.collapse-btn:hover { color: #1f2937; }
.page-title { font-size: 15px; font-weight: 500; color: #1f2937; }
.header-right { display: flex; align-items: center; gap: 8px; color: #6b7280; }
.username { font-size: 14px; }
.layout-main { background: #f1f3f5; padding: 20px; overflow-y: auto; }

.sidebar-menu { border-right: none; }
.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) { color: #4b5563; }
.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) { background: #f3f4f6 !important; color: #1f2937; }
.sidebar-menu :deep(.el-menu-item.is-active) {
  background: #eef1f5 !important;
  color: #1f2937;
  font-weight: 500;
}

.notify-icon { cursor: pointer; color: #6b7280; transition: color 0.2s; }
.notify-icon:hover { color: #1f2937; }
.notify-badge { cursor: pointer; }
.notify-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; margin-bottom: 8px; }
.notify-item { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; padding: 8px 4px; border-bottom: 1px solid #f3f4f6; cursor: pointer; }
.notify-item.unread { background: #f8fafc; }
.notify-item:hover { background: #f3f4f6; }
.notify-body { flex: 1; min-width: 0; }
.notify-title { font-size: 13px; font-weight: 500; color: #1f2937; }
.notify-content { font-size: 12px; color: #6b7280; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notify-time { font-size: 11px; color: #9ca3af; margin-top: 4px; }
.notify-del { flex-shrink: 0; }
</style>
