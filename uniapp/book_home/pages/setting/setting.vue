<template>
  <view class="setting-page">
    <view class="setting-card">
      <view class="setting-item">
        <text class="setting-label">关于我们</text>
        <text class="setting-value">二手书交易平台 v1.0.0</text>
      </view>
      <view class="setting-item" @click="goToChangelog">
        <text class="setting-label">更新日志</text>
        <uni-icons type="right" size="16" color="#ccc"></uni-icons>
      </view>
      <view class="setting-item" @click="clearCache">
        <text class="setting-label">清除缓存</text>
        <uni-icons type="right" size="16" color="#ccc"></uni-icons>
      </view>
    </view>

    <button class="logout-btn" @click="logout">退出登录</button>
  </view>
</template>

<script setup>
import request from '@/untils/request.js'

const goToChangelog = () => {
  uni.navigateTo({ url: '/pages/changelog/changelog' })
}

const clearCache = () => {
  uni.showModal({
    title: '提示', content: '确定要清除缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '缓存已清除', icon: 'success' })
      }
    }
  })
}

const logout = () => {
  uni.showModal({
    title: '提示', content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({ url: '/my/logout', method: 'POST' })
        } catch (e) {}
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        uni.showToast({ title: '已退出登录', icon: 'success' })
        setTimeout(() => { uni.reLaunch({ url: '/pages/index/index' }) }, 1000)
      }
    }
  })
}
</script>

<style scoped>
.setting-page { height: 100vh; overflow-y: auto; background: #f5f5f5; padding: 20rpx; box-sizing: border-box; }
.setting-card { background: #fff; border-radius: 16rpx; margin-bottom: 20rpx; }
.setting-item { display: flex; justify-content: space-between; align-items: center; padding: 30rpx 24rpx; border-bottom: 1rpx solid #f5f5f5; }
.setting-item:last-child { border-bottom: none; }
.setting-label { font-size: 28rpx; color: #333; }
.setting-value { font-size: 26rpx; color: #999; }
.logout-btn { margin-top: 60rpx; background: #fff; color: #ff4d4f; border-radius: 40rpx; font-size: 30rpx; border: 1rpx solid #ff4d4f; }
</style>
