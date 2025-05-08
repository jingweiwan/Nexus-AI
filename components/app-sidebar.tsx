"use client"
import { useRouter, usePathname } from "next/navigation"
import { ArrowLeftEndOnRectangleIcon, ChatBubbleLeftRightIcon, HomeIcon, UserGroupIcon, Bars3Icon } from '@heroicons/react/24/outline'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import NexusLogo from "@/components/ui/nexusLogo"

// 导航链接映射
export const links = [
  { name: 'Home', href: '/home', icon: HomeIcon },
  { name: 'Chat', href: '/home/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Customers', href: '/home/customers', icon: UserGroupIcon },
];

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  const handleNavigation = (href: string) => {
    router.push(href)
    setOpenMobile(false) // 导航后关闭移动端侧边栏
  }

  return (
    <SidebarProvider>
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
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.href)}
                      tooltip={item.name}
                      isActive={pathname === item.href}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
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
              <SidebarMenuButton
                onClick={() => handleNavigation('/sign-out')}
                tooltip="Sign Out"
              >
                <ArrowLeftEndOnRectangleIcon className="h-5 w-5" />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}
