<template>
  <view class="order-detail-page">
    <!-- 订单状态 -->
    <view class="status-card" :class="'bg-' + order.status">
      <text class="status-text">{{ statusText(order.status) }}</text>
      <text class="status-desc">{{ statusDesc(order.status) }}</text>
    </view>

    <!-- 收货地址 -->
    <view class="address-card" v-if="address">
      <uni-icons type="location" size="20" color="#007AFF"></uni-icons>
      <view class="address-info">
        <view class="address-header">
          <text class="address-name">{{ address.name }}</text>
          <text class="address-phone">{{ address.phone }}</text>
        </view>
        <text class="address-detail">{{ address.province }}{{ address.city }}{{ address.district }} {{ address.detail }}</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="goods-card">
      <view class="card-title">商品信息</view>
      <view class="goods-item" v-for="item in (order.items || [])" :key="item.id" @click="goBookDetail(item)">
        <image :src="item.cover_img || '/static/common.jpg'" class="goods-img" mode="aspectFill"></image>
        <view class="goods-info">
          <text class="goods-title">{{ item.title }}</text>
          <view class="goods-bottom">
            <text class="goods-price">¥{{ Number(item.price).toFixed(2) }}</text>
            <text class="goods-qty">x{{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="info-card">
      <view class="card-title">订单信息</view>
      <view class="info-row">
        <text class="info-label">订单编号</text>
        <text class="info-value">{{ order.order_no }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">下单时间</text>
        <text class="info-value">{{ order.created_at }}</text>
      </view>
      <view class="info-row" v-if="order.pay_time">
        <text class="info-label">支付时间</text>
        <text class="info-value">{{ order.pay_time }}</text>
      </view>
      <view class="info-row" v-if="order.ship_time">
        <text class="info-label">发货时间</text>
        <text class="info-value">{{ order.ship_time }}</text>
      </view>
      <view class="info-row" v-if="order.receive_time">
        <text class="info-label">收货时间</text>
        <text class="info-value">{{ order.receive_time }}</text>
      </view>
      <view class="info-row" v-if="order.remark">
        <text class="info-label">买家备注</text>
        <text class="info-value">{{ order.remark }}</text>
      </view>
      <view class="info-row total-row">
        <text class="info-label">订单金额</text>
        <text class="total-price">¥{{ Number(order.total_amount || 0).toFixed(2) }}</text>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="action-bar" v-if="showActions">
      <button v-if="order.status === 'pending'" class="action-btn cancel-btn" @click="cancelOrder">取消订单</button>
      <button v-if="order.status === 'pending'" class="action-btn pay-btn" @click="payOrder">去付款</button>
      <button v-if="order.status === 'shipped'" class="action-btn pay-btn" @click="confirmReceive">确认收货</button>
      <button v-if="canRefund" class="action-btn refund-btn" @click="applyRefund">申请退款</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from '@/untils/request.js'

const order = ref({})
const orderId = ref(null)

const address = computed(() => {
  if (order.value.address_snapshot) {
    return typeof order.value.address_snapshot === 'string'
      ? JSON.parse(order.value.address_snapshot)
      : order.value.address_snapshot
  }
  return null
})

onLoad((options) => {
  orderId.value = options.order_id
  loadDetail()
})

const loadDetail = async () => {
  try {
    const res = await request({ url: `/order/detail?order_id=${orderId.value}`, method: 'GET' })
    order.value = res.data || {}
  } catch (e) {}
}

const statusText = (status) => {
  const map = { pending: '待付款', paid: '待发货', shipped: '待收货', completed: '已完成', cancelled: '已取消' }
  return map[status] || ''
}

const statusDesc = (status) => {
  const map = { pending: '请尽快完成付款', paid: '卖家正在备货中', shipped: '商品正在配送中', completed: '交易已完成', cancelled: '订单已取消' }
  return map[status] || ''
}

const goBookDetail = (item) => {
  uni.navigateTo({ url: `/components/detail?bookId=${item.book_id}&bookType=${item.book_type}` })
}

const payOrder = async () => {
  try {
    await request({ url: '/order/status', method: 'PUT', data: { order_id: order.value.id, status: 'paid' } })
    uni.showToast({ title: '付款成功', icon: 'success' })
    loadDetail()
  } catch (e) {}
}

const cancelOrder = () => {
  uni.showModal({
    title: '提示',
    content: '确定要取消此订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({ url: '/order/status', method: 'PUT', data: { order_id: order.value.id, status: 'cancelled' } })
          uni.showToast({ title: '已取消', icon: 'success' })
          loadDetail()
        } catch (e) {}
      }
    }
  })
}

