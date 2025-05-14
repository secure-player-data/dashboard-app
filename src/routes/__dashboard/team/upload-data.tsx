import { createFileRoute } from '@tanstack/react-router';
import UploadDataForm from '@/components/forms/upload-data-form';
import UploadMyDataForm from '@/components/forms/upload-my-data-form';
import { useGetProfile } from '@/use-cases/profile';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';

const searchParams = z.object({
  dataType: z.string().optional(),
});

export const Route = createFileRoute('/__dashboard/team/upload-data')({
  component: RouteComponent,
  validateSearch: zodValidator(searchParams),
});

function RouteComponent() {
  const { dataType } = Route.useSearch();
  const { session, pod } = useAuth();
  const { data: profile, isPending, error } = useGetProfile(session, pod);

  if (isPending) {
    return (
      <div className="grid place-items-center h-full">
        <Loader2 className="size-4 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid place-items-center h-full">
        <p className="text-sm text-destructive">{error.message}</p>
      </div>
    );
  }

  if (profile?.team === null) {
    return <UploadMyDataForm selectedDataType={dataType} />;
  }

  return <UploadDataForm selectedDataType={dataType} />;
}
