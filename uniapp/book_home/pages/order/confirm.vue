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

    <!-- 优惠券 -->
    <view class="coupon-card" @click="openCouponPicker">
      <view class="coupon-left">
        <uni-icons type="wallet" size="18" color="#FF5722"></uni-icons>
        <text class="coupon-label">优惠券</text>
      </view>
      <view class="coupon-right">
        <text v-if="selectedCoupon" class="coupon-selected">-¥{{ discountAmount.toFixed(2) }}</text>
        <text v-else-if="availableCoupons.filter(c => c.applicable).length > 0" class="coupon-hint">{{ availableCoupons.filter(c => c.applicable).length }}张可用</text>
        <text v-else-if="availableCoupons.length > 0" class="coupon-none">{{ availableCoupons.length }}张券(不满足条件)</text>
        <text v-else class="coupon-none">暂无优惠券</text>
        <uni-icons type="right" size="16" color="#ccc"></uni-icons>
      </view>
    </view>

    <!-- 金额明细 -->
    <view class="amount-card">
      <view class="amount-row">
        <text>商品金额</text>
        <text>¥{{ totalAmount.toFixed(2) }}</text>
      </view>
      <view class="amount-row" v-if="selectedCoupon">
        <text style="color:#FF5722;">优惠券减免</text>
        <text style="color:#FF5722;">-¥{{ discountAmount.toFixed(2) }}</text>
      </view>
      <view class="amount-row">
        <text>运费</text>
        <text style="color: #52c41a;">免运费</text>
      </view>
      <view class="amount-row total">
        <text>合计</text>
        <text class="total-price">¥{{ finalAmount.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 底部提交栏 -->
    <view class="submit-bar">
      <view class="submit-info">
        <text>合计：</text>
        <text class="submit-price">¥{{ finalAmount.toFixed(2) }}</text>
      </view>
      <button class="submit-btn" @click="submitOrder" :disabled="submitting">
        {{ submitting ? '提交中...' : '提交订单' }}
      </button>
    </view>

    <!-- 优惠券选择弹窗 -->
    <uni-popup ref="couponPopup" type="bottom" background-color="#fff">
      <view class="popup-wrap">
        <view class="popup-header">
          <text class="popup-title">选择优惠券</text>
          <text class="popup-close" @click="closeCouponPicker">关闭</text>
        </view>
        <scroll-view scroll-y style="max-height: 60vh;">
          <!-- 不使用优惠券 -->
          <view class="coupon-item" :class="{ 'coupon-item-active': !selectedCoupon }" @click="selectCoupon(null)">
            <view class="coupon-item-name">不使用优惠券</view>
          </view>
          <view
            v-for="c in availableCoupons"
            :key="c.uc_id"
            class="coupon-item"
            :class="{ 'coupon-item-active': selectedCoupon && selectedCoupon.uc_id === c.uc_id, 'coupon-item-disabled': !c.applicable }"
            @click="c.applicable && selectCoupon(c)"
          >
            <view class="coupon-item-left" :class="{ 'coupon-item-left-disabled': !c.applicable }">
              <view class="coupon-value">
                <text v-if="c.type === 'reduction'">¥{{ Number(c.discount_value).toFixed(0) }}</text>
                <text v-else>{{ (c.discount_value * 10).toFixed(1) }}折</text>
              </view>
              <text class="coupon-min" v-if="c.min_amount > 0">满{{ Number(c.min_amount).toFixed(0) }}元可用</text>
              <text class="coupon-min" v-else>无门槛</text>
            </view>
            <view class="coupon-item-right">
              <text class="coupon-name">{{ c.name }}</text>
              <text v-if="!c.applicable" class="coupon-gap">再差¥{{ c.gap }}可用</text>
              <text v-else class="coupon-expire">{{ formatDate(c.end_time) }} 到期</text>
            </view>
          </view>
          <view v-if="availableCoupons.length === 0" class="no-coupon">暂无优惠券，可前往领券</view>
        </scroll-view>
      </view>
    </uni-popup>
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
const isDirectBuy = ref(false)
const couponPopup = ref(null)
const availableCoupons = ref([])
const selectedCoupon = ref(null)

const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
})

const discountAmount = computed(() => {
  if (!selectedCoupon.value) return 0
  const c = selectedCoupon.value
  const total = totalAmount.value
  if (c.type === 'reduction') {
    return Math.min(parseFloat(c.discount_value), total)
  } else if (c.type === 'discount') {
    return parseFloat((total * (1 - parseFloat(c.discount_value))).toFixed(2))
  }
  return 0
})

const finalAmount = computed(() => {
  return Math.max(0, parseFloat((totalAmount.value - discountAmount.value).toFixed(2)))
})

