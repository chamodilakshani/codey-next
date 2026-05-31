"use client";

import { useEffect, useState } from "react";
import { updateUserProfile } from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Loader2, Edit2, Camera, Smile } from "lucide-react";
import { toast } from "sonner";

interface EditProfileModalProps {
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  onUpdate?: () => void;
}

export function EditProfileModal({ firstName, lastName, imageUrl, onUpdate }: EditProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(imageUrl || "");
  const [formData, setFormData] = useState({
    firstName: firstName || "",
    lastName: lastName || "",
    imageUrl: imageUrl || "",
  });

  useEffect(() => {
    let objectUrl: string | undefined;

    if (selectedFile) {
      objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(formData.imageUrl || "");
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedFile, formData.imageUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "imageUrl") {
      setSelectedFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = new FormData();
      payload.append("firstName", formData.firstName);
      payload.append("lastName", formData.lastName);

      if (selectedFile) {
        payload.append("imageFile", selectedFile);
      } else if (formData.imageUrl) {
        payload.append("imageUrl", formData.imageUrl);
      }

      const result = await updateUserProfile(payload);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated successfully!");
        setIsOpen(false);
        onUpdate?.();
        window.location.reload();
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="lg"
          className="rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-400 text-white shadow-xl shadow-fuchsia-200/40 hover:scale-105 transition-transform"
        >
          <Edit2 className="h-4 w-4" />
          Edit Profile
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[480px] rounded-[2rem] border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-pink-50 p-6 shadow-2xl">
        <SheetHeader>
          <SheetTitle className="text-2xl tracking-tight text-slate-900">
            Personalize your profile
          </SheetTitle>
          <SheetDescription className="text-sm text-slate-600">
            Add your name and upload a fun picture from your device.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-semibold text-slate-900">
                First Name
              </label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Your first name"
                required
                className="bg-white shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-semibold text-slate-900">
                Last Name
              </label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Your last name"
                className="bg-white shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center gap-3 text-slate-800">
              <Camera className="h-5 w-5 text-fuchsia-500" />
              <p className="font-semibold">Choose a profile picture</p>
            </div>
            <div className="grid gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file:rounded-full file:border-0 file:bg-fuchsia-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:hover:bg-fuchsia-600"
              />
              <div className="text-sm text-slate-500">Or paste a picture link below:</div>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/cool-photo.jpg"
                className="bg-white shadow-sm"
              />
            </div>
          </div>

          {previewUrl ? (
            <div className="flex items-center gap-4 rounded-3xl border border-fuchsia-200 bg-fuchsia-50 p-4 shadow-sm">
              <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-white shadow-sm">
                <img src={previewUrl} alt="Selected profile pic" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Preview</p>
                <p className="text-sm text-slate-600">Your picture will appear here after saving.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-500">
              Pick a photo from your device or use a picture link above.
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <SheetClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Saving..." : "Save for adventure"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
