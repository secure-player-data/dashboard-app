import CreateTeamForm from '@/components/forms/create-team-form'
import JoinTeamForm from '@/components/forms/join-team-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/auth-context'
import { useGetProfile } from '@/use-cases/use-get-profile'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2, TriangleAlert } from 'lucide-react'

export const Route = createFileRoute('/__dashboard/team/details')({
  component: RouteComponent,
})

function RouteComponent() {
  const { session, pod } = useAuth()
  const { data: profile, error, isPending } = useGetProfile(session, pod)

  if (isPending) {
    return <Loader2 className="size-4 animate-spin" />
  }

  if (error || !profile) {
    return <p>Error: {error?.message}</p>
  }

  if (!profile.team) {
    return (
      <div className="flex flex-col gap-4">
        <JoinTeamForm />
        <p className="text-center text-muted-foreground">or</p>
        <CreateTeamForm />
      </div>
    )
  }
}
