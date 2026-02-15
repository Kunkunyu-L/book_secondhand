<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getNotificationsApi, markNotificationReadApi, deleteNotificationApi, getConfigsApi } from '../api'
import { connectSocket } from '../utils/socket'
import { playOrderNotifySound, playChatNotifySound } from '../utils/notificationSound'
import { ElNotification } from 'element-plus'
import AdminChat from '../components/AdminChat.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isCollapse = ref(false)
const unreadCount = ref(0)
const notifications = ref<any[]>([])
const notifyVisible = ref(false)
const siteName = ref('二手书')
let notifyTimer: any = null

const activeMenu = computed(() => route.path)

const defaultOpeneds = computed(() => {
  const path = route.path
  if (['/platform-books', '/user-books', '/book-audit', '/categories'].includes(path)) return ['books']
  if (['/orders', '/refunds', '/order-stats'].includes(path)) return ['order-group']
  if (['/users', '/violations'].includes(path)) return ['user-group']
  if (['/payments', '/withdrawals', '/coupons'].includes(path)) return ['transactions']
  if (['/announcements', '/help-articles', '/banners'].includes(path)) return ['content']
  if (['/chat-sessions', '/tickets', '/faq-manage', '/service-staff', '/quick-reply'].includes(path)) return ['service']
  if (['/roles', '/system-config', '/notification-config'].includes(path)) return ['system']
  return []
})

const loadNotifications = async () => {
  try {
    const res: any = await getNotificationsApi({ unread: '1' })
    if (res.status === 200) {
      unreadCount.value = res.data.unreadCount || 0
      notifications.value = res.data.list?.slice(0, 10) || []
    }
  } catch { /* ignore */ }
}

const markAllRead = async () => {
  try {
    await markNotificationReadApi({ id: 'all' })
    unreadCount.value = 0
    notifications.value.forEach(n => n.is_read = 1)
  } catch { /* ignore */ }
}

const markOneRead = async (n: any, e: Event) => {
  e.stopPropagation()
  if (n.is_read) return
  try {
    await markNotificationReadApi({ id: n.id })
    n.is_read = 1
    if (unreadCount.value > 0) unreadCount.value--
  } catch { /* ignore */ }
}

const deleteOne = async (n: any, e: Event) => {
  e.stopPropagation()
  try {
    await deleteNotificationApi({ id: n.id })
    notifications.value = notifications.value.filter((x: any) => x.id !== n.id)
    if (!n.is_read && unreadCount.value > 0) unreadCount.value--
  } catch { /* ignore */ }
}

// 实时通知：右上角弹窗 + 提示音
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
    const fromUser = payload?.sender_role === 'user' ? '用户' : '客服'
    ElNotification({
      title: '新客服消息',
      message: `${fromUser}发来新消息，请及时处理`,
      type: 'info',
      position: 'top-right',
      duration: 5000,
      onClick: () => router.push('/chat-sessions'),
    })
    playChatNotifySound()
    loadNotifications()
  })
}

const loadSiteConfig = async () => {
  try {
    const res: any = await getConfigsApi()
    if (res.status === 200 && res.data?.configs?.site_name) {
      siteName.value = res.data.configs.site_name
    }
  } catch { /* 使用默认值 */ }
}

const pageTitle = computed(() => {
  const t = route.meta?.title
  return t ? `${siteName.value}后台管理 - ${t}` : `${siteName.value}后台管理`
})

