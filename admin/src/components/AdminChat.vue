<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getChatSessionsApi, getChatMessagesApi } from '../api'
import { connectSocket, getSocket, disconnectSocket, connected } from '../utils/socket'
import type { Socket } from 'socket.io-client'

const visible = ref(false)
const sessions = ref<any[]>([])
const currentSession = ref<any>(null)
const messages = ref<any[]>([])
const inputText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
let socket: Socket | null = null
const myUserId = ref<string | null>(null)

const decodeTokenPayload = (token: string) => {
  try {
    const raw = token.replace(/^Bearer\s+/i, '').trim()
    const parts = raw.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]!
    const base64UrlToBase64 = (s: string) => {
      const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
      const pad = b64.length % 4
      return pad ? `${b64}${'='.repeat(4 - pad)}` : b64
    }
    const json = atob(base64UrlToBase64(payload))
    return JSON.parse(json)
  } catch {
    return null
  }
}

const isMine = (m: any) => {
  // 首选：用 sender_id 对比当前管理员 id，避免 sender_role 数据异常导致左右错位
  if (myUserId.value != null) return String(m?.sender_id) === String(myUserId.value)
  return ['admin', 'service'].includes(m?.sender_role)
}

const loadSessions = async () => {
  try {
    const res: any = await getChatSessionsApi({ status: 'active', pageSize: 50 })
    if (res.status === 200) sessions.value = res.data.list || []
  } catch { /* ignore */ }
}

const selectSession = async (s: any) => {
  currentSession.value = s
  try {
    const res: any = await getChatMessagesApi({ session_id: s.id, pageSize: 50 })
    // 服务端按 DESC 返回（最新在前），直接反转为旧->新
    if (res.status === 200) messages.value = (res.data.list || []).slice().reverse()
  } catch { messages.value = [] }
  // 标记已读
  socket?.emit('mark_read', { session_id: s.id })
  await nextTick()
  scrollToBottom()
}

const sendMessage = () => {
  if (!inputText.value.trim() || !currentSession.value) return
  socket?.emit('send_message', {
    session_id: currentSession.value.id,
    content: inputText.value.trim(),
    msg_type: 'text',
  }, (res: any) => {
    if (res?.success) {
      messages.value.push(res.message)
      inputText.value = ''
      nextTick(scrollToBottom)
    } else {
      ElMessage.error(res?.error || '发送失败')
    }
  })
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const refreshCurrentSessionMessages = async () => {
  if (!currentSession.value) return
  try {
    const res: any = await getChatMessagesApi({ session_id: currentSession.value.id, pageSize: 50 })
    if (res?.status === 200) {
      // 服务端按 DESC 返回（最新在前），转成旧->新
      messages.value = (res.data.list || []).slice().reverse()
    }
  } catch {
    // ignore
  }
  await nextTick()
  scrollToBottom()
  socket?.emit('mark_read', { session_id: currentSession.value.id })
}

const handleNewMessage = (msg: any) => {
  // 如果是当前会话的消息，直接追加
  if (currentSession.value && String(msg?.session_id) === String(currentSession.value.id)) {
    // socket 推送缺少 sender_name 字段时会导致顶部显示 sender_role（例如 admin）
    // 这里改为拉取一次 REST 消息，使用 JOIN 拿到正确昵称，并滚动到最新
    refreshCurrentSessionMessages()
  } else {
    // 非当前会话只更新未读/会话列表
  }
  // 更新会话列表
  loadSessions()
}

const toggleChat = () => {
  visible.value = !visible.value
  if (visible.value) loadSessions()
}

onMounted(() => {
  // 解析 admin_token，确定“我”的 userId（用于左右对齐判定）
  const token = localStorage.getItem('admin_token') || ''
  if (token) {
    const payload = decodeTokenPayload(token)
    if (payload?.id != null) myUserId.value = String(payload.id)
  }

  socket = connectSocket()
  if (socket) {
    socket.on('new_message', handleNewMessage)
  }
})

onUnmounted(() => {
  if (socket) {
    socket.off('new_message', handleNewMessage)
  }
})

watch(visible, (v) => { if (v) loadSessions() })
</script>

<template>
  <!-- 悬浮聊天按钮 -->
  <div class="chat-fab" @click="toggleChat">
    <el-icon :size="24"><ChatDotRound /></el-icon>
    <span class="fab-dot" v-if="sessions.some(s => s.unread_target > 0)"></span>
  </div>

  <!-- 聊天面板 -->
  <transition name="slide">
    <div v-show="visible" class="chat-panel">
      <div class="chat-header">
        <span>客服聊天</span>
        <span class="conn-status">
          <span class="conn-dot" :class="{ online: connected }"></span>
          {{ connected ? '在线' : '离线' }}
        </span>
        <el-icon class="close-btn" @click="visible = false"><Close /></el-icon>
      </div>

      <div class="chat-body">
        <!-- 会话列表 -->
        <div class="session-list">
          <div v-for="s in sessions" :key="s.id" class="session-item"
            :class="{ active: currentSession?.id === s.id }" @click="selectSession(s)">
            <el-avatar :size="32" :src="s.avatar"><el-icon><User /></el-icon></el-avatar>
            <div class="session-info">
              <div class="session-name">{{ s.nickname || s.username || '用户' }}</div>
              <div class="session-msg">{{ s.last_message || '暂无消息' }}</div>
            </div>
            <el-badge v-if="s.unread_target > 0" :value="s.unread_target" class="unread-badge" />
          </div>
          <div v-if="sessions.length === 0" style="text-align:center;padding:30px;color:#909399;font-size:13px">暂无会话</div>
        </div>

        <!-- 消息区域 -->
        <div class="message-area">
          <template v-if="currentSession">
            <div class="messages" ref="messagesContainer">
              <div v-for="m in messages" :key="m.id" class="msg-row" :class="{ mine: isMine(m) }">
                <div class="msg-bubble" :class="{ 'bubble-mine': isMine(m) }">
                  <div class="msg-sender">{{ m.sender_name || m.sender_role }}</div>
                  <div>{{ m.content }}</div>
                  <div class="msg-time">{{ (m.created_at || m.updated_at)?.slice(11, 16) }}</div>
                </div>
              </div>
            </div>
            <div class="input-area">
              <el-input v-model="inputText" placeholder="输入消息..." @keyup.enter="sendMessage" />
              <el-button type="primary" :disabled="!inputText.trim()" @click="sendMessage">发送</el-button>
            </div>
          </template>
          <div v-else class="no-session">
            <el-icon :size="40" color="#c0c4cc"><ChatDotRound /></el-icon>
            <p>选择一个会话开始聊天</p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.chat-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 52px;
  height: 52px;
  border-radius: 8px;
  background: #374151;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  z-index: 2000;
  transition: transform 0.2s, box-shadow 0.2s;
}
.chat-fab:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.fab-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc2626;
  border: 2px solid #374151;
}

