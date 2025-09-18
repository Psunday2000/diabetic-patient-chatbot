'use client';

import AppHeader from '@/components/layout/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider defaultOpen={true}>
          <div className="flex flex-col h-screen">
            <AppHeader />
            <main className="flex-1 flex overflow-hidden">
              {children}
            </main>
          </div>
        </SidebarProvider>
    )
}
