<template>
  <view class="ticket-page">
    <view class="form-card">
      <view class="form-title">提交工单</view>
      
      <view class="form-item">
        <text class="form-label">工单标题</text>
        <input class="form-input" placeholder="简要描述您的问题" v-model="title" maxlength="50" />
      </view>

      <view class="form-item">
        <text class="form-label">问题描述</text>
        <textarea class="form-textarea" placeholder="请详细描述您的问题，以便我们快速处理..." v-model="content" maxlength="1000" />
      </view>

      <view class="form-item">
        <text class="form-label">关联订单号（可选）</text>
        <input class="form-input" placeholder="如与订单相关，请填写订单ID" v-model="relatedOrderId" type="number" />
      </view>

      <button class="submit-btn" @click="submit" :disabled="submitting">{{ submitting ? '提交中...' : '提交工单' }}</button>
    </view>

    <!-- 我的工单记录 -->
    <view class="section-title" v-if="tickets.length > 0">我的工单</view>
    <view class="ticket-list">
      <view class="ticket-item" v-for="item in tickets" :key="item.id">
        <view class="ticket-header">
          <text class="ticket-title-text">{{ item.title }}</text>
          <text class="ticket-status" :class="'s-' + item.status">{{ statusLabel(item.status) }}</text>
        </view>
        <text class="ticket-content">{{ item.content }}</text>
        <view class="ticket-footer">
          <text class="ticket-time">{{ formatTime(item.created_at || item.updated_at) }}</text>
          <text class="ticket-priority" :class="'p-' + item.priority">{{ priorityLabel(item.priority) }}</text>
        </view>
        <view class="ticket-reply" v-if="item.reply">
          <text class="reply-label">客服回复：</text>
          <text>{{ item.reply }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import request from '@/untils/request.js'

const title = ref('')
const content = ref('')
const relatedOrderId = ref('')
const submitting = ref(false)
const tickets = ref([])

onLoad((options) => {
  if (options.order_id) relatedOrderId.value = options.order_id
})

onShow(() => { loadTickets() })

const submit = async () => {
  if (!title.value.trim()) return uni.showToast({ title: '请输入标题', icon: 'none' })
  if (!content.value.trim()) return uni.showToast({ title: '请描述问题', icon: 'none' })
  submitting.value = true
  const ticket_no = generateTicketNo()
  try {
    await request({
      url: '/client/ticket',
      method: 'POST',
      data: {
        ticket_no,
        title: title.value,
        content: content.value,
        related_order_id: relatedOrderId.value || undefined
      }
    })
    uni.showToast({ title: '工单已提交', icon: 'success' })
    title.value = ''
    content.value = ''
    relatedOrderId.value = ''
    loadTickets()
  } catch (e) {
    const msg = (e && e.message) ? e.message : '提交失败，请检查网络或稍后重试'
    uni.showToast({ title: msg, icon: 'none' })
  } finally {
    submitting.value = false
  }
}

const loadTickets = async () => {
  try {
    const res = await request({ url: '/client/tickets', method: 'GET' })
    tickets.value = res.data || []
  } catch (e) {}
}

const statusLabel = (s) => ({ pending: '待处理', processing: '处理中', closed: '已关闭' }[s] || s)
const priorityLabel = (p) => ({ low: '低', normal: '普通', high: '紧急', urgent: '特急' }[p] || p)

const generateTicketNo = () => {
  // 30位以内：时间戳 + 随机数（避免重复）
  const t = Date.now().toString(36).toUpperCase()
  const r = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `T${t}${r}`.slice(0, 30)
}

const formatTime = (time) => {
  if (!time) return '-'
  const d = new Date(time)
  if (Number.isNaN(d.getTime())) return String(time)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
</script>

<style scoped>
.ticket-page { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.form-card { background: #fff; border-radius: 16rpx; padding: 30rpx; margin-bottom: 20rpx; }
.form-title { font-size: 34rpx; font-weight: bold; color: #333; margin-bottom: 30rpx; }
.form-item { margin-bottom: 24rpx; }
.form-label { font-size: 28rpx; color: #333; display: block; margin-bottom: 12rpx; }
.form-input { border: 1rpx solid #ddd; border-radius: 10rpx; padding: 18rpx; font-size: 28rpx; }
.form-textarea { border: 1rpx solid #ddd; border-radius: 10rpx; padding: 18rpx; font-size: 28rpx; width: 100%; height: 250rpx; box-sizing: border-box; }
.submit-btn { background: #007AFF; color: #fff; border-radius: 40rpx; margin-top: 20rpx; font-size: 30rpx; }
.submit-btn[disabled] { opacity: 0.6; }
.section-title { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; }
.ticket-item { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; }
.ticket-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.ticket-title-text { font-size: 28rpx; color: #333; font-weight: 500; flex: 1; margin-right: 16rpx; }
.ticket-status { font-size: 24rpx; padding: 4rpx 16rpx; border-radius: 6rpx; flex-shrink: 0; }
.s-pending { background: #FFF3E0; color: #E6A23C; }
.s-processing { background: #E0F2FE; color: #409EFF; }
.s-closed { background: #F5F5F5; color: #999; }
.ticket-content { font-size: 26rpx; color: #666; display: block; margin-bottom: 12rpx; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ticket-footer { display: flex; justify-content: space-between; }
.ticket-time { font-size: 22rpx; color: #999; }
.ticket-priority { font-size: 22rpx; }
.p-low { color: #999; }
.p-normal { color: #409EFF; }
.p-high { color: #E6A23C; }
.p-urgent { color: #F56C6C; }
.ticket-reply { margin-top: 16rpx; padding-top: 16rpx; border-top: 1rpx solid #f0f0f0; font-size: 26rpx; color: #52c41a; }
.reply-label { color: #999; }
</style>
