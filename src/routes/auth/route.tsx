import { usePageTitle } from '@/hooks/use-page-title';
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
});

function RouteComponent() {
  usePageTitle('Secure Player Data - Auth');

  return <Outlet />;
}
