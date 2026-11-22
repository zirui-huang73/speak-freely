import { describe, expect, it } from 'vitest'
import { encodeWav } from './audio'
import {
  deleteRecording,
  formatDuration,
  loadAllRecordings,
  loadRecording,
  pickMimeType,
  saveRecording,
  type Recording,
} from './recordings'

describe('pickMimeType', () => {
  it('prefers mp4, then webm', () => {
    expect(pickMimeType(() => true)).toBe('audio/mp4')
    expect(pickMimeType((t) => t.startsWith('audio/webm'))).toBe('audio/webm;codecs=opus')
    expect(pickMimeType(() => false)).toBeUndefined()
  })
})

describe('formatDuration', () => {
  it('formats m:ss', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(61_400)).toBe('1:01')
    expect(formatDuration(605_000)).toBe('10:05')
  })
})

describe('encodeWav', () => {
  it('writes a valid 16-bit mono header and clamps samples', () => {
    const wav = encodeWav(new Float32Array([0, 1, -1, 2]), 16000)
    const v = new DataView(wav)
    const str = (o: number) => String.fromCharCode(...new Uint8Array(wav, o, 4))
    expect(wav.byteLength).toBe(44 + 8)
    expect([str(0), str(8), str(12), str(36)]).toEqual(['RIFF', 'WAVE', 'fmt ', 'data'])
    expect(v.getUint32(24, true)).toBe(16000)
    expect(v.getUint16(22, true)).toBe(1)
    expect(v.getUint32(40, true)).toBe(8)
    expect([v.getInt16(44, true), v.getInt16(46, true), v.getInt16(48, true), v.getInt16(50, true)]).toEqual([
      0, 32767, -32768, 32767,
    ])
  })
})

describe('recording storage', () => {
  it('saves, loads and deletes per kind', async () => {
    const rec: Recording = {
      kind: 'monotone',
      data: new Uint8Array([1, 2, 3]).buffer,
      mimeType: 'audio/mp4',
      createdAt: 1,
      durationMs: 1000,
    }
    await saveRecording(rec)
    const loaded = await loadRecording('monotone')
    expect(new Uint8Array(loaded!.data)).toEqual(new Uint8Array([1, 2, 3]))
    expect(Object.keys(await loadAllRecordings())).toEqual(['monotone'])
    await deleteRecording('monotone')
    expect(await loadAllRecordings()).toEqual({})
  })
})
