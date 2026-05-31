import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Certificate code is required" }, { status: 400 });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode: code },
      include: {
        course: true,
      },
    });

    if (!certificate) {
      return NextResponse.json({ valid: false, error: "Certificate not found" }, { status: 404 });
    }

    // Get user info from Clerk for display
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const user = await client.users.getUser(certificate.userId);

    const userName = user.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user.emailAddresses[0]?.emailAddress || "Unknown";

    return NextResponse.json({
      valid: true,
      certificate: {
        id: certificate.id,
        certificateCode: certificate.certificateCode,
        issuedAt: certificate.issuedAt,
        course: {
          title: certificate.course.title,
          slug: certificate.course.slug,
        },
        recipient: {
          name: userName,
          email: user.emailAddresses[0]?.emailAddress,
        },
      },
    });
  } catch (error) {
    console.error("Certificate verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
