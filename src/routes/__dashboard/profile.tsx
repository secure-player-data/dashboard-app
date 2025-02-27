import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/context/auth-context'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/__dashboard/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  const { session, pod } = useAuth()
  if (!session) {
    throw new Error('Session is not defined')
  }

  return (
    <div>
      <Card>
        <CardHeader className="text-center flex flex-col justify-center items-center">
          <CardTitle className="text-xl">Profile Information</CardTitle>
          <CardDescription>Your webID</CardDescription>
          <Card className="w-96 p-4">
            <h1>{session!.info.webId}</h1>
          </Card>
          <CardDescription>Pod url (storage)</CardDescription>
          <Card className="w-96 p-4">
            <h1>{pod}</h1>
          </Card>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </div>
  )
}
