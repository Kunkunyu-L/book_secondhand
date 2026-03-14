<template>
  <view class="publish-entry-page">
    <view class="title-wrap">
      <text class="main-title">我要发布</text>
    </view>
    <view class="btn-list">
      <view class="entry-card" @click="goPost">
        <view class="entry-icon">
          <uni-icons type="compose" size="48" color="#007AFF"></uni-icons>
        </view>
        <text class="entry-label">发布帖子</text>
        <text class="entry-desc">分享动态到发现</text>
      </view>
      <view class="entry-card" @click="goIdle">
        <view class="entry-icon">
          <uni-icons type="shop" size="48" color="#07c160"></uni-icons>
        </view>
        <text class="entry-label">发布闲置</text>
        <text class="entry-desc">发布图书到书市</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    goPost() {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => { uni.navigateTo({ url: '/pages/auth/login' }); }, 500);
        return;
      }
      uni.navigateTo({ url: '/pages/discover/post-publish' });
    },
    goIdle() {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => { uni.navigateTo({ url: '/pages/auth/login' }); }, 500);
        return;
      }
      uni.navigateTo({ url: '/pages/publish/publish' });
    }
  }
};
</script>

<style scoped>
.publish-entry-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #fff 30%);
  padding: 80rpx 40rpx 60rpx;
  box-sizing: border-box;
}
.title-wrap {
  text-align: center;
  margin-bottom: 80rpx;
}
.main-title {
  font-size: 56rpx;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 4rpx;
}
.btn-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40rpx;
}
.entry-card {
  width: 100%;
  max-width: 560rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
}
.entry-card:active {
  transform: scale(0.98);
}
.entry-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #f0f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}
.entry-label {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}
.entry-desc {
  font-size: 26rpx;
  color: #999;
}
</style>
