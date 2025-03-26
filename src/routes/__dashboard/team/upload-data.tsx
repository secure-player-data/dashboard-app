import { createFileRoute } from '@tanstack/react-router';
import UploadDataForm from '@/components/forms/upload-data-form';

export const Route = createFileRoute('/__dashboard/team/upload-data')({
  component: RouteComponent,
});

function RouteComponent() {
  return <UploadDataForm />;
}
