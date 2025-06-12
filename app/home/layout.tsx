import SideNav from '@/app/ui/dashboard/sidenav';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Bars3Icon } from '@heroicons/react/24/outline';

// export default function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
//       <div className="w-full flex-none md:w-64">
//         <SideNav />
//       </div>
//       <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
//     </div>
//   );
// }

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='flex-1'>
        <SidebarTrigger >
          <Bars3Icon className="h-5 w-5" />
        </SidebarTrigger>
        {children}
      </main>
    </SidebarProvider>
  )
}