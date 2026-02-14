<template>
  <view class="confirm-page">
    <!-- 收货地址 -->
    <view class="address-card" @click="chooseAddress">
      <view v-if="selectedAddress" class="address-info">
        <view class="address-header">
          <text class="address-name">{{ selectedAddress.name }}</text>
          <text class="address-phone">{{ selectedAddress.phone }}</text>
          <uni-tag v-if="selectedAddress.is_default" text="默认" type="primary" size="mini" />
        </view>
        <text class="address-detail">{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }} {{ selectedAddress.detail }}</text>
      </view>
      <view v-else class="no-address">
        <uni-icons type="plusempty" size="20" color="#007AFF"></uni-icons>
        <text class="no-address-text">请选择收货地址</text>
      </view>
      <uni-icons type="right" size="16" color="#ccc"></uni-icons>
    </view>

    <!-- 商品列表 -->
    <view class="goods-card">
      <view class="card-title">商品信息</view>
      <view class="goods-item" v-for="item in orderItems" :key="item.book_id">
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

    <!-- 订单备注 -->
    <view class="remark-card">
      <text class="remark-label">订单备注</text>
      <input class="remark-input" v-model="remark" placeholder="选填，可备注给卖家" />
    </view>

    <!-- 金额明细 -->
    <view class="amount-card">
      <view class="amount-row">
        <text>商品金额</text>
        <text>¥{{ totalAmount.toFixed(2) }}</text>
      </view>
      <view class="amount-row">
        <text>运费</text>
        <text style="color: #52c41a;">免运费</text>
      </view>
      <view class="amount-row total">
        <text>合计</text>
        <text class="total-price">¥{{ totalAmount.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 底部提交栏 -->
    <view class="submit-bar">
      <view class="submit-info">
        <text>合计：</text>
        <text class="submit-price">¥{{ totalAmount.toFixed(2) }}</text>
      </view>
      <button class="submit-btn" @click="submitOrder" :disabled="submitting">
        {{ submitting ? '提交中...' : '提交订单' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import request from '@/untils/request.js'

const orderItems = ref([])
const selectedAddress = ref(null)
const remark = ref('')
const submitting = ref(false)
const isDirectBuy = ref(false) // 是否直接购买

const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
})

onLoad((options) => {
  // 直接购买
  if (options.directBuy) {
    try {
      const item = JSON.parse(decodeURIComponent(options.directBuy))
      orderItems.value = [item]
      isDirectBuy.value = true
    } catch (e) {}
  }
})

onShow(() => {
  loadAddress()
  // 如果不是直接购买，从购物车获取选中项
  if (!isDirectBuy.value && orderItems.value.length === 0) {
    loadCartSelected()
  }
  // 检查是否从地址选择页返回
  const addr = uni.getStorageSync('selectedAddress')
  if (addr) {
    selectedAddress.value = JSON.parse(addr)
    uni.removeStorageSync('selectedAddress')
  }
})

const loadAddress = async () => {
  if (selectedAddress.value) return
  try {
    const res = await request({ url: '/address/list', method: 'GET' })
    const list = res.data || []
    // 默认选择第一个地址
    if (list.length > 0) {
      selectedAddress.value = list.find(a => a.is_default) || list[0]
    }
  } catch (e) {}
}

const loadCartSelected = async () => {
  try {
    const res = await request({ url: '/cart/list', method: 'GET' })
    orderItems.value = (res.data || [])
      .filter(item => item.selected === 1)
      .map(item => ({
        book_id: item.book_id,
        book_type: item.book_type,
        title: item.title,
        cover_img: item.cover_img,
        price: item.price,
        quantity: item.quantity
      }))
  } catch (e) {}
}

const chooseAddress = () => {
  uni.navigateTo({ url: '/pages/address/address?select=1' })
}

const submitOrder = async () => {
  if (!selectedAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }
  if (orderItems.value.length === 0) {
    uni.showToast({ title: '没有可下单的商品', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const data = {
      address_id: selectedAddress.value.id,
      remark: remark.value
    }
    // 直接购买传items
    if (isDirectBuy.value) {
      data.items = orderItems.value.map(i => ({
        book_id: i.book_id,
        book_type: i.book_type,
        quantity: i.quantity
      }))
    }
    const res = await request({ url: '/order/create', method: 'POST', data })
    uni.showToast({ title: '下单成功', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: `/pages/order/detail?order_id=${res.data.order_id}` })
    }, 1000)
  } catch (e) {
    console.error('下单失败', e)
  }
  submitting.value = false
}
</script>

<style scoped>
.confirm-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}
.address-card {
  display: flex;
  align-items: center;
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}
.address-info {
  flex: 1;
}
.address-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 10rpx;
}
.address-name {
  font-size: 32rpx;
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
.no-address {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.no-address-text {
  font-size: 28rpx;
  color: #007AFF;
}
.goods-card {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}
.card-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
.goods-item {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.goods-item:last-child {
  border-bottom: none;
}
.goods-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}
.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.goods-title {
  font-size: 28rpx;
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
  align-items: center;
}
.goods-price {
  font-size: 30rpx;
  color: #ff4d4f;
  font-weight: bold;
}
.goods-qty {
  font-size: 26rpx;
  color: #999;
}
.remark-card {
  display: flex;
  align-items: center;
  background: #fff;
  margin: 20rpx;
  padding: 24rpx 30rpx;
  border-radius: 16rpx;
}
.remark-label {
  font-size: 28rpx;
  color: #333;
  margin-right: 20rpx;
  flex-shrink: 0;
}
.remark-input {
  flex: 1;
  font-size: 26rpx;
}
.amount-card {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}
.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  font-size: 28rpx;
  color: #666;
}
.amount-row.total {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
  margin-top: 10rpx;
}
.total-price {
  font-size: 34rpx;
  color: #ff4d4f;
  font-weight: bold;
}
.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  z-index: 100;
}
.submit-info {
  font-size: 28rpx;
}
.submit-price {
  font-size: 36rpx;
  color: #ff4d4f;
  font-weight: bold;
}
.submit-btn {
  background: #ff4d4f;
  color: #fff;
  font-size: 30rpx;
  padding: 16rpx 60rpx;
  border-radius: 40rpx;
  border: none;
}
.submit-btn[disabled] {
  opacity: 0.6;
}
</style>