onLoad((options) => {
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
  if (!isDirectBuy.value && orderItems.value.length === 0) {
    orderItems.value = []
  }
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
    if (list.length > 0) {
      selectedAddress.value = list.find(a => a.is_default) || list[0]
    }
  } catch (e) {}
}

const loadApplicableCoupons = async () => {
  try {
    const res = await request({
      url: `/client/coupons/applicable?amount=${encodeURIComponent(totalAmount.value)}`,
      method: 'GET',
    })
    availableCoupons.value = res.data || []
  } catch (e) {
    availableCoupons.value = []
  }
}

const openCouponPicker = async () => {
  await loadApplicableCoupons()
  couponPopup.value && couponPopup.value.open()
}

const closeCouponPicker = () => {
  couponPopup.value && couponPopup.value.close()
}

const selectCoupon = (coupon) => {
  selectedCoupon.value = coupon
  closeCouponPicker()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
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
      remark: remark.value,
    }
    if (isDirectBuy.value) {
      data.items = orderItems.value.map(i => ({
        book_id: i.book_id,
        book_type: i.book_type,
        quantity: i.quantity
      }))
    }
    if (selectedCoupon.value) {
      data.user_coupon_id = selectedCoupon.value.uc_id
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
.address-info { flex: 1; }
.address-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 10rpx;
}
.address-name { font-size: 32rpx; font-weight: bold; }
.address-phone { font-size: 28rpx; color: #666; }
.address-detail { font-size: 26rpx; color: #999; }
.no-address { flex: 1; display: flex; align-items: center; gap: 10rpx; }
.no-address-text { font-size: 28rpx; color: #007AFF; }
.goods-card {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}
.card-title { font-size: 30rpx; font-weight: bold; margin-bottom: 20rpx; }
.goods-item {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.goods-item:last-child { border-bottom: none; }
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
.goods-bottom { display: flex; justify-content: space-between; align-items: center; }
.goods-price { font-size: 30rpx; color: #ff4d4f; font-weight: bold; }
.goods-qty { font-size: 26rpx; color: #999; }
.remark-card {
  display: flex;
  align-items: center;
  background: #fff;
  margin: 20rpx;
  padding: 24rpx 30rpx;
  border-radius: 16rpx;
}
.remark-label { font-size: 28rpx; color: #333; margin-right: 20rpx; flex-shrink: 0; }
.remark-input { flex: 1; font-size: 26rpx; }
.coupon-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  margin: 20rpx;
  padding: 26rpx 30rpx;
  border-radius: 16rpx;
}
.coupon-left { display: flex; align-items: center; gap: 12rpx; }
.coupon-label { font-size: 28rpx; color: #333; }
.coupon-right { display: flex; align-items: center; gap: 8rpx; }
.coupon-selected { font-size: 28rpx; color: #ff4d4f; font-weight: bold; }
.coupon-hint { font-size: 26rpx; color: #FF5722; }
.coupon-none { font-size: 26rpx; color: #ccc; }
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
.total-price { font-size: 34rpx; color: #ff4d4f; font-weight: bold; }
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
.submit-info { font-size: 28rpx; }
.submit-price { font-size: 36rpx; color: #ff4d4f; font-weight: bold; }
.submit-btn {
  background: #ff4d4f;
  color: #fff;
  font-size: 30rpx;
  padding: 16rpx 60rpx;
  border-radius: 40rpx;
  border: none;
}
.submit-btn[disabled] { opacity: 0.6; }
/* 优惠券弹窗 */
.popup-wrap { padding: 30rpx; }
.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.popup-title { font-size: 32rpx; font-weight: bold; color: #333; }
.popup-close { font-size: 28rpx; color: #999; }
.coupon-item {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  margin-bottom: 16rpx;
  border-radius: 12rpx;
  background: #f9f9f9;
  border: 2rpx solid transparent;
}
.coupon-item-active {
  border-color: #ff4d4f;
  background: #fff5f5;
}
.coupon-item-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 24rpx;
  min-width: 110rpx;
}
.coupon-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff4d4f;
}
.coupon-min { font-size: 20rpx; color: #999; margin-top: 4rpx; }
.coupon-item-right { flex: 1; }
.coupon-name { font-size: 28rpx; color: #333; display: block; margin-bottom: 6rpx; }
.coupon-expire { font-size: 22rpx; color: #bbb; }
.coupon-gap { font-size: 22rpx; color: #f5a623; }
.no-coupon { text-align: center; color: #999; font-size: 26rpx; padding: 40rpx 0; }
.coupon-item-disabled { opacity: 0.5; }
.coupon-item-left-disabled .coupon-value { color: #ccc; }
</style>
