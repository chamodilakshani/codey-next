import { clerkMiddleware, clerkClient, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getRoleFromSessionClaims, getRoleFromUser } from "@/lib/clerk-role";

const isAdminRoute = createRouteMatcher(["/admin(.*)","/dashboard(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isAdminRoute(request)) {
    const { userId, sessionClaims, redirectToSignIn } = await auth();
    if (!userId) {
      return redirectToSignIn();
    }

    let role = getRoleFromSessionClaims(sessionClaims);
    if (role !== "admin") {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      role = getRoleFromUser(user);
    }

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