onMounted(() => {
  loadSiteConfig()
  loadNotifications()
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
        <el-icon :size="24" color="#409EFF"><Reading /></el-icon>
        <span v-if="!isCollapse" class="logo-text">{{ siteName }}后台管理</span>
      </div>
      <el-scrollbar>
        <el-menu :default-active="activeMenu" :default-openeds="defaultOpeneds" :collapse="isCollapse" router
          background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF" :collapse-transition="false" unique-opened>

          <el-menu-item index="/dashboard">
            <el-icon><DataBoard /></el-icon><template #title>仪表盘</template>
          </el-menu-item>

          <el-sub-menu index="books">
            <template #title><el-icon><Reading /></el-icon><span>书籍管理</span></template>
            <el-menu-item index="/categories">分类管理</el-menu-item>
            <el-menu-item index="/platform-books">平台图书</el-menu-item>
            <el-menu-item index="/user-books">用户图书</el-menu-item>
            <el-menu-item index="/book-audit">书籍审核</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="order-group">
            <template #title><el-icon><Document /></el-icon><span>订单管理</span></template>
            <el-menu-item index="/orders">订单列表</el-menu-item>
            <el-menu-item index="/refunds">退款/售后</el-menu-item>
            <el-menu-item index="/order-stats">订单统计</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="user-group">
            <template #title><el-icon><User /></el-icon><span>用户管理</span></template>
            <el-menu-item index="/users">用户列表</el-menu-item>
            <el-menu-item index="/violations">违规处理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="transactions">
            <template #title><el-icon><Money /></el-icon><span>交易管理</span></template>
            <el-menu-item index="/payments">支付记录</el-menu-item>
            <el-menu-item index="/withdrawals">提现管理</el-menu-item>
            <el-menu-item index="/coupons">优惠券管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="content">
            <template #title><el-icon><Notebook /></el-icon><span>内容管理</span></template>
            <el-menu-item index="/announcements">公告管理</el-menu-item>
            <el-menu-item index="/help-articles">帮助中心</el-menu-item>
            <el-menu-item index="/banners">轮播图管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="service">
            <template #title><el-icon><Service /></el-icon><span>客服管理</span></template>
            <el-menu-item index="/chat-sessions">在线咨询</el-menu-item>
            <el-menu-item index="/tickets">咨询工单</el-menu-item>
            <el-menu-item index="/faq-manage">常见问题库</el-menu-item>
            <el-menu-item index="/service-staff">客服人员</el-menu-item>
            <el-menu-item index="/quick-reply">话术库</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="system">
            <template #title><el-icon><Setting /></el-icon><span>系统设置</span></template>
            <el-menu-item index="/roles">角色权限</el-menu-item>
            <el-menu-item index="/system-config">基础设置</el-menu-item>
            <el-menu-item index="/notification-config">消息通知</el-menu-item>
          </el-sub-menu>

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
          <!-- 通知铃铛 -->
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
          <el-button type="danger" text size="small" @click="handleLogout">
            <el-icon style="margin-right:4px"><SwitchButton /></el-icon>退出
          </el-button>
        </div>
      </el-header>
      <el-main class="layout-main"><router-view /></el-main>
    </el-container>

    <!-- 管理端悬浮聊天 -->
    <AdminChat />
  </el-container>
</template>

<style scoped>
.layout-container { height: 100vh; }
.layout-aside { background-color: #304156; transition: width 0.3s; overflow: hidden; display: flex; flex-direction: column; }
.logo { height: 56px; display: flex; align-items: center; justify-content: center; gap: 8px; background: #263445; flex-shrink: 0; }
.logo-text { color: #fff; font-size: 16px; font-weight: 600; white-space: nowrap; }
.layout-header { display: flex; align-items: center; justify-content: space-between; background: #fff; box-shadow: 0 1px 4px rgba(0,21,41,0.08); padding: 0 20px; height: 56px; }
.header-left { display: flex; align-items: center; gap: 12px; }
.collapse-btn { font-size: 20px; cursor: pointer; color: #606266; transition: color 0.2s; }
.collapse-btn:hover { color: #409EFF; }
.page-title { font-size: 16px; font-weight: 500; color: #303133; }
.header-right { display: flex; align-items: center; gap: 8px; color: #606266; }
.username { font-size: 14px; }
.layout-main { background: #f0f2f5; padding: 20px; overflow-y: auto; }
.el-menu { border-right: none; }
.notify-icon { cursor: pointer; color: #606266; transition: color 0.2s; }
.notify-icon:hover { color: #409EFF; }
.notify-badge { cursor: pointer; }
.notify-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #ebeef5; margin-bottom: 8px; }
.notify-item { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; padding: 8px 4px; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
.notify-item.unread { background: #f0f9ff; }
.notify-item:hover { background: #f5f7fa; }
.notify-body { flex: 1; min-width: 0; }
.notify-title { font-size: 13px; font-weight: 500; color: #303133; }
.notify-content { font-size: 12px; color: #909399; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notify-time { font-size: 11px; color: #c0c4cc; margin-top: 4px; }
.notify-del { flex-shrink: 0; }
</style>
