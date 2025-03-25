import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__dashboard/file/$url')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__dashboard/file/$url"!</div>
}
