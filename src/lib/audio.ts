/** 16-bit PCM mono WAV. */
export function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const v = new DataView(buffer)
  const text = (offset: number, s: string) => [...s].forEach((c, i) => v.setUint8(offset + i, c.charCodeAt(0)))
  text(0, 'RIFF')
  v.setUint32(4, 36 + samples.length * 2, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  v.setUint32(16, 16, true)
  v.setUint16(20, 1, true)
  v.setUint16(22, 1, true)
  v.setUint32(24, sampleRate, true)
  v.setUint32(28, sampleRate * 2, true)
  v.setUint16(32, 2, true)
  v.setUint16(34, 16, true)
  text(36, 'data')
  v.setUint32(40, samples.length * 2, true)
  samples.forEach((s, i) => {
    const c = Math.max(-1, Math.min(1, s))
    v.setInt16(44 + i * 2, c < 0 ? c * 0x8000 : c * 0x7fff, true)
  })
  return buffer
}

/**
 * Re-renders a recording at a fixed volume. iOS ignores `audio.volume`, so quiet sleep playback
 * needs the gain baked into the file, played by a plain <audio> element (keeps playing when locked).
 */
export async function renderAtVolume(data: ArrayBuffer, gain: number, sampleRate = 16000): Promise<Blob> {
  const decoded = await new OfflineAudioContext(1, 1, sampleRate).decodeAudioData(data.slice(0))
  const ctx = new OfflineAudioContext(1, Math.ceil(decoded.duration * sampleRate), sampleRate)
  const source = ctx.createBufferSource()
  source.buffer = decoded
  const g = ctx.createGain()
  g.gain.value = gain
  source.connect(g).connect(ctx.destination)
  source.start()
  const rendered = await ctx.startRendering()
  return new Blob([encodeWav(rendered.getChannelData(0), sampleRate)], { type: 'audio/wav' })
}

export function setMediaSession(title: string, handlers: { play: () => void; pause: () => void }) {
  if (!('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = new MediaMetadata({
    title,
    artist: 'Speak Freely',
    artwork: [{ src: `${import.meta.env.BASE_URL}pwa-512x512.png`, sizes: '512x512', type: 'image/png' }],
  })
  navigator.mediaSession.setActionHandler('play', handlers.play)
  navigator.mediaSession.setActionHandler('pause', handlers.pause)
}
