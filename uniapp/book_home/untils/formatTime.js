/**
 * 格式化时间显示
 * @param time - 时间字符串或时间戳
 * @returns 格式化后的时间字符串
 */
export const formatTime = (time) => {
  if (!time) return '-'

  let date

  // 处理不同类型的时间输入
  if (time instanceof Date) {
    date = time
  } else if (typeof time === 'number') {
    // 时间戳（秒或毫秒）
    if (time < 10000000000) {
      // 秒级时间戳
      date = new Date(time * 1000)
    } else {
      // 毫秒级时间戳
      date = new Date(time)
    }
  } else {
    // 字符串时间：将 MySQL datetime 格式 "YYYY-MM-DD HH:MM:SS" 转为 ISO 格式
    const normalized = String(time).replace(' ', 'T')
    date = new Date(normalized)
  }

  // 检查是否为有效日期
  if (isNaN(date.getTime())) return '-'

  // 返回本地化时间格式
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

/**
 * 相对时间格式化（如：刚刚、5分钟前、昨天等）
 * @param time - 时间字符串或时间戳
 * @returns 相对时间字符串
 */
export const formatRelativeTime = (time) => {
  if (!time) return '-'

  let date

  if (time instanceof Date) {
    date = time
  } else if (typeof time === 'number') {
    if (time < 10000000000) {
      date = new Date(time * 1000)
    } else {
      date = new Date(time)
    }
  } else {
    const normalized = String(time).replace(' ', 'T')
    date = new Date(normalized)
  }

  if (isNaN(date.getTime())) return '-'

  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const absDiff = Math.abs(diff)

  // 一分钟内
  if (absDiff < 60000) {
    return '刚刚'
  }

  // 一小时内
  if (absDiff < 3600000) {
    const minutes = Math.floor(absDiff / 60000)
    return `${minutes}分钟前`
  }

  // 24小时内
  if (absDiff < 86400000) {
    const hours = Math.floor(absDiff / 3600000)
    return `${hours}小时前`
  }

  // 30天内
  if (absDiff < 2592000000) {
    const days = Math.floor(absDiff / 86400000)
    if (days === 1) return '昨天'
    if (days === 2) return '前天'
    return `${days}天前`
  }

  // 一年内
  if (absDiff < 31536000000) {
    const months = Math.floor(absDiff / 2592000000)
    return `${months}个月前`
  }

  // 超过一年
  return formatTime(time)
}