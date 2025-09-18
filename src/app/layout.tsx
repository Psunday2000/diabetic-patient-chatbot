'use client';
import type { Metadata } from 'next'; // Metadata can still be used in client components
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppHeader from '@/components/layout/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';

// export const metadata: Metadata = { // Cannot export metadata from client component directly. Set in page.tsx or a server component layout if needed.
//   title: 'DiaChat - Your Diabetes Assistant',
//   description: 'AI-powered chatbot to help you manage diabetes.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>DiaChat - Your Diabetes Assistant</title>
        <meta name="description" content="AI-powered chatbot to help you manage diabetes." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <SidebarProvider defaultOpen={true}>
          <div className="flex flex-col h-screen">
            <AppHeader />
            <main className="flex-1 flex flex-row overflow-hidden">
              {children}
            </main>
          </div>
          <Toaster />
        </SidebarProvider>
      </body>
    </html>
  );
}
