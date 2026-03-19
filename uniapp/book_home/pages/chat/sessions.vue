<template>
  <view class="sessions-page">
    <!-- 未登录提示 -->
    <view v-if="!isLoggedIn" class="not-login">
      <uni-icons type="chat" size="64" color="#ccc"></uni-icons>
      <text class="not-login-text">登录后查看消息</text>
      <button class="login-btn" @click="goLogin">去登录</button>
    </view>

    <!-- 已登录：会话列表 -->
    <scroll-view v-else scroll-y class="session-list" :show-scrollbar="false">
      <!-- 系统通知入口 -->
      <view class="system-notice-item" @click="goSystemNotices">
        <image class="avatar" src="/static/logo.png" mode="aspectFill" />
        <view class="info">
          <view class="name">系统通知</view>
          <view class="msg">平台公告、活动通知等</view>
        </view>
        <view class="right">
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
      </view>

      <uni-swipe-action>
        <uni-swipe-action-item
          v-for="s in sessions"
          :key="s.id"
          :right-options="swipeOptions"
          @click="onSwipeClick(s, $event)"
        >
          <view class="session-item" @click="goChat(s)">
            <image
              class="avatar"
              :src="s.target_name === '平台客服' ? '/static/logo.png' : (s.target_avatar || '/static/common.jpg')"
              mode="aspectFill"
            />
            <view class="info">
              <view class="name">{{ s.target_name || '平台客服' }}</view>
              <view class="msg">{{ s.last_message || '暂无消息' }}</view>
            </view>
            <view class="right">
              <view class="time">{{ formatTime(s.last_message_time) }}</view>
              <view class="badge" v-if="s.unread_user > 0">{{ s.unread_user }}</view>
            </view>
          </view>
        </uni-swipe-action-item>
      </uni-swipe-action>

      <view v-if="sessions.length === 0" class="empty">
        <uni-icons type="chat" size="64" color="#ccc"></uni-icons>
        <text class="empty-text">暂无聊天记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import request from '../../untils/request.js'

export default {
  data() {
    return {
      sessions: [],
      isLoggedIn: false,
      swipeOptions: [{ text: '删除', style: { backgroundColor: '#F56C6C' } }]
    }
  },
  onShow() {
    this.isLoggedIn = !!uni.getStorageSync('token')
    if (this.isLoggedIn) {
      this.loadSessions()
    }
  },
  methods: {
    async loadSessions() {
      try {
        const res = await request({ url: '/chat/sessions', method: 'GET' })
        if (res.status === 200) this.sessions = res.data || []
      } catch (e) {
        console.error(e)
      }
    },
    goChat(session) {
      uni.navigateTo({
        url: `/pages/chat/chat?session_id=${session.id}&target_name=${encodeURIComponent(session.target_name || '聊天')}`
      })
    },
    goLogin() {
      uni.navigateTo({ url: '/pages/auth/login' })
    },
    goSystemNotices() {
      uni.navigateTo({ url: '/pages/notifications/system-messages' })
    },
    onSwipeClick(session, e) {
      if (e.index === 0) {
        uni.showModal({
          title: '提示',
          content: '确定删除该会话记录？',
          success: async (res) => {
            if (res.confirm) {
              await this.deleteSession(session.id)
            }
          }
        })
      }
    },
    async deleteSession(sessionId) {
      try {
        await request({ url: '/chat/sessions', method: 'DELETE', data: { session_id: sessionId } })
        this.sessions = this.sessions.filter(s => s.id !== sessionId)
        uni.showToast({ title: '已删除', icon: 'success' })
      } catch (e) {
        console.error(e)
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
.sessions-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  box-sizing: border-box;
  padding-bottom: 50px;
}
.session-list { flex: 1; min-height: 0; }

.session-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  background: #eee;
  flex-shrink: 0;
}
.info { flex: 1; min-width: 0; }
.name { font-size: 28rpx; color: #333; font-weight: 500; }
.msg {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.right { display: flex; flex-direction: column; align-items: flex-end; gap: 8rpx; flex-shrink: 0; }
.time { font-size: 22rpx; color: #ccc; }
.badge {
  background: #F56C6C;
  color: #fff;
  font-size: 20rpx;
  min-width: 32rpx;
  height: 32rpx;
  border-radius: 16rpx;
  text-align: center;
  line-height: 32rpx;
  padding: 0 8rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  color: #999;
}
.empty-text { font-size: 28rpx; margin-top: 20rpx; color: #ccc; }

.not-login {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  padding-bottom: 100rpx;
}
.not-login-text { font-size: 28rpx; color: #999; }
.login-btn {
  margin-top: 8rpx;
  width: 280rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #007AFF;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}
.login-btn::after { border: none; }

.system-notice-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  background: #fff;
  border-bottom: 4rpx solid #f5f5f5;
}
</style>
