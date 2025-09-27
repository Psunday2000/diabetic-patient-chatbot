'use client';
import { Activity, ArrowUp, Menu, ShieldCheck, Zap } from 'lucide-react';
import Logo from '@/components/ui/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/layout/mobile-nav';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import Avatar from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { signOut } from '@/app/auth/actions';
import { updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    // Show/hide header
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down
      setIsHeaderVisible(false);
    } else {
      // Scrolling up
      setIsHeaderVisible(true);
    }
    setLastScrollY(currentScrollY);
    
    // Show/hide scroll-to-top button
    if (currentScrollY > 300) {
      setIsScrollToTopVisible(true);
    } else {
      setIsScrollToTopVisible(false);
    }
  };

   const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const confirmUpload = async () => {
    if (!previewUrl) return;
    
    setUploading(true);
    try {
      // Convert preview URL to blob
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', blob, 'avatar.jpg');
      
      // Upload to your API endpoint
      const uploadResponse = await fetch('/api/avatar', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }
      
      const { url: uploadedUrl } = await uploadResponse.json();
      
      // Update Firebase profile
      if (user) {
        await updateProfile(user, { photoURL: uploadedUrl });
        toast({
          title: 'Success',
          description: 'Profile picture updated successfully!',
        });
      }
      
      setPreviewUrl(null);
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to update profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const cancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    
    try {
      await updateProfile(user, { photoURL: null });
      toast({
        title: 'Success',
        description: 'Profile picture removed successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove profile picture. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className={cn(
          "px-4 lg:px-6 h-16 flex items-center fixed top-0 left-0 right-0 z-50 bg-transparent transition-transform duration-300 ease-in-out",
          !isHeaderVisible && "-translate-y-full"
        )}>
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Logo size={24} className="h-6 w-6 text-primary" alt="MediChat" />
          <span className="ml-2 text-xl font-bold">MediChat</span>
        </Link>
          <nav className="ml-auto hidden md:flex gap-4 sm:gap-6 items-center">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Features
          </Link>
          <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            About
          </Link>
          {user ? (
            <DropdownMenu>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 p-0 rounded-full overflow-hidden">
                  <div className="h-9 w-9">
                    <Avatar src={user?.photoURL || null} name={user?.displayName || user?.email || null} size={36} className="h-9 w-9" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'Guest'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {previewUrl ? (
                  <div className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={previewUrl} alt="preview" className="h-14 w-14 rounded-full object-cover" />
                      <div className="flex flex-col">
                        <span className="font-medium">Preview</span>
                        <span className="text-xs text-muted-foreground">Confirm to upload</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button onClick={confirmUpload} size="sm" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelPreview}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <DropdownMenuItem onClick={handleRemoveAvatar}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Remove avatar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <button onClick={() => fileInputRef.current?.click()}>
                        <User className="mr-2 h-4 w-4" />
                        <span>{uploading ? 'Uploading...' : 'Update profile image'}</span>
                      </button>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </nav>
        <div className="ml-auto md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Menu</span>
            </Button>
        </div>
      </header>

       <MobileNav isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

  <main className="flex-1">
        <section
          className="relative w-full bg-cover bg-center pb-24 md:pb-32 lg:pb-40"
          style={{
            backgroundImage: `url('/images/hero.jpg')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          {/* Background image is applied to the section; overlay ensures readable text */}
          <div className="absolute inset-0 -z-10 h-[420px] md:h-[520px] lg:h-[640px]">
            <div className="absolute inset-0 bg-black/70 dark:bg-black/80" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[hsl(var(--background)/0.98)]" />
          </div>
          <div className="container px-4 md:px-6 pt-20 md:pt-28 lg:pt-32">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4 text-white">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Your Personal AI Medical Assistant
                  </h1>
                  <p className="max-w-[600px] text-white/90 md:text-xl">
                    MediChat provides instant, reliable answers to your health questions, symptom analysis, and general medical information.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                     <Link href="/login">
                        Start Chatting Now
                      </Link>
                  </Button>
                </div>
              </div>
               {/* Decorative artwork removed to avoid visual conflict with hero background */}
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Intelligent Medical Guidance</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  MediChat is designed to be your first stop for medical inquiries, offering a suite of tools to help you understand your health better.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                    <Zap className="h-8 w-8" />
                 </div>
                <h3 className="text-xl font-bold">Instant Answers</h3>
                <p className="text-muted-foreground">Get immediate, AI-powered responses to your general health questions.</p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                    <Activity className="h-8 w-8" />
                 </div>
                <h3 className="text-xl font-bold">Symptom Analysis</h3>
                <p className="text-muted-foreground">Describe your symptoms to receive a preliminary risk assessment.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                    <ShieldCheck className="h-8 w-8" />
                 </div>
                <h3 className="text-xl font-bold">Privacy Focused</h3>
                <p className="text-muted-foreground">Your conversations are secure and private. We do not store personal health data without consent.</p>
              </div>
            </div>
          </div>
        </section>
        <section id="about" className="w-full py-12 md:py-24 lg:py-32 border-t">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">About MediChat</h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    MediChat is a prototype application built to demonstrate the power of generative AI in the medical field. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
                </div>
            </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 MediChat. All rights reserved.</p>
      </footer>
       {isScrollToTopVisible && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-primary shadow-lg hover:bg-accent z-50"
          size="icon"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
