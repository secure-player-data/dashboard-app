import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import {
  Database,
  EyeOff,
  FileStack,
  Share,
  LifeBuoy,
  Send,
  Rocket,
  InboxIcon,
  Users,
  User,
  Volleyball,
  Calendar,
  Locate,
  Fingerprint,
  Activity,
  PanelsTopLeft,
} from 'lucide-react';
import { NavUser } from '@/components/sidebar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavGroup } from './nav-group';
import { NavFooter } from './nav-footer';
import { NavMain } from './nav-main';
import { useGetProfile } from '@/use-cases/profile';
import { Link } from '@tanstack/react-router';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session, pod } = useAuth();
  const data = React.useMemo(
    () => ({
      user: {
        name: 'shadcn',
        email: 'm@example.com',
        avatar: '/avatars/shadcn.jpg',
      },
      navMain: [
        {
          title: 'Your data',
          url: '/',
          icon: Database,
          isActive: true,
          items: [
            {
              title: 'Personal Data',
              url: '/player/$pod/personal-data',
              params: { pod: pod ?? 'unknown' },
              icon: User,
            },
            {
              title: 'Football Data',
              url: '/player/$pod/football-data',
              params: { pod: pod ?? 'unknown' },
              icon: Volleyball,
            },
            {
              title: 'Event Data',
              url: '/player/$pod/event-data',
              params: { pod: pod ?? 'unknown' },
              icon: Calendar,
            },
            {
              title: 'Tracking Data',
              url: '/player/$pod/tracking-data',
              params: { pod: pod ?? 'unknown' },
              icon: Locate,
            },
            {
              title: 'Biometric Data',
              url: '/player/$pod/biometric-data',
              params: { pod: pod ?? 'unknown' },
              icon: Fingerprint,
            },
            {
              title: 'Health Data',
              url: '/player/$pod/health-data',
              params: { pod: pod ?? 'unknown' },
              icon: Activity,
            },
          ],
        },
        {
          title: 'Inbox',
          url: '/inbox',
          icon: InboxIcon,
        },
        {
          title: 'Request Overview',
          url: '/request-overview',
          icon: PanelsTopLeft,
        },
        {
          title: 'Access Control',
          url: '/access-control',
          icon: EyeOff,
        },
        {
          title: 'Access History',
          url: '/access-history',
          icon: FileStack,
        },
      ],
      team: {
        title: 'Team',
        items: [
          {
            name: 'Team Details',
            url: '/team/details',
            icon: Users,
          },
          {
            name: 'Upload data',
            url: '/team/upload-data',
            icon: Share,
          },

          {
            name: 'Outsourcing',
            url: '/team/outsourcing',
            icon: Rocket,
          },
        ],
      },
      footer: [
        {
          title: 'Support',
          url: '#',
          icon: LifeBuoy,
        },
        {
          title: 'Feedback',
          url: '#',
          icon: Send,
        },
      ],
    }),
    [pod]
  );

  const { data: user } = useGetProfile(session, pod);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/" className="flex gap-2">
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg">
                  <img
                    src={user?.team?.img || '/placeholder.svg'}
                    alt="Logo"
                    className="rounded-md"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.team?.name ?? 'No team'}
                  </span>
                  <span className="truncate text-xs">
                    {user?.team?.tag ?? '-'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavGroup group={data.team} />
      </SidebarContent>
      <SidebarFooter>
        <NavFooter items={data.footer} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
