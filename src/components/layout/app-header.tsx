
'use client';

import React from 'react';
import { LogOut, PanelLeft, User } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import Logo from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import Avatar from '@/components/ui/avatar';
import { signOut } from '@/app/auth/actions';
import { updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [avatarKey, setAvatarKey] = React.useState<number>(() => {
    try { return Number(localStorage.getItem('avatarKey')) || 0; } catch { return 0; }
  });

  // Local app upload endpoint will store avatars under /public/uploads/avatars

  function getInitials(): string {
    if (!user) return '';
    const name = user.displayName || user.email || '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // Validate and show preview; actual upload happens on confirm
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

  const maxSize = 1 * 1024 * 1024; // 1MB
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > maxSize) {
      toast({ title: 'File too large', description: 'Please select an image under 1 MB.' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(String(reader.result || ''));
      setPendingFile(file);
    };
    reader.readAsDataURL(file);
  }

  async function confirmUpload() {
    const file = pendingFile;
    if (!file || !user) return;
    setUploading(true);
    try {
      const resizedBlob = await resizeImage(file, 256, 256);
      const uid = user.uid;
      const form = new FormData();
      form.append('file', resizedBlob, `${uid}.jpg`);
      form.append('uid', uid);
      const res = await fetch('/api/avatar', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && data.url) {
        const url = data.url;
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { photoURL: url });
          await auth.currentUser.reload();
        }
        toast({ title: 'Avatar updated', description: 'Your profile image was uploaded.' });
        setPreviewUrl(null);
        setPendingFile(null);
      } else {
        toast({ title: 'Upload failed', description: data?.error || 'Unknown error' });
      }
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err?.message || String(err) });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function cancelPreview() {
    setPreviewUrl(null);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Resize an image File to a Blob using canvas
  function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        const width = Math.round(img.width * ratio);
        const height = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Canvas is empty'));
          resolve(blob);
        }, 'image/jpeg', 0.9);
      };
      img.onerror = (e) => reject(e);
      // Read file as data URL
      const reader = new FileReader();
      reader.onload = () => {
        img.src = String(reader.result || '');
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  async function handleRemoveAvatar() {
    if (!user) return;
    try {
      // Delete from local uploads (best-effort)
      await fetch(`/api/avatar?uid=${encodeURIComponent(user.uid)}`, { method: 'DELETE' });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: null });
        await auth.currentUser.reload();
      }
      toast({ title: 'Avatar removed', description: 'Your profile image was removed.' });
    } catch (err: any) {
      toast({ title: 'Remove failed', description: err?.message || String(err) });
    }
  }

  // Development-only DOM diagnostics: logs header and ancestor sizes
  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'avatarKey') {
        setAvatarKey(Number(e.newValue || 0));
      }
    }
    window.addEventListener('storage', onStorage);
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;

    function sample() {
      const el = document.querySelector<HTMLElement>('header');
      if (!el) return console.warn('Header element not found for diagnostics');
      const rows = [];
      let node: HTMLElement | null = el;
      while (node) {
        const r = node.getBoundingClientRect();
        const s = getComputedStyle(node);
        rows.push({
          tag: node.tagName,
          id: node.id || '',
          classes: node.className || '',
          width: Math.round(r.width * 1000) / 1000,
          maxWidth: s.maxWidth,
          display: s.display,
          marginLeft: s.marginLeft,
          marginRight: s.marginRight,
          paddingLeft: s.paddingLeft,
          paddingRight: s.paddingRight,
          boxSizing: s.boxSizing,
          overflow: s.overflow,
        });
        node = node.parentElement;
      }
      // Log a table for easy inspection
      // eslint-disable-next-line no-console
      console.groupCollapsed('DOM Diagnostics: header ancestors');
      // eslint-disable-next-line no-console
      console.table(rows);
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    sample();
    window.addEventListener('resize', sample);
    return () => {
      window.removeEventListener('resize', sample);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
    await signOut(); // This clears the server-side cookie
    router.push('/');
  }

  return (
  <header className="bg-background/80 text-foreground p-4 shadow-sm fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-border backdrop-blur-sm h-16">
  <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-foreground hover:bg-background/80 md:hidden">
          <PanelLeft className="h-6 w-6" />
          <span className="sr-only">Toggle History</span>
        </Button>
          <Link href="/chat" className="flex items-center space-x-3">
            <div className="h-8 w-8 inline-flex items-center">
              <Logo size={32} className="h-8 w-8" alt="MediChat" />
            </div>
            <h1 className="text-2xl font-bold hidden sm:block">MediChat</h1>
        </Link>
      </div>
      <div className="flex items-center">
        {user && (
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
        )}
      </div>
    </header>
  );
}
