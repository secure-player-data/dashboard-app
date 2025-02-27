import { ProfileSetupForm } from '@/components/forms/profile-setup-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/_setup/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full w-full flex-col gap-6 justify-center items-center m-auto mt-10">
      <ProfileSetupForm />
    </div>
  );
}
