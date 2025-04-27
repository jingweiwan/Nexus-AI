"use client"
import { Calendar, Home, Inbox, PowerIcon, Search, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import NexusLogo from "@/components/ui/nexusLogo"
// Menu items.
import {
  UserGroupIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import NavLink from "@/app/ui/dashboard/nav-link";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
export const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Chat',
    href: '/dashboard/chat',
    icon: ChatBubbleLeftRightIcon,
  },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },

];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <NexusLogo width={50} height={50} color="black"/>
          <span className="text-2xl font-bold">Nexus</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem className="" key={item.name}>
                  <SidebarMenuButton asChild>
                    <NavLink name={item.name} href={item.href} icon={item.icon} />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink name="Sign Out" href="/sign-out" icon={PowerIcon} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
