import { ChevronsUpDown, Cog, Loader2, LogOut, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/auth-context';
import type { Profile } from '@/entities/data/profile';
import { useNavigate } from '@tanstack/react-router';
import { useGetProfile } from '@/use-cases/use-get-profile';

export function NavUser({ user }: { user: Profile | null | undefined }) {
  const { isMobile } = useSidebar();
  const { signOut, session, pod } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isPending: profilePending } = useGetProfile(
    session,
    pod
  );

  const showProfilePicture = () => {
    if (profilePending) {
      return <Loader2 className="animate-spin" />;
    }

    return (
      <div>
        <AvatarImage src={profile?.picture} alt="Profile picture" />
        <AvatarFallback className="rounded-lg"></AvatarFallback>
      </div>
    );
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {showProfilePicture()}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.name ?? session?.info.webId}
                </span>
                <span className="truncate text-xs">{session?.info.webId}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {showProfilePicture()}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.name ?? session?.info.webId}
                  </span>
                  <span className="truncate text-xs">
                    {session?.info.webId}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                navigate({ to: '/profile' });
              }}
            >
              <User />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigate({ to: '/settings' });
              }}
            >
              <Cog />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
