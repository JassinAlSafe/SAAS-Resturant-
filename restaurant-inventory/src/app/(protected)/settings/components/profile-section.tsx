"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Save } from "lucide-react";
import Image from "next/image";
import { useProfileSettings } from "../hooks/useProfileSettings";

export function ProfileSection() {
  const { user, profile, name, setName, isLoading, handleProfileUpdate } =
    useProfileSettings();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and profile settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                suppressHydrationWarning
              />
              <p className="text-sm text-muted-foreground">
                This is the name that will be displayed on your profile and in
                communications.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
                suppressHydrationWarning
              />
              <p className="text-sm text-muted-foreground">
                Your email address is associated with your account and cannot be
                changed.
              </p>
            </div>

            <Button
              type="submit"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary" />
            Profile Picture
          </CardTitle>
          <CardDescription>Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-muted bg-muted flex items-center justify-center">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Profile"
                width={128}
                height={128}
                className="object-cover"
                priority
              />
            ) : (
              <UserCircle className="h-20 w-20 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2 text-center">
            <Button variant="outline" className="relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                suppressHydrationWarning
              />
              Upload Image
            </Button>
            <p className="text-xs text-muted-foreground">
              Supported formats: JPEG, PNG, GIF (Max 5MB)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
