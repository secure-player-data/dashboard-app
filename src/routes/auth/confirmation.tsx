import { createFileRoute } from '@tanstack/react-router';
import { CircleCheckBig } from 'lucide-react';

export const Route = createFileRoute('/auth/confirmation')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col justify-center max-w-[60ch] m-auto h-screen ">
      {/* TODO: Change color to primary when updating app theme */}
      <CircleCheckBig className="text-green-400 size-20 mb-4" />
      <h1 className="font-bold text-3xl mb-8">Request Submitted!</h1>
      <p className="mb-4">
        Your request has been sent. The owner will soon receive a notification
        where they can view your request.
      </p>
      <p>
        For now, you can sit back and relax. You will receive a mail when you
        have been accepted!
      </p>
    </div>
  );
}
