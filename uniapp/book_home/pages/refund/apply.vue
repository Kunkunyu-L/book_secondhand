<template>
  <view class="refund-page">
    <view class="form-card">
      <view class="form-title">申请退款</view>
      <view class="order-info" v-if="orderNo">
        <text class="order-label">订单编号：</text>
        <text class="order-no">{{ orderNo }}</text>
      </view>

      <view class="form-item">
        <text class="form-label">退款原因</text>
        <textarea class="form-textarea" placeholder="请描述退款原因..." v-model="reason" maxlength="500" />
      </view>

      <button class="submit-btn" @click="submit" :disabled="submitting">{{ submitting ? '提交中...' : '提交退款申请' }}</button>
    </view>

    <!-- 退款记录 -->
    <view class="section-title" v-if="records.length > 0">退款记录</view>
    <view class="record-list">
      <view class="record-item" v-for="item in records" :key="item.id">
        <view class="record-header">
          <text class="record-order">订单 {{ item.order_no }}</text>
          <text class="record-status" :class="'s-' + item.status">{{ statusLabel(item.status) }}</text>
        </view>
        <view class="record-body">
          <text class="record-amount">退款金额：¥{{ Number(item.amount || 0).toFixed(2) }}</text>
          <text class="record-reason">原因：{{ item.reason }}</text>
        </view>
        <text class="record-time">{{ item.created_at }}</text>
        <view class="record-reject" v-if="item.status === 'rejected' && item.admin_remark">
          <text class="reject-label">驳回原因：</text>
          <text>{{ item.admin_remark }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import request from '@/untils/request.js'

const orderId = ref('')
const orderNo = ref('')
const reason = ref('')
const submitting = ref(false)
const records = ref([])

onLoad((options) => {
  if (options.order_id) orderId.value = options.order_id
  if (options.order_no) orderNo.value = options.order_no
})

onShow(() => { loadRecords() })

const submit = async () => {
  if (!orderId.value) return uni.showToast({ title: '缺少订单信息', icon: 'none' })
  if (!reason.value.trim()) return uni.showToast({ title: '请描述退款原因', icon: 'none' })
  submitting.value = true
  try {
    await request({
      url: '/client/refund',
      method: 'POST',
      data: { order_id: orderId.value, reason: reason.value }
    })
    uni.showToast({ title: '退款申请已提交', icon: 'success' })
    reason.value = ''
    loadRecords()
  } catch (e) {
    uni.showToast({ title: e.message || '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

const loadRecords = async () => {
  try {
    const res = await request({ url: '/client/refunds', method: 'GET' })
    records.value = res.data || []
  } catch (e) {}
}

const statusLabel = (s) => ({ pending: '待审核', approved: '已通过', rejected: '已驳回', refunded: '已退款' }[s] || s)
</script>

<style scoped>
.refund-page { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.form-card { background: #fff; border-radius: 16rpx; padding: 30rpx; margin-bottom: 20rpx; }
.form-title { font-size: 34rpx; font-weight: bold; color: #333; margin-bottom: 24rpx; }
.order-info { display: flex; align-items: center; margin-bottom: 24rpx; padding: 16rpx; background: #f9f9f9; border-radius: 10rpx; }
.order-label { font-size: 26rpx; color: #999; }
.order-no { font-size: 26rpx; color: #333; font-weight: 500; }
.form-item { margin-bottom: 24rpx; }
.form-label { font-size: 28rpx; color: #333; display: block; margin-bottom: 12rpx; }
.form-textarea { border: 1rpx solid #ddd; border-radius: 10rpx; padding: 18rpx; font-size: 28rpx; width: 100%; height: 200rpx; box-sizing: border-box; }
.submit-btn { background: #FF5722; color: #fff; border-radius: 40rpx; margin-top: 20rpx; font-size: 30rpx; }
.submit-btn[disabled] { opacity: 0.6; }
.section-title { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; }
.record-item { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; }
.record-header { display: flex; justify-content: space-between; margin-bottom: 12rpx; }
.record-order { font-size: 26rpx; color: #333; }
.record-status { font-size: 24rpx; padding: 4rpx 16rpx; border-radius: 6rpx; }
.s-pending { background: #FFF3E0; color: #E6A23C; }
.s-approved { background: #E0F2FE; color: #409EFF; }
.s-rejected { background: #FFEBEE; color: #F56C6C; }
.s-refunded { background: #E8F5E9; color: #52c41a; }
.record-body { margin-bottom: 8rpx; }
.record-amount { font-size: 28rpx; color: #FF5722; display: block; margin-bottom: 6rpx; }
.record-reason { font-size: 26rpx; color: #666; display: block; }
.record-time { font-size: 22rpx; color: #999; display: block; }
.record-reject { margin-top: 12rpx; padding-top: 12rpx; border-top: 1rpx solid #f0f0f0; font-size: 26rpx; color: #F56C6C; }
.reject-label { color: #999; }
</style>
