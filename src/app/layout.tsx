'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import React from 'react';
import { AuthProvider } from '@/hooks/use-auth';
import AppLayout from '@/components/layout/app-layout';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAppPage = pathname.startsWith('/chat') || pathname.startsWith('/profile');

  return (
    <html lang="en">
      <head>
        <title>MediChat - Your Medical Assistant</title>
        <meta name="description" content="AI-powered chatbot to help you with your medical questions." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
            {isAppPage ? (
              <AppLayout>
                {children}
              </AppLayout>
            ) : (
              <>{children}</>
            )}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
