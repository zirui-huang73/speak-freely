import type { Recording } from './recordings'
import { entries, replaceAll } from './storage'

const APP = 'speak-freely'
const VERSION = 1

interface BackupRecording extends Omit<Recording, 'data'> {
  data: string
}

export interface Backup {
  app: typeof APP
  version: number
  exportedAt: number
  kv: Record<string, unknown>
  recordings: BackupRecording[]
}

export function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}

export function fromBase64(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

export async function createBackup(includeRecordings: boolean, now = Date.now()): Promise<Backup> {
  const kv = Object.fromEntries(await entries('kv'))
  const recordings = includeRecordings
    ? (await entries('recordings')).map(([, r]) => {
        const rec = r as Recording
        return { ...rec, data: toBase64(rec.data) }
      })
    : []
  return { app: APP, version: VERSION, exportedAt: now, kv, recordings }
}

export function parseBackup(text: string): Backup {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('This file is not a Speak Freely backup.')
  }
  const b = raw as Partial<Backup>
  if (!b || b.app !== APP || typeof b.kv !== 'object' || !b.kv || !Array.isArray(b.recordings)) {
    throw new Error('This file is not a Speak Freely backup.')
  }
  if (typeof b.version !== 'number' || b.version > VERSION) {
    throw new Error('This backup was made by a newer version of the app.')
  }
  return b as Backup
}

/** Replaces everything on this device. Recordings are only replaced if the backup contains some. */
export async function restoreBackup(backup: Backup): Promise<void> {
  const recordings: [string, unknown][] = backup.recordings.length
    ? backup.recordings.map((r) => [r.kind, { ...r, data: fromBase64(r.data) }])
    : await entries('recordings')
  await replaceAll({ kv: Object.entries(backup.kv), recordings })
}

export const backupFileName = (at: number) => {
  const d = new Date(at)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `speak-freely-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`
}
