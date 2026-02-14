/**
 * UniApp Socket.IO 客户端封装
 * 
 * 说明：UniApp 环境下原生 Socket.IO 不可用，
 * 使用 uni.connectSocket 封装简易版本。
 * 如需完整 Socket.IO 支持，请安装 uni-socket.io 插件。
 * 
 * 使用方法：
 *   import io from './socket-client.js'
 *   const socket = io('http://localhost:3000', { query: { token: 'xxx' } })
 *   socket.on('connect', () => {})
 *   socket.emit('event', data, callback)
 */

class UniSocket {
  constructor(url, options = {}) {
    this.url = url
    this.options = options
    this.connected = false
    this.listeners = {}
    this.socketTask = null
    this.reconnectTimer = null
    this.msgId = 0
    this.callbacks = {}
    this.connect()
  }

  connect() {
    const token = this.options.query?.token || ''
    const wsUrl = this.url.replace('http', 'ws') + `/socket.io/?EIO=4&transport=websocket&token=${token}`

    this.socketTask = uni.connectSocket({
      url: wsUrl,
      complete: () => {}
    })

    this.socketTask.onOpen(() => {
      this.connected = true
      // Socket.IO 握手
      this.socketTask.send({ data: '40' })
      this._emit('connect')
    })

    this.socketTask.onMessage((res) => {
      const data = res.data
      if (typeof data !== 'string') return

      // Socket.IO 协议解析
      if (data === '2') {
        // Ping -> Pong
        this.socketTask.send({ data: '3' })
        return
      }

      if (data.startsWith('42')) {
        try {
          const payload = JSON.parse(data.substring(2))
          if (Array.isArray(payload) && payload.length >= 2) {
            const [event, ...args] = payload
            this._emit(event, ...args)
          }
        } catch (e) {
          console.error('[UniSocket] Parse error:', e)
        }
      }
    })

    this.socketTask.onClose(() => {
      this.connected = false
      this._emit('disconnect')
      // 自动重连
      if (!this._manualClose) {
        this.reconnectTimer = setTimeout(() => this.connect(), 5000)
      }
    })

    this.socketTask.onError((err) => {
      this.connected = false
      this._emit('connect_error', err)
    })
  }

  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(fn)
  }

  off(event, fn) {
    if (!this.listeners[event]) return
    if (fn) {
      this.listeners[event] = this.listeners[event].filter(f => f !== fn)
    } else {
      delete this.listeners[event]
    }
  }

  emit(event, ...args) {
    if (!this.connected || !this.socketTask) return

    // 检查最后一个参数是否为回调函数
    let callback = null
    if (typeof args[args.length - 1] === 'function') {
      callback = args.pop()
      this.msgId++
      this.callbacks[this.msgId] = callback
    }

    const payload = JSON.stringify([event, ...args])
    const prefix = callback ? `42${this.msgId}` : '42'
    this.socketTask.send({ data: prefix + payload })
  }

  disconnect() {
    this._manualClose = true
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    if (this.socketTask) {
      this.socketTask.close()
      this.socketTask = null
    }
    this.connected = false
  }

  _emit(event, ...args) {
    const fns = this.listeners[event]
    if (fns) fns.forEach(fn => fn(...args))
  }
}

export default function io(url, options) {
  return new UniSocket(url, options)
}
