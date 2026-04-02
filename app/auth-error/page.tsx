import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There is a problem with the server authentication setup. Please try again later.",
  AccessDenied: "Access was denied. You may not have permission to sign in.",
  Verification: "The sign-in link has expired or was already used. Please try again.",
  Default: "Something went wrong during sign-in. Please try again.",
};

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AuthErrorPage({ searchParams }: Props) {
  const params = await searchParams;
  const errorCode = params?.error || "Default";
  const message = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.Default;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-hero items-center px-6 py-16 md:px-10">
      <section className="card-soft mx-auto w-full max-w-xl p-8 text-center md:p-12">
        <AlertTriangle className="mx-auto h-8 w-8 text-[var(--accent)]" />
        <h1 className="mt-4 text-2xl font-bold text-[var(--text)]">Sign-in problem</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{message}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button>Try signing in again</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost">Go to homepage</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
