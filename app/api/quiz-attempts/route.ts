import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");

    if (!quizId) {
      return NextResponse.json({ error: "quizId required" }, { status: 400 });
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        quizId,
      },
      include: {
        answers: {
          orderBy: { questionIndex: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ attempts });
  } catch (error) {
    console.error("Get quiz attempts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
