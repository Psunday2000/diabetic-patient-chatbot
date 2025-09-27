'use client';

import AppHeader from '@/components/layout/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider defaultOpen={true}>
          <div className="flex-1 w-full flex flex-col h-screen">
            <AppHeader />
            <main className="pt-16 flex-1 flex overflow-hidden min-w-0">
              {children}
            </main>
          </div>
        </SidebarProvider>
    )
}
