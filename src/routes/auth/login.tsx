import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '@/components/forms/login-form';

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted dark:bg-neutral-900 gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm />
      </div>
    </div>
  );
}