.chat-panel {
  position: fixed;
  right: 24px;
  bottom: 90px;
  width: 680px;
  height: 520px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
}
.conn-status { font-size: 12px; font-weight: 400; display: flex; align-items: center; gap: 4px; color: #6b7280; }
.conn-dot { width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; }
.conn-dot.online { background: #22c55e; }
.close-btn { cursor: pointer; font-size: 18px; color: #6b7280; }

.chat-body { display: flex; flex: 1; overflow: hidden; }

.session-list { width: 220px; border-right: 1px solid #e5e7eb; overflow-y: auto; flex-shrink: 0; }
.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
  position: relative;
}
.session-item:hover { background: #f8f9fa; }
.session-item.active { background: #f1f5f9; }
.session-info { flex: 1; min-width: 0; }
.session-name { font-size: 13px; font-weight: 500; color: #1f2937; }
.session-msg { font-size: 11px; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px; }
.unread-badge { position: absolute; right: 8px; top: 8px; }

.message-area { flex: 1; display: flex; flex-direction: column; }
.messages { flex: 1; overflow-y: auto; padding: 12px; }
.msg-row { margin-bottom: 10px; display: flex; }
.msg-row.mine { justify-content: flex-end; }
.msg-row:not(.mine) { justify-content: flex-start; }
.msg-bubble {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f3f4f6;
  max-width: 70%;
  text-align: left;
  font-size: 13px;
  word-break: break-all;
}
.bubble-mine { background: #dbeafe; color: #1e40af; border-bottom-right-radius: 4px; border-bottom-left-radius: 12px; }
.msg-row:not(.mine) .msg-bubble { border-bottom-left-radius: 4px; border-bottom-right-radius: 12px; }
.msg-sender { font-size: 11px; color: #6b7280; margin-bottom: 2px; }
.msg-time { font-size: 10px; color: #9ca3af; margin-top: 2px; text-align: left; }
.msg-row.mine .msg-time { text-align: right; }

.input-area { display: flex; gap: 8px; padding: 10px 12px; border-top: 1px solid #e5e7eb; }
.input-area .el-input { flex: 1; }

.no-session {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #9ca3af;
  font-size: 14px;
  gap: 12px;
}

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(20px); }
</style>
