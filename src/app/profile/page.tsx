'use client';

import Image from 'next/image';
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
import { useEffect, useState, useTransition } from 'react';
import { getProfile, updateProfile } from '../actions';
import { Loader2 } from 'lucide-react';

type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();


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
        <div className="flex-1 w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if(!profile) {
    return (
        <div className="flex-1 w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <p>Could not load profile. Please try again later.</p>
        </div>
    )
  }

  return (
    <div className="flex-1 w-full bg-gray-100 dark:bg-gray-900 overflow-y-auto">
      <div className="w-full">
        <div className="relative h-[250px] md:h-[300px]">
          <Image
            src="https://picsum.photos/seed/profile-cover/1600/400"
            alt="Profile cover"
            fill={true}
            style={{objectFit: 'cover'}}
            className="rounded-t-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Hello, {name}
            </h1>
            <p className="text-white/90 mt-2 max-w-2xl">
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
                  <Image
                    src={`https://i.pravatar.cc/150?u=${profile.id}`}
                    alt="User avatar"
                    fill={true}
                    style={{objectFit: 'cover'}}
                    className="rounded-full border-4 border-white dark:border-gray-800 shadow-md"
                  />
                </div>
                <CardTitle className="text-2xl">{name}</CardTitle>
                <CardDescription>{email}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  An AI enthusiast exploring the world of conversational interfaces
                  and medical technology.
                </p>
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
