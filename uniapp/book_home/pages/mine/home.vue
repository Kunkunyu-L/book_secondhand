<template>
  <view class="my-page">
    <!-- 顶部用户信息栏 -->
    <view class="user-header" @click="getLogin">
      <view class="user-avatar">
        <image :src="userInfo.avatar || '/static/common.jpg'" mode="aspectFill"></image>
      </view>
      <view class="user-info">
        <view class="user-name">{{ userInfo.nickname || userInfo.username || '未登录' }}</view>
        <view class="user-id" v-if="token">ID: {{ userInfo.id || '---' }}</view>
        <view class="user-id" v-if="token && userInfo.credit_score">信用分: {{ userInfo.credit_score }}</view>
        <view class="user-id" v-if="!token">点击登录</view>
      </view>
      <view class="edit-btn" @click.stop="goToEdit" v-show="token">
        <text>编辑资料</text>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
    </view>

    <!-- 数据统计卡片：全部订单、我发布的、我买到的、我卖出的 -->
    <view class="data-card">
      <view class="data-item" @click="goToOrder('all')">
        <view class="data-value">{{ orderCount.total || 0 }}</view>
        <view class="data-label">全部订单</view>
      </view>
      <view class="data-item" @click="goToMyBooks">
        <view class="data-value">{{ orderCount.my_published || 0 }}</view>
        <view class="data-label">我发布的</view>
      </view>
      <view class="data-item" @click="goToOrder('bought')">
        <view class="data-value">{{ orderCount.my_bought || 0 }}</view>
        <view class="data-label">我买到的</view>
      </view>
      <view class="data-item" @click="goToOrder('sold')">
        <view class="data-value">{{ orderCount.my_sold || 0 }}</view>
        <view class="data-label">我卖出的</view>
      </view>
    </view>

    <!-- 功能菜单列表 -->
    <view class="menu-list">
      <!-- 第一组菜单 -->
      <view class="menu-group">
        <view class="menu-item" @click="goToCollection">
          <view class="menu-icon">
            <uni-icons type="heart" size="22" color="#FF5722"></uni-icons>
          </view>
          <view class="menu-text">我的收藏</view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        <view class="menu-item" @click="goToAddress">
          <view class="menu-icon">
            <uni-icons type="location" size="22" color="#4CD964"></uni-icons>
          </view>
          <view class="menu-text">收货地址</view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
		<view class="menu-item" @click="goToMyBooks">
		  <view class="menu-icon">
		    <uni-icons type="list" size="22" color="#007AFF"></uni-icons>
		  </view>
		  <view class="menu-text">我发布的图书</view>
		  <uni-icons type="right" size="16" color="#ccc"></uni-icons>
		</view>
		<view class="menu-item" @click="goToPublish">
		  <view class="menu-icon">
		    <uni-icons type="plusempty" size="22" color="#FF9500"></uni-icons>
		  </view>
		  <view class="menu-text">发布图书</view>
		  <uni-icons type="right" size="16" color="#ccc"></uni-icons>
		</view>
      </view>

      <!-- 优惠券 -->
      <view class="menu-group">
        <view class="menu-item" @click="goTo('/pages/coupon/list')">
          <view class="menu-icon">
            <uni-icons type="wallet" size="22" color="#FF5722"></uni-icons>
          </view>
          <view class="menu-text">我的优惠券</view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
      </view>

      <!-- 聊天/客服菜单 -->
      <view class="menu-group">
        <view class="menu-item" @click="goToMessages">
          <view class="menu-icon">
            <uni-icons type="chatbubble" size="22" color="#409EFF"></uni-icons>
          </view>
          <view class="menu-text">我的消息</view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        <view class="menu-item" @click="goToService">
          <view class="menu-icon">
            <uni-icons type="headphones" size="22" color="#E6A23C"></uni-icons>
          </view>
          <view class="menu-text">联系客服</view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
      </view>

      <!-- 服务与帮助 -->
      <view class="menu-group">
        <view class="menu-item" @click="goTo('/pages/help/list')">
          <view class="menu-icon">
            <uni-icons type="help" size="22" color="#67C23A"></uni-icons>
          </view>
          <view class="menu-text">帮助中心</view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        <view class="menu-item" @click="goTo('/pages/ticket/submit')">
          <view class="menu-icon">
            <uni-icons type="compose" size="22" color="#409EFF"></uni-icons>
          </view>
          <view class="menu-text">提交工单</view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
      </view>

      <!-- 设置 -->
      <view class="menu-group">
        <view class="menu-item" @click="goToSetting">
          <view class="menu-icon">
            <uni-icons type="gear" size="22" color="#666"></uni-icons>
          </view>
          <view class="menu-text">设置</view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue';
