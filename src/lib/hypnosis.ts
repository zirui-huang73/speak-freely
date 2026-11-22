import { buildScript, type HypnosisMode, type ScriptLine } from '../content/hypnosis'

export interface TimedLine extends ScriptLine {
  pauseMs: number
}

/** Approximate speaking speed of browser voices at rate 1. */
const WORDS_PER_MINUTE = 165
const MIN_PAUSE_UNIT_MS = 700

export const speechMs = (text: string, rate: number) =>
  (text.split(/\s+/).filter(Boolean).length / (WORDS_PER_MINUTE * rate)) * 60_000

/** Stretches pauses so the whole script lasts about `minutes`. */
export function timeScript(lines: ScriptLine[], minutes: number, rate: number): TimedLine[] {
  const speaking = lines.reduce((sum, l) => sum + speechMs(l.text, rate), 0)
  const units = lines.reduce((sum, l) => sum + l.pause, 0)
  const unit = Math.max(MIN_PAUSE_UNIT_MS, (minutes * 60_000 - speaking) / units)
  return lines.map((l) => ({ ...l, pauseMs: Math.round(l.pause * unit) }))
}

export const estimateMs = (lines: TimedLine[], rate: number) =>
  lines.reduce((sum, l) => sum + speechMs(l.text, rate) + l.pauseMs, 0)

export function hypnosisSession(mode: HypnosisMode, minutes: number, affirmations: string[], rate: number) {
  return timeScript(buildScript(mode, minutes, affirmations), minutes, rate)
}
