<template>
  <view class="not-found-page">
    <view class="content">
      <text class="error-code">404</text>
      <text class="error-text">页面不存在</text>
      <text class="error-desc">您访问的页面可能已移除或暂时无法访问</text>
      <button class="home-btn" @click="goHome">返回首页</button>
    </view>
  </view>
</template>

<script setup>
const goHome = () => {
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx;
}

.error-code {
  font-size: 160rpx;
  font-weight: bold;
  color: #ddd;
  line-height: 1;
}

.error-text {
  font-size: 36rpx;
  color: #333;
  margin-top: 40rpx;
}

.error-desc {
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
  text-align: center;
}

.home-btn {
  margin-top: 60rpx;
  padding: 24rpx 80rpx;
  background: #333;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
  border: none;
}
</style>
