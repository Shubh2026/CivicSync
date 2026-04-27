import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

export interface AuthContext {
  user: User;
  userId: string;
}

// ── requireAuth ───────────────────────────────────────────────
// Validates the Supabase JWT from cookies.
// Returns { user, userId } if authenticated, or a 401 NextResponse.
// Usage in route handlers:
//   const auth = await requireAuth();
//   if (auth instanceof NextResponse) return auth;
//   const { userId } = auth;

export async function requireAuth(): Promise<AuthContext | NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "Unauthorized — please sign in" },
      { status: 401 }
    );
  }

  return { user, userId: user.id };
}

// ── requireNGORole ────────────────────────────────────────────
// Validates auth AND confirms role === 'ngo' via the profiles table.
// Import prisma inside to avoid circular deps.

export async function requireNGORole(): Promise<(AuthContext & { role: string }) | NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const { prisma } = await import("@/lib/prisma");
  const profile = await prisma.profile.findUnique({
    where: { id: authResult.userId },
    select: { role: true },
  });

  if (!profile || profile.role !== "ngo") {
    return NextResponse.json(
      { error: "Forbidden — NGO role required" },
      { status: 403 }
    );
  }

  return { ...authResult, role: "ngo" };
}

// ── requireVolunteerRole ──────────────────────────────────────
// Validates auth AND confirms role === 'volunteer'.

export async function requireVolunteerRole(): Promise<(AuthContext & { role: string }) | NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const { prisma } = await import("@/lib/prisma");
  const profile = await prisma.profile.findUnique({
    where: { id: authResult.userId },
    select: { role: true },
  });

  if (!profile || profile.role !== "volunteer") {
    return NextResponse.json(
      { error: "Forbidden — Volunteer role required" },
      { status: 403 }
    );
  }

  return { ...authResult, role: "volunteer" };
}
