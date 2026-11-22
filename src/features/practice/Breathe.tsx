import { useEffect, useState } from 'react'

const IN_MS = 4000
const OUT_MS = 6000
const CYCLES = 6

export function Breathe({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'in' | 'out' | 'start'>('start')
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const t = setTimeout(
      () => {
        if (phase === 'start') setPhase('in')
        else if (phase === 'in') setPhase('out')
        else if (cycle + 1 >= CYCLES) onDone()
        else {
          setCycle((c) => c + 1)
          setPhase('in')
        }
      },
      phase === 'start' ? 50 : phase === 'in' ? IN_MS : OUT_MS,
    )
    return () => clearTimeout(t)
  }, [phase, cycle, onDone])

  const secondsLeft = Math.ceil(((CYCLES - cycle) * (IN_MS + OUT_MS)) / 1000)

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
      <div className="relative grid size-64 place-items-center">
        <div
          className="absolute inset-0 rounded-full bg-teal-500/20 ease-in-out dark:bg-teal-400/20"
          style={{
            transform: `scale(${phase === 'in' ? 1 : 0.5})`,
            transitionProperty: 'transform',
            transitionDuration: `${phase === 'in' ? IN_MS : OUT_MS}ms`,
          }}
        />
        <div
          className="absolute inset-8 rounded-full bg-teal-600/30 ease-in-out dark:bg-teal-400/30"
          style={{
            transform: `scale(${phase === 'in' ? 1 : 0.55})`,
            transitionProperty: 'transform',
            transitionDuration: `${phase === 'in' ? IN_MS : OUT_MS}ms`,
          }}
        />
        <p className="relative text-2xl font-medium">{phase === 'out' ? 'Breathe out…' : 'Breathe in…'}</p>
      </div>
      <p className="text-sm text-slate-500">
        Relax your shoulders, jaw and tongue · about {secondsLeft}s
      </p>
      <button type="button" onClick={onDone} className="rounded-xl px-5 py-2.5 font-medium text-teal-700 dark:text-teal-300">
        Skip
      </button>
    </div>
  )
}
