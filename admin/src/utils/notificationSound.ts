/**
 * 使用 Web Audio API 播放提示音，无需额外音频文件
 * - 系统通知（新订单、售后）：短促提示音
 * - 客服新消息：不同频率的提示音
 */
let audioContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch {
      return null
    }
  }
  return audioContext
}

function beep(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
  const ctx = getContext()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = frequency
    osc.type = type
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  } catch (_) {}
}

/** 新订单、售后等系统通知提示音 */
export function playOrderNotifySound(): void {
  beep(880, 0.12)
  setTimeout(() => beep(1100, 0.1), 120)
}

/** 客服新消息提示音 */
export function playChatNotifySound(): void {
  beep(660, 0.15)
  setTimeout(() => beep(880, 0.12), 100)
  setTimeout(() => beep(660, 0.1), 220)
}
