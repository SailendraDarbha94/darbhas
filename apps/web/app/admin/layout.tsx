"use client";

import Link from "next/link";
import { SessionProvider, useSession } from "./session";
import { LoginForm } from "./login-form";

function Chrome({ children }: { children: React.ReactNode }) {
  const { session, loading, signOut, me } = useSession();
  const isAdmin = me?.role === "admin";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#7d7468]">
        Loading&hellip;
      </div>
    );
  }

  if (!session) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-[#2b2620]">
      <nav className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4">
          <span className="font-[family-name:var(--font-serif)] text-lg font-semibold">
            Darbha Studio
          </span>
          <Link href="/admin" className="text-sm hover:text-[#b0713b]">
            Overview
          </Link>
          <Link href="/admin/works" className="text-sm hover:text-[#b0713b]">
            Works
          </Link>
          <Link href="/admin/site" className="text-sm hover:text-[#b0713b]">
            My Site
          </Link>
          {isAdmin ? (
            <>
              <Link href="/admin/applications" className="text-sm hover:text-[#b0713b]">
                Applications
              </Link>
              <Link href="/admin/tenants" className="text-sm hover:text-[#b0713b]">
                Sites
              </Link>
            </>
          ) : null}
          <button
            onClick={() => void signOut()}
            className="ml-auto text-sm text-[#7d7468] hover:text-[#2b2620]"
          >
            Sign out
          </button>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Chrome>{children}</Chrome>
    </SessionProvider>
  );
}
