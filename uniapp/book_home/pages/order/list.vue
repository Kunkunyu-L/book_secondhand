<template>
  <view class="order-list-page">
    <!-- Tab栏 -->
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === tab.value }" 
        v-for="tab in tabs" 
        :key="tab.value"
        @click="switchTab(tab.value)"
      >
        <text>{{ tab.label }}</text>
        <view v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</view>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view scroll-y class="order-scroll" @scrolltolower="loadMore">
      <view v-if="orderList.length === 0 && !loading" class="empty-state">
        <uni-icons type="list" size="80" color="#ccc"></uni-icons>
        <text class="empty-text">暂无订单</text>
      </view>

      <view class="order-card" v-for="order in orderList" :key="order.id" @click="goDetail(order.id)">
        <!-- 订单头部 -->
        <view class="order-header">
          <text class="order-no">订单号：{{ order.order_no }}</text>
          <text class="order-status" :class="'status-' + order.status">{{ statusText(order.status) }}</text>
        </view>

        <!-- 商品列表 -->
        <view class="order-goods" v-for="item in (order.items || [])" :key="item.book_id">
          <image :src="item.cover_img || '/static/common.jpg'" class="goods-img" mode="aspectFill"></image>
          <view class="goods-info">
            <text class="goods-title">{{ item.title }}</text>
            <view class="goods-bottom">
              <text class="goods-price">¥{{ Number(item.price).toFixed(2) }}</text>
              <text class="goods-qty">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>

        <!-- 订单底部 -->
        <view class="order-footer">
          <text class="order-total">共{{ getTotalCount(order) }}件 合计：<text class="price-text">¥{{ Number(order.total_amount).toFixed(2) }}</text></text>
          <view class="order-actions">
            <button v-if="order.status === 'pending'" class="action-btn pay-btn" @click.stop="payOrder(order)">去付款</button>
            <button v-if="order.status === 'pending'" class="action-btn" @click.stop="cancelOrder(order)">取消</button>
            <button v-if="order.status === 'shipped'" class="action-btn pay-btn" @click.stop="confirmReceive(order)">确认收货</button>
          </view>
        </view>
      </view>

      <view v-if="loading" class="loading-more">
        <text>加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import request from '@/untils/request.js'

const tabs = ref([
  { label: '全部', value: 'all', count: 0 },
  { label: '待付款', value: 'pending', count: 0 },
  { label: '待发货', value: 'paid', count: 0 },
  { label: '待收货', value: 'shipped', count: 0 },
  { label: '已完成', value: 'completed', count: 0 }
])

const currentTab = ref('all')
const orderList = ref([])
const loading = ref(false)

onLoad((options) => {
  if (options.tab) currentTab.value = options.tab
})

onShow(() => {
  loadOrders()
  loadCount()
})

const switchTab = (tab) => {
  currentTab.value = tab
  loadOrders()
}

const loadOrders = async () => {
  loading.value = true
  try {
    const res = await request({ url: `/order/list?status=${currentTab.value}`, method: 'GET' })
    orderList.value = res.data || []
  } catch (e) {}
  loading.value = false
}

const loadCount = async () => {
  try {
    const res = await request({ url: '/order/count', method: 'GET' })
    const d = res.data || {}
    tabs.value[1].count = d.pending || 0
    tabs.value[2].count = d.paid || 0
    tabs.value[3].count = d.shipped || 0
    tabs.value[4].count = d.completed || 0
  } catch (e) {}
}

const statusText = (status) => {
  const map = { pending: '待付款', paid: '待发货', shipped: '待收货', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

const getTotalCount = (order) => {
  return (order.items || []).reduce((sum, i) => sum + i.quantity, 0)
}

const goDetail = (orderId) => {
  uni.navigateTo({ url: `/pages/order/detail?order_id=${orderId}` })
}

const payOrder = async (order) => {
  try {
    await request({ url: '/order/status', method: 'PUT', data: { order_id: order.id, status: 'paid' } })
    uni.showToast({ title: '付款成功', icon: 'success' })
    loadOrders()
    loadCount()
  } catch (e) {}
}

const cancelOrder = (order) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消此订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({ url: '/order/status', method: 'PUT', data: { order_id: order.id, status: 'cancelled' } })
          uni.showToast({ title: '已取消', icon: 'success' })
          loadOrders()
          loadCount()
        } catch (e) {}
      }
    }
  })
}

const confirmReceive = async (order) => {
  uni.showModal({
    title: '提示',
    content: '确认已收到商品？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({ url: '/order/status', method: 'PUT', data: { order_id: order.id, status: 'completed' } })
          uni.showToast({ title: '已确认收货', icon: 'success' })
          loadOrders()
          loadCount()
        } catch (e) {}
      }
    }
  })
}

const loadMore = () => {}
</script>

<style scoped>
.order-list-page {
  min-height: 100vh;
  background: #f5f5f5;
}
.tabs {
  display: flex;
  background: #fff;
  padding: 0 10rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}
.tab-item.active {
  color: #007AFF;
  font-weight: bold;
  border-bottom: 4rpx solid #007AFF;
}
.tab-badge {
  position: absolute;
  top: 10rpx;
  right: 20rpx;
  background: #ff4d4f;
  color: #fff;
  font-size: 20rpx;
  min-width: 32rpx;
  height: 32rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}
.order-scroll {
  height: calc(100vh - 90rpx);
}
.order-card {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.order-no {
  font-size: 24rpx;
  color: #999;
}
.order-status {
  font-size: 26rpx;
  font-weight: bold;
}
.status-pending { color: #ff4d4f; }
.status-paid { color: #faad14; }
.status-shipped { color: #007AFF; }
.status-completed { color: #52c41a; }
.status-cancelled { color: #999; }
.order-goods {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
}
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
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.goods-bottom {
  display: flex;
  justify-content: space-between;
}
.goods-price {
  font-size: 28rpx;
  color: #ff4d4f;
}
.goods-qty {
  font-size: 24rpx;
  color: #999;
}
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
}
.order-total {
  font-size: 26rpx;
  color: #666;
}
.price-text {
  color: #ff4d4f;
  font-weight: bold;
}
.order-actions {
  display: flex;
  gap: 16rpx;
}
.action-btn {
  font-size: 24rpx;
  padding: 8rpx 24rpx;
  border-radius: 30rpx;
  border: 1rpx solid #ddd;
  background: #fff;
  color: #666;
  line-height: 1.5;
}
.pay-btn {
  background: #ff4d4f;
  color: #fff;
  border-color: #ff4d4f;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;
}
.empty-text {
  color: #999;
  margin-top: 20rpx;
  font-size: 28rpx;
}
.loading-more {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 26rpx;
}
</style>
