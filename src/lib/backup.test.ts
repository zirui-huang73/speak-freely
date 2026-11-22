import { describe, expect, it } from 'vitest'
import { backupFileName, createBackup, fromBase64, parseBackup, restoreBackup, toBase64 } from './backup'
import { loadRecording, saveRecording } from './recordings'
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from './settings'

describe('base64', () => {
  it('round-trips binary data, including large buffers', () => {
    const bytes = new Uint8Array(100_000).map((_, i) => i % 256)
    expect(new Uint8Array(fromBase64(toBase64(bytes.buffer)))).toEqual(bytes)
  })
})

describe('parseBackup', () => {
  it('rejects files that are not backups', () => {
    expect(() => parseBackup('not json')).toThrow('not a Speak Freely backup')
    expect(() => parseBackup('{"app":"other"}')).toThrow('not a Speak Freely backup')
    expect(() => parseBackup('{"app":"speak-freely","version":99,"kv":{},"recordings":[]}')).toThrow('newer version')
  })
})

describe('backupFileName', () => {
  it('uses the local date', () => {
    expect(backupFileName(new Date('2026-11-23T09:00:00').getTime())).toBe('speak-freely-backup-2026-11-23.json')
  })
})

describe('createBackup / restoreBackup', () => {
  it('moves settings and recordings between devices', async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, name: 'Zirui', reps: 25 })
    await saveRecording({ kind: 'animated', data: new Uint8Array([9, 8, 7]).buffer, mimeType: 'audio/mp4', createdAt: 5, durationMs: 3000 })

    const full = parseBackup(JSON.stringify(await createBackup(true)))
    const light = await createBackup(false)
    expect(full.recordings).toHaveLength(1)
    expect(light.recordings).toHaveLength(0)

    await saveSettings({ ...DEFAULT_SETTINGS, name: 'Someone else' })
    await restoreBackup(full)
    expect((await loadSettings()).name).toBe('Zirui')
    expect(new Uint8Array((await loadRecording('animated'))!.data)).toEqual(new Uint8Array([9, 8, 7]))

    await saveSettings({ ...DEFAULT_SETTINGS, name: 'Changed' })
    await restoreBackup(light)
    expect((await loadSettings()).name).toBe('Zirui')
    expect(await loadRecording('animated')).toBeDefined()
  })
})
