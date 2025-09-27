'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Link from 'next/link';
import Logo from '@/components/ui/logo';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function MobileNav({ isOpen, setIsOpen }: MobileNavProps) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="bg-background text-foreground">
        <SheetHeader>
          <div className="flex items-center space-x-3">
            <Link href="/" className="inline-flex items-center">
              <Logo size={28} className="h-7 w-7" alt="MediChat" />
            </Link>
            <SheetTitle className="text-xl font-bold">MediChat</SheetTitle>
          </div>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 mt-8">
          <Link href="#features" className="text-lg font-medium text-foreground hover:text-primary" onClick={() => setIsOpen(false)}>
            Features
          </Link>
          <Link href="#about" className="text-lg font-medium text-foreground hover:text-primary" onClick={() => setIsOpen(false)}>
            About
          </Link>
        </nav>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-2">
            <Button asChild variant="outline">
                <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
            </Button>
            <Button asChild>
                <Link href="/signup" onClick={() => setIsOpen(false)}>Get Started</Link>
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
