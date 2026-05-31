"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

async function fileToDataUrl(file: File) {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${file.type || "image/png"};base64,${base64}`;
}

export async function updateUserProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const firstName = (formData.get("firstName") as string)?.trim() || "";
  const lastName = (formData.get("lastName") as string)?.trim() || undefined;
  const imageUrlText = (formData.get("imageUrl") as string)?.trim();
  const imageFile = formData.get("imageFile") as File | null;

  if (!firstName) {
    return { error: "First name is required" };
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    let imageUrl: string | undefined;

    if (imageFile && imageFile.size > 0) {
      imageUrl = await fileToDataUrl(imageFile);
    } else if (imageUrlText) {
      imageUrl = imageUrlText;
    }

    const updatedUser = await client.users.updateUser(userId, {
      firstName,
      lastName,
    });

    const email =
      user.emailAddresses?.[0]?.emailAddress ??
      (user.primaryEmailAddress as { emailAddress?: string })?.emailAddress;
    const name = [firstName, lastName].filter(Boolean).join(" ") || undefined;

    if (email) {
      await prisma.user.upsert({
        where: { email },
        update: {
          name,
          imageUrl: imageUrl || undefined,
        },
        create: {
          email,
          name,
          imageUrl: imageUrl || undefined,
        },
      });
    }

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile. Please try again." };
  }
}
