import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__dashboard/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-[80ch] space-y-4">
      <h1 className="font-bold text-3xl">Settings</h1>
      <Card className="flex items-end justify-between">
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose your preffered theem</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center">
          <ModeToggle />
        </CardContent>
      </Card>
    </div>
  );
}
