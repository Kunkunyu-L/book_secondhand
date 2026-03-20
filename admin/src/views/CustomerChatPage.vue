<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getChatSessionsApi, getChatMessagesApi } from '../api'
import { connectSocket } from '../utils/socket'
import type { Socket } from 'socket.io-client'

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
  if (myUserId.value != null) return String(m?.sender_id) === String(myUserId.value)
  return ['admin', 'service'].includes(m?.sender_role)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const loadSessions = async () => {
  try {
    const res: any = await getChatSessionsApi({ status: 'active', pageSize: 50, mode: 'chat' })
    if (res.status === 200) sessions.value = res.data.list || []
  } catch {
    // ignore
  }
}

const refreshCurrentSessionMessages = async () => {
  if (!currentSession.value) return
  try {
    const res: any = await getChatMessagesApi({ session_id: currentSession.value.id, pageSize: 50 })
    if (res?.status === 200) {
      messages.value = (res.data.list || []).slice().reverse() // DESC -> 旧->新
    }
  } catch {
    // ignore
  }
  await nextTick()
  scrollToBottom()
  socket?.emit('mark_read', { session_id: currentSession.value.id })
}

const selectSession = async (s: any) => {
  currentSession.value = s
  try {
    const res: any = await getChatMessagesApi({ session_id: s.id, pageSize: 50 })
    if (res.status === 200) messages.value = (res.data.list || []).slice().reverse()
  } catch {
    messages.value = []
  }

  await nextTick()
  socket?.emit('mark_read', { session_id: s.id })
  scrollToBottom()
}

const sendMessage = () => {
  const text = inputText.value.trim()
  if (!text || !currentSession.value) return
  if (!socket) {
    ElMessage.warning('连接尚未建立')
    return
  }

  socket.emit(
    'send_message',
    {
      session_id: currentSession.value.id,
      content: text,
      msg_type: 'text',
    },
    (res: any) => {
      if (res?.success) {
        inputText.value = ''
        // 让消息顺序与服务端拉取一致：直接刷新当前会话
        refreshCurrentSessionMessages()
      } else {
        ElMessage.error(res?.error || '发送失败')
      }
    }
  )
}

const handleNewMessage = (msg: any) => {
  const isCurrent =
    currentSession.value && String(msg?.session_id) === String(currentSession.value.id)
  if (isCurrent) refreshCurrentSessionMessages()
  loadSessions()
}

onMounted(async () => {
  const token = localStorage.getItem('admin_token') || ''
  if (token) {
    const payload = decodeTokenPayload(token)
    if (payload?.id != null) myUserId.value = String(payload.id)
  }

  await loadSessions()

  socket = connectSocket()
  socket?.on('new_message', handleNewMessage)
})

onUnmounted(() => {
  socket?.off('new_message', handleNewMessage)
})
</script>

<template>
  <el-card shadow="never" class="customer-chat-card">
    <div class="chat-top">
      <div class="chat-title">在线咨询（客服聊天）</div>
      <div class="chat-subtitle">
        选择左侧会话开始聊天
      </div>
    </div>

    <div class="chat-body">
      <div class="session-list">
        <div
          v-for="s in sessions"
          :key="s.id"
          class="session-item"
          :class="{ active: currentSession?.id === s.id }"
          @click="selectSession(s)"
        >
          <el-avatar :size="36" :src="s.avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <div class="session-info">
            <div class="session-name">{{ s.nickname || s.username || '用户' }}</div>
            <div class="session-msg">{{ s.last_message || '暂无消息' }}</div>
          </div>
          <el-badge v-if="s.unread_target > 0" :value="s.unread_target" class="unread-badge" />
        </div>

        <div v-if="sessions.length === 0" class="empty-sessions">
          暂无会话
        </div>
      </div>

      <div class="message-area">
        <template v-if="currentSession">
          <div class="messages" ref="messagesContainer">
            <div v-for="m in messages" :key="m.id" class="msg-row" :class="{ mine: isMine(m) }">
              <div class="msg-bubble" :class="{ 'bubble-mine': isMine(m) }">
                <div class="msg-sender">{{ m.sender_name || m.sender_role }}</div>
                <div class="msg-content">{{ m.content }}</div>
                <div class="msg-time">
                  {{ (m.created_at || m.updated_at)?.slice(11, 16) }}
                </div>
              </div>
            </div>
          </div>

          <div class="input-area">
            <el-input v-model="inputText" placeholder="输入消息..." @keyup.enter="sendMessage" />
            <el-button type="primary" :disabled="!inputText.trim()" @click="sendMessage">
              发送
            </el-button>
          </div>
        </template>

        <div v-else class="no-session">
          暂未选择会话
        </div>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.customer-chat-card {
  height: calc(100vh - 120px);
  overflow: hidden;
}

.chat-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.chat-title {
  font-weight: 700;
  font-size: 16px;
  color: #1f2937;
}

.chat-subtitle {
  font-size: 12px;
  color: #6b7280;
}

.chat-body {
  display: flex;
  height: calc(100% - 38px);
}

.session-list {
  width: 260px;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
}

.session-item {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
}

.session-item.active {
  background: #f1f5f9;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-name {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.session-msg {
  font-size: 11px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.unread-badge {
  flex-shrink: 0;
}

.empty-sessions {
  padding: 40px 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.message-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.msg-row {
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-start;
}

.msg-row.mine {
  justify-content: flex-end;
}

.msg-bubble {
  display: inline-block;
  max-width: 70%;
  background: #f3f4f6;
  padding: 8px 12px;
  border-radius: 8px;
}

.bubble-mine {
  background: #dbeafe;
}

.msg-sender {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
}

.msg-content {
  font-size: 13px;
  word-break: break-all;
}

.msg-time {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 4px;
}

.input-area {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #e5e7eb;
}

.no-session {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 14px;
}
</style>

