'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import React from 'react';
import { AuthProvider } from '@/hooks/use-auth';
import AuthAwareLayout from '@/components/layout/auth-aware-layout';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>MediChat - Your Medical Assistant</title>
        <meta name="description" content="AI-powered chatbot to help you with your medical questions." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          <AuthAwareLayout>
            {children}
          </AuthAwareLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
