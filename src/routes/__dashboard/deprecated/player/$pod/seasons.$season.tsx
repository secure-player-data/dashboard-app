import { SeasonHeader } from '@/components/pages/season/season-header'
import { SeasonMatches } from '@/components/pages/season/season-matches'
import { useAuth } from '@/context/auth-context'
import { useGetSeasonInfo } from '@/use-cases/football-data'
import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'

const searchSchema = z.object({
  type: z.enum(['club', 'nation']),
})

export const Route = createFileRoute(
  '/__dashboard/deprecated/player/$pod/seasons/$season',
)({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
})

function RouteComponent() {
  const { pod, season } = Route.useParams()
  const { type } = Route.useSearch()
  const { session } = useAuth()

  const { data: info } = useGetSeasonInfo(session, pod, type, season)

  return (
    <div className="@container">
      <SeasonHeader pod={pod} season={season} type={type} />
      <SeasonMatches
        pod={pod}
        season={season}
        type={type}
        team={info?.team ?? ''}
      />
    </div>
  )
}
