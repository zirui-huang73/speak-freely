export interface Ticker {
  tick: () => void
  close: () => void
}

/** A soft metronome click. Create it from a tap so iOS allows audio. */
export function createTicker(): Ticker | null {
  if (typeof AudioContext === 'undefined') return null
  const ctx = new AudioContext()
  return {
    tick: () => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 1100
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    },
    close: () => {
      if (ctx.state !== 'closed') void ctx.close()
    },
  }
}
