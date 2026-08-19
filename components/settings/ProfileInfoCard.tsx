"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getInitials(name: string | null | undefined, email: string | null | undefined) {
  if (name) {
    const initials = name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("");
    if (initials) return initials.toUpperCase();
  }
  return email?.[0]?.toUpperCase() ?? "U";
}

// Real data: name/email/avatar come straight from Clerk's useUser(), and
// "Save Changes" writes name via user.update() and photo via
// user.setProfileImage() — both real Clerk SDK calls, not mocks. Phone/
// location have no home in Clerk or anywhere else in the schema, so they're
// persisted through a new small route (app/api/user/profile/route.ts) that
// stores them in UserPreferences.preferences.profile — the same namespaced-
// JSON pattern app/api/jobs/preferences/route.ts already uses for
// jobDiscoveryFilters.
export default function ProfileInfoCard() {
  const { user, isLoaded } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) setFullName(user.fullName ?? "");
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (!res.ok || cancelled) return;
        setPhone(data.profile?.phone ?? "");
        setLocation(data.profile?.location ?? "");
      } catch (error) {
        console.error("Failed to load profile fields:", error);
      } finally {
        if (!cancelled) setIsLoadingProfile(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const initials = getInitials(user.fullName, email);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      await user.setProfileImage({ file });
      toast.success("Profile photo updated.");
    } catch (error) {
      console.error("Failed to update profile photo:", error);
      toast.error("Failed to update profile photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const [firstName, ...rest] = fullName.trim().split(/\s+/);
      await user.update({ firstName: firstName || "", lastName: rest.join(" ") });

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: { phone, location } }),
      });
      if (!res.ok) throw new Error("Failed to save phone/location");

      toast.success("Profile updated.");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-gray-900">Profile Photo &amp; Basic Info</h2>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center gap-2 sm:w-28">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.imageUrl} alt={user.fullName ?? "Profile"} />
            <AvatarFallback className="bg-purple-100 text-2xl font-bold text-purple-600">
              {initials}
            </AvatarFallback>
          </Avatar>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handlePhotoChange}
            disabled={isUploadingPhoto}
          />
          <button
            type="button"
            onClick={handlePhotoClick}
            disabled={isUploadingPhoto}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 disabled:opacity-50"
          >
            {isUploadingPhoto && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Change photo
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input id="email" value={email} disabled className="bg-gray-50 pr-24 text-gray-500" />
              {user.hasVerifiedEmailAddress && (
                <span className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  <Check className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={isLoadingProfile ? "Loading…" : "Add your phone number"}
              disabled={isLoadingProfile}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={isLoadingProfile ? "Loading…" : "Add your location"}
              disabled={isLoadingProfile}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving || isLoadingProfile}
          className="gap-2 bg-purple-600 text-white hover:bg-purple-700"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
