import { useMemo, type ReactNode } from 'react'
import { usePersisted } from '../../app/usePersisted'
import { loadCrutchData, normalizeCrutchData, saveCrutchData } from '../../lib/crutches'
import { CrutchContext, type CrutchContextValue } from './crutchContext'

export function CrutchProvider({ children }: { children: ReactNode }) {
  const [data, mutate] = usePersisted(loadCrutchData, saveCrutchData)

  const value = useMemo<CrutchContextValue | null>(
    () =>
      data && {
        data,
        setWeek: (n) => mutate((d) => normalizeCrutchData({ ...d, week: n })),
        addCount: (n) => mutate((d) => ({ ...d, counts: { ...d.counts, [n]: (d.counts[n] ?? 0) + 1 } })),
        addWord: (word) => mutate((d) => normalizeCrutchData({ ...d, myWords: [...d.myWords, word] })),
        removeWord: (word) => mutate((d) => ({ ...d, myWords: d.myWords.filter((w) => w !== word) })),
        addSentence: (text) => mutate((d) => normalizeCrutchData({ ...d, mySentences: [...d.mySentences, text] })),
        updateSentence: (old, text) =>
          mutate((d) => normalizeCrutchData({ ...d, mySentences: d.mySentences.map((x) => (x === old ? text : x)) })),
        removeSentence: (text) => mutate((d) => ({ ...d, mySentences: d.mySentences.filter((x) => x !== text) })),
      },
    [data, mutate],
  )

  if (!value) return null
  return <CrutchContext.Provider value={value}>{children}</CrutchContext.Provider>
}
