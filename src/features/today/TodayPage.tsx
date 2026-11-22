import { useState } from 'react'
import { Card, ComingSoon, PageHeader } from '../../app/ui'
import { useSettings } from '../settings/settingsContext'

function greeting(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function TodayPage() {
  const { settings } = useSettings()
  const name = settings.name.trim()
  const [hello] = useState(() => greeting(new Date().getHours()))

  return (
    <>
      <PageHeader
        title={`${hello}${name ? `, ${name}` : ''}`}
        subtitle="Every day, in every way, my speech grows better and better."
      />
      <div className="space-y-4">
        <Card className="bg-teal-700 text-teal-50 dark:bg-teal-800">
          <blockquote className="text-lg leading-relaxed">
            “We have free choice to accept or reject thoughts. Nothing compels us to think anything, except our own
            desires. Use your mental switch and dictate your thoughts. Believe that you can improve, and you will.”
          </blockquote>
          <p className="mt-3 text-sm text-teal-200">— Frank S. Caprio, M.D.</p>
        </Card>
        <ComingSoon step={3}>Morning, Midday and Bedtime affirmation sessions, with your streak.</ComingSoon>
      </div>
    </>
  )
}
