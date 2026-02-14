<template>
  <view class="sessions-page">
    <view class="session-item" v-for="s in sessions" :key="s.id" @click="goChat(s)">
      <image class="avatar" :src="s.target_avatar || s.target_name === '平台客服' ? '/static/logo.png' : '/static/common.jpg'" mode="aspectFill" />
      <view class="info">
        <view class="name">{{ s.target_name || '平台客服' }}</view>
        <view class="msg">{{ s.last_message || '暂无消息' }}</view>
      </view>
      <view class="right">
        <view class="time">{{ formatTime(s.last_message_time) }}</view>
        <view class="badge" v-if="s.unread_user > 0">{{ s.unread_user }}</view>
      </view>
    </view>

    <view v-if="sessions.length === 0" class="empty">
      <text>暂无聊天记录</text>
    </view>

    <!-- 联系客服按钮 -->
    <view class="contact-btn" @click="contactService">
      <text>联系平台客服</text>
    </view>
  </view>
</template>

<script>
import request from '../../untils/request.js'

export default {
  data() {
    return {
      sessions: []
    }
  },
  onShow() {
    this.loadSessions()
  },
  methods: {
    async loadSessions() {
      try {
        const res = await request({ url: '/chat/sessions', method: 'GET' })
        if (res.status === 200) this.sessions = res.data || []
      } catch (e) { console.error(e) }
    },
    goChat(session) {
      uni.navigateTo({
        url: `/pages/chat/chat?session_id=${session.id}&target_name=${encodeURIComponent(session.target_name || '聊天')}`
      })
    },
    async contactService() {
      try {
        // 创建或获取与平台客服的会话 (target_id=0 表示平台客服)
        const res = await request({
          url: '/chat/session', method: 'POST',
          data: { target_id: 0, target_type: 'service' }
        })
        if (res.status === 200 && res.data) {
          uni.navigateTo({
            url: `/pages/chat/chat?session_id=${res.data.id}&target_name=${encodeURIComponent('平台客服')}`
          })
        }
      } catch (e) {
        uni.showToast({ title: '创建会话失败', icon: 'none' })
      }
    },
    formatTime(time) {
      if (!time) return ''
      const d = new Date(time)
      const now = new Date()
      if (d.toDateString() === now.toDateString()) {
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      }
      return `${d.getMonth() + 1}/${d.getDate()}`
    }
  }
}
</script>

<style scoped>
.sessions-page { min-height: 100vh; background: #f5f5f5; }
.session-item { display: flex; align-items: center; padding: 24rpx 30rpx; background: #fff; border-bottom: 1rpx solid #f0f0f0; }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; margin-right: 20rpx; background: #eee; }
.info { flex: 1; min-width: 0; }
.name { font-size: 28rpx; color: #333; font-weight: 500; }
.msg { font-size: 24rpx; color: #999; margin-top: 6rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.right { display: flex; flex-direction: column; align-items: flex-end; gap: 8rpx; }
.time { font-size: 22rpx; color: #ccc; }
.badge { background: #F56C6C; color: #fff; font-size: 20rpx; min-width: 32rpx; height: 32rpx;
  border-radius: 16rpx; text-align: center; line-height: 32rpx; padding: 0 8rpx; }
.empty { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
.contact-btn { position: fixed; bottom: 40rpx; left: 50%; transform: translateX(-50%);
  background: #409EFF; color: #fff; padding: 20rpx 60rpx; border-radius: 40rpx;
  font-size: 28rpx; box-shadow: 0 4rpx 20rpx rgba(64,158,255,0.3); }
</style>
