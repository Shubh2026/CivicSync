// GET  /api/volunteer/profile — get own profile
// PUT  /api/volunteer/profile — upsert profile fields

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: auth.userId },
      select: {
        id: true, fullName: true, email: true, avatarUrl: true, role: true,
        bio: true, location: true, phone: true, skills: true,
        availability: true, causes: true, createdAt: true,
        _count: { select: { volunteerAcceptances: true } },
      },
    });

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    return NextResponse.json({
      id:           profile.id,
      full_name:    profile.fullName,
      email:        profile.email,
      avatar_url:   profile.avatarUrl,
      role:         profile.role,
      bio:          profile.bio,
      location:     profile.location,
      phone:        profile.phone,
      skills:       profile.skills,
      availability: profile.availability,
      causes:       profile.causes,
      created_at:   profile.createdAt.toISOString(),
      total_engagements: profile._count.volunteerAcceptances,
    });

  } catch (err) {
    console.error("[GET /api/volunteer/profile]", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { fullName, bio, location, phone, skills, availability, causes, avatarUrl } = body;

  try {
    const updated = await prisma.profile.upsert({
      where: { id: auth.userId },
      create: {
        id:           auth.userId,
        email:        auth.user.email,
        fullName,
        bio,
        location,
        phone,
        skills:       Array.isArray(skills)       ? skills       : [],
        availability: Array.isArray(availability) ? availability : [],
        causes:       Array.isArray(causes)       ? causes       : [],
        avatarUrl,
      },
      update: {
        ...(fullName     !== undefined && { fullName }),
        ...(bio          !== undefined && { bio }),
        ...(location     !== undefined && { location }),
        ...(phone        !== undefined && { phone }),
        ...(skills       !== undefined && { skills: Array.isArray(skills) ? skills : [] }),
        ...(availability !== undefined && { availability: Array.isArray(availability) ? availability : [] }),
        ...(causes       !== undefined && { causes: Array.isArray(causes) ? causes : [] }),
        ...(avatarUrl    !== undefined && { avatarUrl }),
      },
    });

    return NextResponse.json({ success: true, id: updated.id });
  } catch (err) {
    console.error("[PUT /api/volunteer/profile]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
