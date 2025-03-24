import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__dashboard/team/upload-data')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__dashboard/upload-data"!</div>
}
