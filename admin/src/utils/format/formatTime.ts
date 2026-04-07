export const formatTime = (time: string | number | Date | null | undefined): string => {
  if (!time) return '-'

  let date: Date

  if (time instanceof Date) {
    date = time
  } else if (typeof time === 'number') {
    if (time < 10000000000) {
      date = new Date(time * 1000)
    } else {
      date = new Date(time)
    }
  } else {
    const timeStrRaw = String(time).trim()
    let timeStr = timeStrRaw
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(timeStrRaw)) timeStr = timeStrRaw.replace(' ', 'T')
    if (/^\d{4}-\d{2}-\d{2}$/.test(timeStrRaw)) timeStr = `${timeStrRaw}T00:00:00`
    date = new Date(timeStr)
  }

  if (isNaN(date.getTime())) return '-'

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

export const formatRelativeTime = (time: string | number | Date | null | undefined): string => {
  if (!time) return '-'

  let date: Date

  if (time instanceof Date) {
    date = time
  } else if (typeof time === 'number') {
    if (time < 10000000000) {
      date = new Date(time * 1000)
    } else {
      date = new Date(time)
    }
  } else {
    const timeStrRaw = String(time).trim()
    let timeStr = timeStrRaw
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(timeStrRaw)) timeStr = timeStrRaw.replace(' ', 'T')
    if (/^\d{4}-\d{2}-\d{2}$/.test(timeStrRaw)) timeStr = `${timeStrRaw}T00:00:00`
    date = new Date(timeStr)
  }

  if (isNaN(date.getTime())) return '-'

  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const absDiff = Math.abs(diff)

  if (absDiff < 60000) {
    return '刚刚'
  }

  if (absDiff < 3600000) {
    const minutes = Math.floor(absDiff / 60000)
    return `${minutes}分钟前`
  }

  if (absDiff < 86400000) {
    const hours = Math.floor(absDiff / 3600000)
    return `${hours}小时前`
  }

  if (absDiff < 2592000000) {
    const days = Math.floor(absDiff / 86400000)
    if (days === 1) return '昨天'
    if (days === 2) return '前天'
    return `${days}天前`
  }

  if (absDiff < 31536000000) {
    const months = Math.floor(absDiff / 2592000000)
    return `${months}个月前`
  }

  return formatTime(time)
}