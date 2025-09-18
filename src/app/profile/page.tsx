
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

export default function ProfilePage() {
  return (
    <div className="flex-1 w-full bg-gray-100 dark:bg-gray-900">
      <div className="w-full">
        <div className="relative h-[300px] md:h-[400px]">
          <Image
            src="https://picsum.photos/seed/profile-cover/1600/400"
            alt="Profile cover"
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Hello, Guest
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
                    src="https://picsum.photos/seed/avatar/200"
                    alt="User avatar"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full border-4 border-white dark:border-gray-800 shadow-md"
                  />
                </div>
                <CardTitle className="text-2xl">Guest User</CardTitle>
                <CardDescription>New York, United States</CardDescription>
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
                  <Button variant="outline" size="sm">
                    Settings
                  </Button>
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
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue="guest.user" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="guest@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="Guest" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="User" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <Label htmlFor="address">Address</Label>
                       <Input id="address" defaultValue="123 AI Lane" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" defaultValue="New York" />
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="country">Country</Label>
                         <Input id="country" defaultValue="United States" />
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input id="postalCode" defaultValue="10001" />
                       </div>
                    </div>
                  </div>
                </div>

                 <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">
                    About Me
                  </h3>
                  <div className="space-y-2">
                     <Label htmlFor="about">About</Label>
                      <Textarea
                        id="about"
                        placeholder="A few words about you..."
                        defaultValue="A beautiful Dashboard for Next.js. It is Free and Open Source."
                      />
                  </div>
                </div>
                 <div className="flex justify-end">
                    <Button>Update Profile</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
