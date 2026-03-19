<template>
  <view class="page">
    <view v-if="loading" class="loading">
      <uni-icons type="spinner" size="32" color="#ccc"></uni-icons>
    </view>
    <scroll-view v-else scroll-y class="list" :show-scrollbar="false">
      <view v-if="notices.length === 0" class="empty">
        <uni-icons type="sound" size="60" color="#ccc"></uni-icons>
        <text class="empty-text">暂无通知公告</text>
      </view>
      <view v-for="n in notices" :key="n.id" class="notice-item" @click="viewDetail(n)">
        <view class="notice-title">{{ n.title }}</view>
        <view class="notice-content">{{ n.content }}</view>
        <view class="notice-time">{{ n.created_at }}</view>
      </view>
    </scroll-view>

    <!-- 详情弹窗 -->
    <uni-popup ref="popup" type="bottom">
      <view class="detail-sheet" v-if="current">
        <view class="detail-title">{{ current.title }}</view>
        <view class="detail-time">{{ current.created_at }}</view>
        <scroll-view scroll-y class="detail-body" :show-scrollbar="false">
          <text class="detail-content">{{ current.content }}</text>
        </scroll-view>
        <button class="close-btn" @click="closeDetail">关闭</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import request from '@/untils/request.js'

export default {
  data() {
    return {
      notices: [],
      loading: false,
      current: null,
    }
  },
  onLoad() {
    this.loadNotices()
  },
  methods: {
    async loadNotices() {
      this.loading = true
      try {
        const res = await request({ url: '/home/announcements?type=notice', method: 'GET' })
        if (res.status === 200) this.notices = res.data || []
      } catch (e) {}
      this.loading = false
    },
    viewDetail(n) {
      this.current = n
      this.$refs.popup.open()
    },
    closeDetail() {
      this.$refs.popup.close()
    },
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}
.loading {
  display: flex;
  justify-content: center;
  padding: 100rpx 0;
}
.list { height: 100vh; }
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  color: #ccc;
}
.empty-text { font-size: 28rpx; margin-top: 20rpx; }

.notice-item {
  background: #fff;
  margin: 20rpx 24rpx 0;
  border-radius: 12rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.notice-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 10rpx;
}
.notice-content {
  font-size: 26rpx;
  color: #6b7280;
  line-height: 1.6;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.notice-time {
  font-size: 22rpx;
  color: #c0c4cc;
  margin-top: 12rpx;
}

.detail-sheet {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 40rpx 32rpx 60rpx;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}
.detail-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 10rpx;
}
.detail-time {
  font-size: 22rpx;
  color: #9ca3af;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f3f4f6;
}
.detail-body {
  flex: 1;
  max-height: 50vh;
}
.detail-content {
  font-size: 28rpx;
  color: #374151;
  line-height: 1.8;
}
.close-btn {
  margin-top: 24rpx;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  height: 80rpx;
  line-height: 80rpx;
}
.close-btn::after { border: none; }
</style>
