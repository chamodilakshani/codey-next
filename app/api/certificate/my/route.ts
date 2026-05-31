import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error("Get certificates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
