<template>
  <view class="chat-page">
    <!-- 连接状态提示（连接成功后自动消失） -->
    <view class="connecting-bar" v-if="!socketReady && (socket && !socket.connected)">
      <text class="connecting-text">连接中...请稍后</text>
    </view>
    <!-- 消息列表：仅此区域可滚动 -->
    <scroll-view scroll-y class="msg-list" :scroll-top="scrollTop" :scroll-into-view="scrollIntoView">
      <view class="msg-item" v-for="(m, idx) in messages" :key="m.id" :id="'msg-' + idx"
        :class="{ mine: m.sender_id == userId }">
        <view class="msg-bubble" :class="{ 'bubble-mine': m.sender_id == userId }">
          <text class="sender" v-if="m.sender_id != userId">{{ m.sender_name || '对方' }}</text>
          <image v-if="m.msg_type === 'image'" :src="m.content" mode="widthFix" style="max-width: 400rpx; border-radius: 8rpx;"
            @click="previewImg(m.content)" />
          <text v-else class="msg-text">{{ m.content }}</text>
          <text class="msg-time">{{ formatMsgTime(m.created_at) }}</text>
        </view>
      </view>
      <view v-if="messages.length === 0" class="empty-msg">暂无消息，发送一条试试~</view>
    </scroll-view>

    <!-- 输入区域：固定在最底部，进入页面即见 -->
    <view class="input-bar">
      <input class="msg-input" v-model="inputText" placeholder="输入消息..." confirm-type="send"
        @confirm="sendMessage" :adjust-position="false" />
      <view class="send-btn" :class="{ active: inputText.trim() }" @click="sendMessage">发送</view>
    </view>
  </view>
</template>

<script>
import request from '../../untils/request.js'
import io from '../../untils/socket-client.js'
import { baseURL } from '../../untils/config.js'

export default {
  data() {
    return {
      sessionId: '',
      targetName: '',
      messages: [],
      inputText: '',
      scrollTop: 0,
      scrollIntoView: '',
      userId: '',
      socket: null,
      pollTimer: null,
      socketReady: false  // 连接成功后才可发送，用于隐藏「连接中」提示
    }
  },
  onLoad(options) {
    this.sessionId = options.session_id
    this.targetName = decodeURIComponent(options.target_name || '聊天')
    uni.setNavigationBarTitle({ title: this.targetName })
    const userInfo = uni.getStorageSync('userInfo')
    this.userId = userInfo?.id || ''
  },
  onShow() {
    this.loadMessages()
    this.connectSocket()
  },
  onHide() {
    this.disconnectSocket()
  },
  onUnload() {
    this.disconnectSocket()
  },
  methods: {
    async loadMessages() {
      try {
        const res = await request({
          url: '/chat/messages', method: 'GET',
          data: { session_id: this.sessionId, pageSize: 50 }
        })
        if (res.status === 200) {
          this.messages = res.data.list || []
          this.$nextTick(() => this.scrollToBottom())
        }
      } catch (e) { console.error(e) }
    },

    connectSocket() {
      const token = uni.getStorageSync('token')
      if (!token) {
        this.socketReady = true
        return
      }
      this.socketReady = false

      try {
        const host = baseURL || 'http://localhost:3000'
        this.socket = io(host, {
          query: { token },
          transports: ['websocket']
        })

        this.socket.on('connect', () => {
          console.log('[Chat] Socket connected')
          this.socketReady = true
          this.socket.emit('mark_read', { session_id: this.sessionId })
        })

        this.socket.on('new_message', (msg) => {
          if (msg.session_id == this.sessionId) {
            this.messages.push(msg)
            this.$nextTick(() => this.scrollToBottom())
            this.socket.emit('mark_read', { session_id: this.sessionId })
          }
        })

        this.socket.on('connect_error', () => {
          console.log('[Chat] Socket connect error, using polling')
          this.socketReady = true
          this.startPolling()
        })
      } catch (e) {
        console.error('[Chat] Socket init error:', e)
        this.socketReady = true
        this.startPolling()
      }
    },

    startPolling() {
      if (this.pollTimer) return
      this.pollTimer = setInterval(() => {
        this.loadMessages()
      }, 5000)
    },

    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
      }
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },

    sendMessage() {
      if (!this.inputText.trim()) return

      if (this.socket?.connected && this.socketReady) {
        this.socket.emit('send_message', {
          session_id: this.sessionId,
          content: this.inputText.trim(),
          msg_type: 'text'
        }, (res) => {
          if (res?.success) {
            this.messages.push(res.message)
            this.inputText = ''
            this.$nextTick(() => this.scrollToBottom())
          } else {
            uni.showToast({ title: res?.error || '发送失败', icon: 'none' })
          }
        })
      } else {
        this.sendViaRest()
      }
    },

    async sendViaRest() {
      uni.showToast({ title: this.socketReady ? '请稍后重试发送' : '连接中...请稍后', icon: 'none' })
    },

    scrollToBottom() {
      if (this.messages.length > 0) {
        this.scrollIntoView = 'msg-' + (this.messages.length - 1)
      }
    },

    previewImg(url) {
      uni.previewImage({ urls: [url], current: url })
    },

    formatMsgTime(time) {
      if (!time) return ''
      const d = new Date(time)
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.chat-page { position: relative; height: 100vh; background: #f5f5f5; box-sizing: border-box; }
.msg-list { position: absolute; left: 0; right: 0; top: 0; bottom: 120rpx; padding: 20rpx; }
.msg-item { margin-bottom: 20rpx; display: flex; }
.msg-item.mine { justify-content: flex-end; }
.msg-bubble { display: inline-block; max-width: 70%; padding: 16rpx 24rpx; border-radius: 16rpx;
  background: #fff; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.06); }
.bubble-mine { background: #95ec69; }
.sender { display: block; font-size: 22rpx; color: #999; margin-bottom: 6rpx; }
.msg-text { font-size: 28rpx; color: #333; word-break: break-all; line-height: 1.5; }
.msg-time { display: block; font-size: 20rpx; color: #bbb; margin-top: 6rpx; text-align: right; }
.empty-msg { text-align: center; padding: 80rpx 0; color: #ccc; font-size: 26rpx; }

.input-bar { position: fixed; left: 0; right: 0; bottom: 0; display: flex; align-items: center; padding: 16rpx 20rpx; background: #fff;
  border-top: 1rpx solid #eee; padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); box-sizing: border-box; z-index: 10; }
.msg-input { flex: 1; min-width: 0; height: 68rpx; background: #f5f5f5; border-radius: 34rpx; padding: 0 24rpx; font-size: 28rpx; }
.send-btn { flex-shrink: 0; margin-left: 16rpx; padding: 12rpx 32rpx; background: #ddd; color: #999;
  border-radius: 34rpx; font-size: 28rpx; }
.send-btn.active { background: #07c160; color: #fff; }

.connecting-bar {
  padding: 12rpx 24rpx;
  background: #FFF8E6;
  text-align: center;
}
.connecting-text { font-size: 24rpx; color: #E6A23C; }
</style>
