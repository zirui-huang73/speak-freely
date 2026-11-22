import { deleteFrom, getFrom, putIn } from './storage'

export const RECORDING_KINDS = ['monotone', 'animated'] as const
export type RecordingKind = (typeof RECORDING_KINDS)[number]

export interface Recording {
  kind: RecordingKind
  data: ArrayBuffer
  mimeType: string
  createdAt: number
  durationMs: number
}

export const KIND_INFO: Record<RecordingKind, { title: string; how: string; use: string }> = {
  monotone: {
    title: 'Monotone',
    how: 'Speak in a calm, flat, even voice, as if you were drifting off to sleep.',
    use: 'Plays very softly while you sleep.',
  },
  animated: {
    title: 'Animated',
    how: 'Speak with energy and feeling, like an actor who loves every word.',
    use: 'For idle moments: commuting, walking, chores.',
  },
}

const MIME_CANDIDATES = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']

export function pickMimeType(isSupported: (type: string) => boolean): string | undefined {
  return MIME_CANDIDATES.find((t) => isSupported(t))
}

export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export const saveRecording = (r: Recording) => putIn('recordings', r.kind, r)
export const loadRecording = (kind: RecordingKind) => getFrom<Recording>('recordings', kind)
export const deleteRecording = (kind: RecordingKind) => deleteFrom('recordings', kind)

export async function loadAllRecordings(): Promise<Partial<Record<RecordingKind, Recording>>> {
  const entries = await Promise.all(RECORDING_KINDS.map(async (k) => [k, await loadRecording(k)] as const))
  return Object.fromEntries(entries.filter(([, r]) => r))
}

export const recordingBlob = (r: Recording) => new Blob([r.data], { type: r.mimeType })
