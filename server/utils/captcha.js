// 内存存储验证码，key 为 token，value 为 { answer, expires }
const store = new Map()
const TOKEN_LEN = 16
const TTL = 5 * 60 * 1000 // 5 分钟

function randomToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < TOKEN_LEN; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 生成数学算式验证码
 * @returns { token, question } 例如 { token: 'xxx', question: '7 + 5 = ?' }
 */
function generate() {
  const a = randomInt(1, 20)
  const b = randomInt(1, 20)
  const answer = String(a + b)
  const token = randomToken()
  store.set(token, { answer, expires: Date.now() + TTL })
  return { token, question: `${a} + ${b} = ?` }
}

/**
 * 验证
 * @param {string} token
 * @param {string} value 用户输入的答案
 * @returns {boolean}
 */
function verify(token, value) {
  if (!token || value === undefined || value === null) return false
  const entry = store.get(token)
  if (!entry) return false
  if (Date.now() > entry.expires) {
    store.delete(token)
    return false
  }
  const ok = String(value).trim() === entry.answer
  store.delete(token)
  return ok
}

// 定时清理过期
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of store.entries()) {
    if (now > v.expires) store.delete(k)
  }
}, 60000)

module.exports = { generate, verify }
