import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useEffect, useMemo } from 'react';
import { isAuthenticated, useAuth } from '@/context/auth-context';
import { useGetProfile } from '@/use-cases/use-get-profile';
import {
  CredentialsNotSetException,
  ProfileDoesNotExistException,
} from '@/exceptions/profile-data-exceptions';
import { usePageTitle } from '@/hooks/use-page-title';
import { Info, TriangleAlert } from 'lucide-react';

export const Route = createFileRoute('/__dashboard')({
  component: RouteComponent,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/auth/login' });
    }
  },
});

function RouteComponent() {
  const { session, pod } = useAuth();
  const router = useRouterState();
  const navigate = useNavigate();
  usePageTitle('Secure Player Data - Dashboard');

  const paths = useMemo(
    () => router.location.pathname.split('/').filter((p) => p !== '') ?? [],
    [router.location.pathname]
  );

  const {
    error: profileError,
    data: profile,
    isFetching: profilePending,
  } = useGetProfile(session, pod);

  useEffect(() => {
    handleRedirect();
  }, []);

  useEffect(() => {
    handleRedirect();
  }, [profileError, profile, profilePending]);

  function handleRedirect() {
    if (
      profileError instanceof ProfileDoesNotExistException ||
      profileError instanceof CredentialsNotSetException
    ) {
      navigate({ to: '/auth/profile' });
    }
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {paths.map((path, index) => {
                  return (
                    <div
                      key={`${path}-${index}`}
                      className="flex items-center gap-2"
                    >
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {decodeURIComponent(path)}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                      {index < paths.length - 1 && <BreadcrumbSeparator />}
                    </div>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="px-4 h-full w-full">
          {profile?.team === null && (
            <div className="mb-8 border-2 border-blue-400 bg-blue-400/10 p-4 rounded-md">
              <Info className="mb-2" />
              <h1 className="text-lg font-semibold">No Team Available</h1>
              <p className="text-sm">
                You are currently not assosiated with any team. Go to{' '}
                <Link to="/team/details" className="underline">
                  team details
                </Link>{' '}
                to either send a request to join a team or create your own.
              </p>
            </div>
          )}
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
