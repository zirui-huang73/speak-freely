import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, PageHeader } from '../../app/ui'
import { backupFileName, createBackup, parseBackup, restoreBackup } from '../../lib/backup'

type Status = { kind: 'ok' | 'error'; text: string } | null

async function deliver(file: File) {
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Speak Freely backup' })
      return
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function DataPage() {
  const [withRecordings, setWithRecordings] = useState(true)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  const exportData = async () => {
    setBusy(true)
    setStatus(null)
    try {
      const backup = await createBackup(withRecordings)
      const file = new File([JSON.stringify(backup)], backupFileName(backup.exportedAt), { type: 'application/json' })
      await deliver(file)
      setStatus({ kind: 'ok', text: `Backup ready (${(file.size / 1024 / 1024).toFixed(1)} MB).` })
    } catch (e) {
      setStatus({ kind: 'error', text: e instanceof Error ? e.message : String(e) })
    } finally {
      setBusy(false)
    }
  }

  const importData = async (file: File) => {
    setStatus(null)
    try {
      const backup = parseBackup(await file.text())
      const when = new Date(backup.exportedAt).toLocaleString()
      const recs = backup.recordings.length
        ? 'Recordings will be replaced too.'
        : 'This backup has no recordings; your current recordings stay.'
      if (!confirm(`Replace all data on this device with the backup from ${when}? ${recs}`)) return
      setBusy(true)
      await restoreBackup(backup)
      window.location.reload()
    } catch (e) {
      setStatus({ kind: 'error', text: e instanceof Error ? e.message : String(e) })
      setBusy(false)
    }
  }

  return (
    <>
      <Link to="/more" className="text-sm text-teal-700 dark:text-teal-300">
        ‹ More
      </Link>
      <PageHeader
        title="Export / Import"
        subtitle="Your data lives only on this device. Use a backup file to move it or keep it safe."
      />
      <div className="space-y-4">
        <Card className="space-y-3">
          <h2 className="font-semibold">Export</h2>
          <p className="text-sm text-slate-500">
            Settings, Today's 10, favorites, your own cards, words, counts and practice history.
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={withRecordings}
              onChange={(e) => setWithRecordings(e.target.checked)}
              className="accent-teal-700"
            />
            Include recordings (larger file)
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={exportData}
            className="rounded-xl bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800 disabled:opacity-40"
          >
            Export backup
          </button>
          <p className="text-xs text-slate-500">On iPhone you can AirDrop the file to your Mac, or save it to Files.</p>
        </Card>

        <Card className="space-y-3">
          <h2 className="font-semibold">Import</h2>
          <p className="text-sm text-slate-500">Replaces everything on this device with the contents of a backup file.</p>
          <label
            className={`inline-block cursor-pointer rounded-xl border border-slate-300 px-4 py-2.5 font-medium dark:border-slate-700 ${
              busy ? 'pointer-events-none opacity-40' : ''
            }`}
          >
            Choose backup file…
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (f) void importData(f)
              }}
            />
          </label>
        </Card>

        {status && (
          <p
            className={`rounded-xl p-3 text-sm ${
              status.kind === 'ok'
                ? 'bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-200'
            }`}
          >
            {status.text}
          </p>
        )}
      </div>
    </>
  )
}
