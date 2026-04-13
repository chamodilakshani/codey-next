import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-12">
      <SignIn forceRedirectUrl="/dashboard" />
    </main>
  );
}
