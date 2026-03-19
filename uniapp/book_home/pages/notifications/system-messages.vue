<template>
  <view class="page">
    <view v-if="loading" class="loading">
      <uni-icons type="spinner" size="32" color="#ccc"></uni-icons>
    </view>
    <scroll-view v-else scroll-y class="list" :show-scrollbar="false">
      <view v-if="messages.length === 0" class="empty">
        <uni-icons type="notification" size="60" color="#ccc"></uni-icons>
        <text class="empty-text">暂无系统消息</text>
      </view>
      <view v-for="m in messages" :key="m.id" class="msg-item" @click="viewDetail(m)">
        <view class="msg-icon">
          <uni-icons type="notification" size="22" color="#409EFF"></uni-icons>
        </view>
        <view class="msg-body">
          <view class="msg-title">{{ m.title }}</view>
          <view class="msg-content">{{ m.content }}</view>
          <view class="msg-time">{{ m.created_at }}</view>
        </view>
        <uni-icons type="right" size="14" color="#ccc"></uni-icons>
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
      messages: [],
      loading: false,
      current: null,
    }
  },
  onLoad() {
    this.loadMessages()
  },
  methods: {
    async loadMessages() {
      this.loading = true
      try {
        const res = await request({ url: '/home/announcements?type=system_message', method: 'GET' })
        if (res.status === 200) this.messages = res.data || []
      } catch (e) {}
      this.loading = false
    },
    viewDetail(m) {
      this.current = m
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

.msg-item {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  gap: 20rpx;
}
.msg-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.msg-body { flex: 1; min-width: 0; }
.msg-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 6rpx;
}
.msg-content {
  font-size: 24rpx;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.msg-time {
  font-size: 20rpx;
  color: #c0c4cc;
  margin-top: 6rpx;
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
