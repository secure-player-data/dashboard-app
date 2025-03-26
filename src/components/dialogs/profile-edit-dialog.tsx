import type React from 'react';

import { useState, useRef } from 'react';
import { Button, ButtonWithLoader } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';
import { Profile } from '@/entities/data/profile';
import { Session } from '@inrupt/solid-client-authn-browser';
import { toast } from 'sonner';
import { useUpdateAppProfile } from '@/use-cases/profile';

interface ProfileEditDialogProps {
  session: Session;
  pod: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

export function ProfileEditDialog({
  session,
  pod,
  open,
  onOpenChange,
  profile,
}: ProfileEditDialogProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    profile.picture || undefined
  );
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfileMutation = useUpdateAppProfile(session, pod);

  const handleSave = async () => {
    updateProfileMutation.mutate(
      { name, email, picture: avatarFile },
      {
        onError: (error) => {
          toast.error(`Could not save changes: ${error.message}`);
        },
        onSuccess: () => {
          onOpenChange(false);
          toast('Profile updated!');
        },
      }
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Edit your profile information</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar
              className="h-24 w-24 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <AvatarImage src={avatarPreview} />
              <AvatarFallback className="text-lg">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="flex gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Upload Photo
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <ButtonWithLoader
            onClick={handleSave}
            isLoading={updateProfileMutation.isPending}
          >
            Save changes
          </ButtonWithLoader>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
