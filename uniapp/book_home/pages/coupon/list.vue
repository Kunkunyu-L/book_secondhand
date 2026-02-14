<template>
  <view class="coupon-page">
    <!-- 标签页切换 -->
    <view class="tab-bar">
      <view class="tab-item" :class="{ active: tab === 'available' }" @click="tab = 'available'; loadData()">领券中心</view>
      <view class="tab-item" :class="{ active: tab === 'mine' }" @click="tab = 'mine'; loadData()">我的优惠券</view>
    </view>

    <!-- 领券中心 -->
    <view class="coupon-list" v-if="tab === 'available'">
      <view class="coupon-card" v-for="item in availableList" :key="item.id">
        <view class="coupon-left">
          <text class="coupon-value" v-if="item.type === 'fixed'">¥{{ item.discount_value }}</text>
          <text class="coupon-value" v-else>{{ item.discount_value }}折</text>
          <text class="coupon-condition">满{{ item.min_amount }}可用</text>
        </view>
        <view class="coupon-right">
          <text class="coupon-name">{{ item.name }}</text>
          <text class="coupon-date">{{ formatDate(item.start_time) }} - {{ formatDate(item.end_time) }}</text>
          <button class="claim-btn" size="mini" @click="claimCoupon(item.id)" :disabled="claimedIds.includes(item.id)">
            {{ claimedIds.includes(item.id) ? '已领取' : '立即领取' }}
          </button>
        </view>
      </view>
      <view class="empty" v-if="availableList.length === 0"><text>暂无可领取优惠券</text></view>
    </view>

    <!-- 我的优惠券 -->
    <view class="coupon-list" v-if="tab === 'mine'">
      <view class="sub-tabs">
        <view class="sub-tab" :class="{ active: subTab === 'unused' }" @click="subTab = 'unused'; loadMine()">未使用</view>
        <view class="sub-tab" :class="{ active: subTab === 'used' }" @click="subTab = 'used'; loadMine()">已使用</view>
        <view class="sub-tab" :class="{ active: subTab === 'expired' }" @click="subTab = 'expired'; loadMine()">已过期</view>
      </view>
      <view class="coupon-card" :class="{ 'card-disabled': subTab !== 'unused' }" v-for="item in myList" :key="item.id">
        <view class="coupon-left">
          <text class="coupon-value" v-if="item.type === 'fixed'">¥{{ item.discount_value }}</text>
          <text class="coupon-value" v-else>{{ item.discount_value }}折</text>
          <text class="coupon-condition">满{{ item.min_amount }}可用</text>
        </view>
        <view class="coupon-right">
          <text class="coupon-name">{{ item.name }}</text>
          <text class="coupon-date">{{ formatDate(item.start_time) }} - {{ formatDate(item.end_time) }}</text>
          <text class="coupon-status" v-if="subTab === 'used'">已使用</text>
          <text class="coupon-status" v-if="subTab === 'expired'">已过期</text>
        </view>
      </view>
      <view class="empty" v-if="myList.length === 0"><text>暂无优惠券</text></view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import request from '@/untils/request.js'

const tab = ref('available')
const subTab = ref('unused')
const availableList = ref([])
const myList = ref([])
const claimedIds = ref([])

onShow(() => { loadData() })

const loadData = () => {
  if (tab.value === 'available') loadAvailable()
  else loadMine()
}

const loadAvailable = async () => {
  try {
    const res = await request({ url: '/home/coupons', method: 'GET' })
    availableList.value = res.data || []
  } catch (e) {}
}

const loadMine = async () => {
  try {
    const res = await request({ url: `/client/coupons?status=${subTab.value}`, method: 'GET' })
    myList.value = res.data || []
  } catch (e) {}
}

const claimCoupon = async (couponId) => {
  try {
    await request({ url: '/client/coupon/claim', method: 'POST', data: { coupon_id: couponId } })
    uni.showToast({ title: '领取成功', icon: 'success' })
    claimedIds.value.push(couponId)
  } catch (e) {
    uni.showToast({ title: e.message || '领取失败', icon: 'none' })
  }
}

const formatDate = (d) => {
  if (!d) return ''
  return d.substring(0, 10)
}
</script>

<style scoped>
.coupon-page { min-height: 100vh; background: #f5f5f5; }
.tab-bar { display: flex; background: #fff; border-bottom: 1rpx solid #eee; }
.tab-item { flex: 1; text-align: center; padding: 24rpx 0; font-size: 30rpx; color: #666; position: relative; }
.tab-item.active { color: #FF5722; font-weight: bold; }
.tab-item.active::after { content: ''; position: absolute; bottom: 0; left: 30%; right: 30%; height: 4rpx; background: #FF5722; border-radius: 2rpx; }
.coupon-list { padding: 20rpx; }
.sub-tabs { display: flex; padding: 16rpx 20rpx; gap: 20rpx; }
.sub-tab { font-size: 26rpx; padding: 8rpx 24rpx; background: #fff; border-radius: 30rpx; color: #666; }
.sub-tab.active { background: #FF5722; color: #fff; }
.coupon-card { display: flex; background: #fff; border-radius: 16rpx; margin-bottom: 20rpx; overflow: hidden; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05); }
.card-disabled { opacity: 0.5; }
.coupon-left { width: 200rpx; background: linear-gradient(135deg, #FF5722, #FF7043); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24rpx 0; }
.coupon-value { font-size: 40rpx; font-weight: bold; color: #fff; }
.coupon-condition { font-size: 22rpx; color: rgba(255,255,255,0.8); margin-top: 6rpx; }
.coupon-right { flex: 1; padding: 20rpx 24rpx; display: flex; flex-direction: column; justify-content: center; }
.coupon-name { font-size: 28rpx; color: #333; font-weight: 500; margin-bottom: 8rpx; }
.coupon-date { font-size: 22rpx; color: #999; margin-bottom: 10rpx; }
.claim-btn { background: #FF5722; color: #fff; border-radius: 30rpx; font-size: 24rpx; }
.claim-btn[disabled] { background: #ccc; }
.coupon-status { font-size: 24rpx; color: #999; }
.empty { text-align: center; padding: 60rpx 0; color: #999; }
</style>