import request from '@/untils/request.js';
import { onShow } from '@dcloudio/uni-app';

const token = ref("");
const userInfo = ref({});
const orderCount = ref({});

onShow(() => {
  loadUserData()
})

const loadUserData = async () => {
  token.value = uni.getStorageSync('token') || ''
  if (!token.value) {
    userInfo.value = {}
    orderCount.value = {}
    return
  }
  try {
    const res = await request({ url: '/my/getUserInfo', method: 'GET' })
    userInfo.value = res.data || {}
  } catch (err) {
    console.error('获取用户信息失败:', err)
  }
  // 获取订单数量
  try {
    const res = await request({ url: '/order/count', method: 'GET' })
    orderCount.value = res.data || {}
  } catch (e) {}
}

const getLogin = () => {
  if (!token.value) {
    uni.navigateTo({ url: '/pages/auth/login' })
  }
}

const checkLogin = () => {
  if (!token.value) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => { uni.navigateTo({ url: '/pages/auth/login' }) }, 500)
    return false
  }
  return true
}

const goToEdit = () => {
  if (!checkLogin()) return
  uni.navigateTo({ url: '/pages/profile/edit' })
}

const goToOrder = (tab) => {
  if (!checkLogin()) return
  uni.navigateTo({ url: `/pages/order/list?tab=${tab}` })
}

const goToCollection = () => {
  if (!checkLogin()) return
  uni.navigateTo({ url: '/pages/collection/collection' })
}

const goToAddress = () => {
  if (!checkLogin()) return
  uni.navigateTo({ url: '/pages/address/address' })
}

const goToMyBooks = () => {
  if (!checkLogin()) return
  uni.navigateTo({ url: '/pages/publish/mybooks' })
}

const goToPublish = () => {
  if (!checkLogin()) return
  uni.navigateTo({ url: '/pages/publish/publish' })
}

const goToMessages = () => {
  if (!checkLogin()) return
  uni.navigateTo({ url: '/pages/chat/sessions' })
}

const goToService = () => {
  if (!checkLogin()) return
  request({ url: '/chat/session', method: 'POST', data: { target_id: 0, target_type: 'service' } })
    .then(res => {
      if (res.status === 200 && res.data) {
        uni.navigateTo({ url: `/pages/chat/chat?session_id=${res.data.id}&target_name=${encodeURIComponent('平台客服')}` })
      } else {
        uni.showToast({ title: res.message || '创建会话失败', icon: 'none' })
      }
    })
    .catch((err) => {
      // 业务错误（如参数错误）已在响应拦截器里提示，这里只处理网络/未知错误
      if (!err || typeof err.status === 'undefined') {
        uni.showToast({ title: '网络错误，请检查服务器地址或稍后重试', icon: 'none' })
      }
    })
}

const goTo = (url) => {
  if (!checkLogin()) return
  uni.navigateTo({ url })
}

const goToSetting = () => {
  if (!checkLogin()) return
  uni.navigateTo({ url: '/pages/setting/setting' })
}

const showLogoutModal = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({ url: '/my/logout', method: 'POST' })
        } catch (e) {}
        uni.removeStorageSync('token')
        token.value = ''
        userInfo.value = {}
        orderCount.value = {}
        uni.showToast({ title: '退出登录成功', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped>
.my-page {
  width: 100%;
  min-height: 100vh;
  height: auto;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #f8f8f8;
  padding-bottom: calc(50px + 32rpx);
  box-sizing: border-box;
}
.user-header {
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}
.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20rpx;
}
.user-avatar image {
  width: 100%;
  height: 100%;
}
.user-info {
  flex: 1;
}
.user-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}
.user-id {
  font-size: 24rpx;
  color: #999;
}
.edit-btn {
  display: flex;
  align-items: center;
  color: #FF5722;
  font-size: 24rpx;
}
.data-card {
  display: flex;
  justify-content: space-around;
  padding: 20rpx 0;
  background-color: #fff;
  margin: 20rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.data-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.data-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}
.data-label {
  font-size: 22rpx;
  color: #999;
}
.menu-list {
  margin: 0 20rpx;
}
.menu-group {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  border-bottom: 1px solid #f5f5f5;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-icon {
  margin-right: 20rpx;
}
.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
.badge {
  background: #F56C6C;
  color: #fff;
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 20rpx;
  margin-right: 8rpx;
}
</style>
