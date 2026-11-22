export interface NoiseHandle {
  fadeOut: (ms: number) => void
  pause: () => void
  resume: () => void
  stop: () => void
}

/** Generates looping white or brown noise. Must be called from a tap so iOS allows audio. */
export function startNoise(type: 'white' | 'brown', volume: number): NoiseHandle | null {
  if (typeof AudioContext === 'undefined') return null
  const ctx = new AudioContext()
  const length = ctx.sampleRate * 8
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = type === 'white' ? white * 0.4 : last * 3.5
  }
  const drift = data[length - 1] - data[0]
  for (let i = 0; i < length; i++) data[i] -= (drift * i) / length

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 3)
  source.connect(gain).connect(ctx.destination)
  source.start()

  const close = () => {
    if (ctx.state !== 'closed') void ctx.close()
  }
  return {
    fadeOut: (ms) => {
      gain.gain.setTargetAtTime(0, ctx.currentTime, ms / 4000)
      setTimeout(close, ms)
    },
    pause: () => void ctx.suspend(),
    resume: () => void ctx.resume(),
    stop: close,
  }
}
