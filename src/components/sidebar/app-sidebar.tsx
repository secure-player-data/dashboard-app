import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import {
  Database,
  EyeOff,
  FileStack,
  House,
  Share,
  LifeBuoy,
  Send,
  InboxIcon,
  Users,
  ReceiptText,
  User,
  Volleyball,
  Calendar,
  Locate,
  Fingerprint,
  Activity,
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
import { useGetProfile } from '@/use-cases/use-get-profile';
import { NavGroup } from './nav-group';
import { NavFooter } from './nav-footer';
import { NavMain } from './nav-main';

const data = {
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
          url: '/personal-data',
          icon: User,
        },
        {
          title: 'Football Data',
          url: '/football-data',
          icon: Volleyball,
        },
        {
          title: 'Event Data',
          url: '/event-data',
          icon: Calendar,
        },
        {
          title: 'Tracking Data',
          url: '/tracking-data',
          icon: Locate,
        },
        {
          title: 'Biometric Data',
          url: '/biometric-data',
          icon: Fingerprint,
        },
        {
          title: 'Health Data',
          url: '/health-data',
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
        icon: ReceiptText,
      },
      {
        name: 'Members',
        url: '/team/members',
        icon: Users,
      },
      {
        name: 'Outsourcing',
        url: '/team/outsourcing',
        icon: Share,
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
};

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
              url: '/',
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
              url: '/',
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
            icon: ReceiptText,
          },
          {
            name: 'Members',
            url: '/team/members',
            icon: Users,
          },
          {
            name: 'Outsourcing',
            url: '/team/outsourcing',
            icon: Share,
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
              <div className="flex gap-2">
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <img src="/logo-v1.webp" alt="Logo" className="rounded-md" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.team?.name ?? 'No team'}
                  </span>
                  <span className="truncate text-xs">
                    {user?.team?.tag ?? '-'}
                  </span>
                </div>
              </div>
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
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
