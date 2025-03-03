import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

export function StatCard(props: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex flex-col p-4">
      <props.icon className="mb-4" />
      <p className="text-sm text-muted-foreground">{props.label}</p>
      <p className="text-3xl font-bold">{props.value}</p>
    </Card>
  );
}
