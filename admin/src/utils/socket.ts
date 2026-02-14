import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'

let socket: Socket | null = null
export const connected = ref(false)

export function getSocket(): Socket | null {
  return socket
}

export function connectSocket() {
  const token = localStorage.getItem('admin_token')
  if (!token) return null

  if (socket?.connected) return socket

  // 连接到后端 WebSocket 服务
  const wsUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : window.location.origin

  socket = io(wsUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 3000,
  })

  socket.on('connect', () => {
    console.log('[Socket] 已连接:', socket?.id)
    connected.value = true
  })

  socket.on('disconnect', () => {
    console.log('[Socket] 已断开')
    connected.value = false
  })

  socket.on('connect_error', (err) => {
    console.error('[Socket] 连接错误:', err.message)
    connected.value = false
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
    connected.value = false
  }
}