const showActions = computed(() => {
  return ['pending', 'paid', 'shipped', 'completed'].includes(order.value.status)
})

const canRefund = computed(() => {
  return ['paid', 'shipped', 'completed'].includes(order.value.status)
})

const applyRefund = () => {
  uni.navigateTo({
    url: `/pages/refund/apply?order_id=${order.value.id}&order_no=${order.value.order_no}`
  })
}

const confirmReceive = () => {
  uni.showModal({
    title: '提示',
    content: '确认已收到商品？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({ url: '/order/status', method: 'PUT', data: { order_id: order.value.id, status: 'completed' } })
          uni.showToast({ title: '已确认收货', icon: 'success' })
          loadDetail()
        } catch (e) {}
      }
    }
  })
}
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}
.status-card {
  padding: 40rpx 30rpx;
  color: #fff;
}
.bg-pending { background: linear-gradient(135deg, #ff6b6b, #ff4d4f); }
.bg-paid { background: linear-gradient(135deg, #faad14, #f5a623); }
.bg-shipped { background: linear-gradient(135deg, #40a9ff, #007AFF); }
.bg-completed { background: linear-gradient(135deg, #73d13d, #52c41a); }
.bg-cancelled { background: linear-gradient(135deg, #999, #bbb); }
.status-text {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}
.status-desc {
  font-size: 26rpx;
  opacity: 0.85;
  margin-top: 8rpx;
  display: block;
}
.address-card {
  display: flex;
  background: #fff;
  margin: 20rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  gap: 16rpx;
}
.address-info { flex: 1; }
.address-header {
  display: flex;
  gap: 16rpx;
  margin-bottom: 8rpx;
}
.address-name {
  font-size: 30rpx;
  font-weight: bold;
}
.address-phone {
  font-size: 28rpx;
  color: #666;
}
.address-detail {
  font-size: 26rpx;
  color: #999;
}
.goods-card, .info-card {
  background: #fff;
  margin: 20rpx;
  padding: 24rpx;
  border-radius: 16rpx;
}
.card-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
}
.goods-item {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.goods-item:last-child { border-bottom: none; }
.goods-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 10rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}
.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.goods-title {
  font-size: 26rpx;
  color: #333;
}
.goods-bottom {
  display: flex;
  justify-content: space-between;
}
.goods-price { color: #ff4d4f; font-size: 28rpx; }
.goods-qty { color: #999; font-size: 24rpx; }
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  font-size: 26rpx;
}
.info-label { color: #999; }
.info-value { color: #333; }
.total-row {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
  margin-top: 10rpx;
}
.total-price {
  color: #ff4d4f;
  font-size: 32rpx;
  font-weight: bold;
}
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
}
.action-btn {
  font-size: 28rpx;
  padding: 14rpx 40rpx;
  border-radius: 40rpx;
  border: 1rpx solid #ddd;
  background: #fff;
  color: #666;
}
.pay-btn {
  background: #ff4d4f;
  color: #fff;
  border-color: #ff4d4f;
}
.refund-btn {
  background: #E6A23C;
  color: #fff;
  border-color: #E6A23C;
}
.cancel-btn {
  background: #fff;
  color: #999;
}
</style>
