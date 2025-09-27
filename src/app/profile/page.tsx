"use client";

import Image from 'next/image';
import Avatar from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useTransition, useRef } from 'react';
import { getProfile, updateProfile } from '../actions';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { updateProfile as updateAuthProfile } from 'firebase/auth';

type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [avatarKey, setAvatarKey] = useState<number>(0);


  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      const userProfile = await getProfile();
      if (userProfile) {
        setProfile(userProfile);
        setName(userProfile.name || '');
        setEmail(userProfile.email || '');
      }
      setIsLoading(false);
    }
    fetchProfile();
  }, [])

  function getInitials(): string {
    if (!authUser && !profile) return '';
    const name = profile?.name || authUser?.displayName || authUser?.email || '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !authUser) return;

  const maxSize = 1 * 1024 * 1024; // 1MB
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.' });
      if (e.currentTarget) e.currentTarget.value = '';
      return;
    }
    if (file.size > maxSize) {
      toast({ title: 'File too large', description: 'Please select an image under 1 MB.' });
      if (e.currentTarget) e.currentTarget.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(String(reader.result || ''));
      setPendingFile(file);
    };
    reader.readAsDataURL(file);
  }

  // Resize an image File to a Blob using canvas
  function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
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
  img.onerror = (e: any) => reject(e);
      // Read file as data URL
      const reader = new FileReader();
      reader.onload = () => {
        img.src = String(reader.result || '');
      };
  reader.onerror = (e: any) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  async function confirmUpload() {
    const file = pendingFile;
    if (!file || !authUser) return;
    setUploading(true);
    try {
      const resizedBlob = await resizeImage(file, 256, 256);
      const uid = authUser.uid;
      const form = new FormData();
      form.append('file', resizedBlob, `${uid}.jpg`);
      form.append('uid', uid);
      const res = await fetch('/api/avatar', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && data.url) {
        const url = data.url;
        if (auth.currentUser) {
          await updateAuthProfile(auth.currentUser, { photoURL: url });
          await auth.currentUser.reload();
        }
  // bump avatar key to bust caches and re-render across tabs/components
  const key = Date.now();
  setAvatarKey(key);
  try { localStorage.setItem('avatarKey', String(key)); } catch {}
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
      // clear file input if we had a ref
      const el = document.querySelector<HTMLInputElement>('input[data-profile-file]');
      if (el) el.value = '';
    }
  }

  function cancelPreview() {
    setPreviewUrl(null);
    setPendingFile(null);
    const el = document.querySelector<HTMLInputElement>('input[data-profile-file]');
    if (el) el.value = '';
  }

  async function handleRemoveAvatar() {
    if (!authUser) return;
    try {
      await fetch(`/api/avatar?uid=${encodeURIComponent(authUser.uid)}`, { method: 'DELETE' });
        if (auth.currentUser) {
        await updateAuthProfile(auth.currentUser, { photoURL: null });
        await auth.currentUser.reload();
        const key = Date.now();
        setAvatarKey(key);
        try { localStorage.setItem('avatarKey', String(key)); } catch {}
      }
      toast({ title: 'Avatar removed', description: 'Your profile image was removed.' });
    } catch (err: any) {
      toast({ title: 'Remove failed', description: err?.message || String(err) });
    }
  }

  const handleUpdateProfile = () => {
    startTransition(async () => {
      await updateProfile(name);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    });
  };

  if(isLoading) {
    return (
        <div className="flex-1 w-full flex items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if(!profile) {
    return (
        <div className="flex-1 w-full flex items-center justify-center bg-background">
            <p className="text-muted-foreground">Could not load profile. Please try again later.</p>
        </div>
    )
  }

  return (
  <div className="flex-1 w-full bg-background overflow-y-auto">
      <div className="w-full">
        <div className="relative h-[250px] md:h-[300px]">
          <Image
            src="https://picsum.photos/seed/profile-cover/1600/400"
            alt="Profile cover"
            fill={true}
            style={{objectFit: 'cover'}}
            className="rounded-t-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background)/0.9)]/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Hello, {name}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              This is your profile page. You can view and manage your personal
              details here.
            </p>
          </div>
        </div>

        <div className="p-4 md:p-8 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="relative w-32 h-32 mx-auto -mt-16 mb-4">
                  {authUser?.photoURL ? (
                    <Avatar src={authUser.photoURL} name={profile?.name || authUser?.displayName || authUser?.email || ''} size={128} className="rounded-full border-4 border-border shadow-md" />
                  ) : (
                    <div className="w-32 h-32 rounded-full mx-auto -mt-16 mb-4 flex items-center justify-center bg-secondary text-secondary-foreground text-2xl font-bold border-4 border-border shadow-md">
                      {(() => {
                        const display = profile?.name || authUser?.displayName || authUser?.email || '';
                        const parts = display.trim().split(/\s+/).filter(Boolean);
                        if (parts.length === 0) return '';
                        if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
                        return (parts[0][0] + parts[1][0]).toUpperCase();
                      })()}
                    </div>
                  )}
                  <input
                    data-profile-file
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <CardTitle className="text-2xl">{name}</CardTitle>
                <CardDescription>{email}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {previewUrl ? (
                  <div className="p-3">
                    <div className="flex items-center gap-3 justify-center">
                      <img src={previewUrl} alt="preview" className="h-24 w-24 rounded-full object-cover" />
                      <div className="flex flex-col">
                        <span className="font-medium">Preview</span>
                        <span className="text-xs text-muted-foreground">Confirm to upload</span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-center gap-2">
                      <Button onClick={confirmUpload} disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                      <Button variant="ghost" onClick={cancelPreview}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      An AI enthusiast exploring the world of conversational interfaces
                      and medical technology.
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <Button onClick={() => { const el = document.querySelector<HTMLInputElement>('input[data-profile-file]'); el?.click(); }}>
                        Update avatar
                      </Button>
                      <Button variant="ghost" onClick={handleRemoveAvatar}>
                        Remove avatar
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Account</CardTitle>
                </div>
                <CardDescription>
                  Update your personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">
                    User Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" value={name} onChange={(e) => setName(e.target.value)} disabled={isPending}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} disabled />
                    </div>
                  </div>
                </div>

                 <div className="flex justify-end">
                    <Button onClick={handleUpdateProfile} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Profile
                    </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
