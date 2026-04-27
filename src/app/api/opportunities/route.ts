// GET  /api/opportunities  — list active opportunities (with optional matching score)
// All filters work with Prisma. Auth optional: if authenticated volunteer, applies match scoring.

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { rankOpportunities } from "@/lib/matching";
import { NextRequest, NextResponse } from "next/server";
import type { VolunteerProfileForMatch } from "@/lib/matching";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category  = searchParams.get("category");
  const city      = searchParams.get("city");
  const urgency   = searchParams.get("urgency");
  const dateFrom  = searchParams.get("dateFrom");
  const search    = searchParams.get("search");
  const isRemote  = searchParams.get("remote");
  const ranked    = searchParams.get("ranked") !== "false"; // default: apply matching

  try {
    // ── Build Prisma where clause ──────────────────────────
    const where: Record<string, unknown> = { status: "active" };

    if (category && category !== "all") where.category = category;
    if (urgency  && urgency  !== "all") where.urgency  = urgency;
    if (isRemote === "true")            where.isRemote = true;

    if (city && city !== "all") {
      where.city = { contains: city, mode: "insensitive" };
    }
    if (dateFrom) {
      where.dateStart = { gte: new Date(dateFrom) };
    }
    if (search) {
      where.OR = [
        { title:       { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { city:        { contains: search, mode: "insensitive" } },
      ];
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        ngo: { select: { fullName: true, avatarUrl: true } },
        _count: { select: { acceptances: true } },
      },
    });

    // ── Attempt to get volunteer profile for match scoring ─
    let volunteerProfile: VolunteerProfileForMatch = {
      location: "Amritsar, Punjab",
      skills: [],
      causes: [],
    };

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await prisma.profile.findUnique({
          where: { id: user.id },
          select: { location: true, skills: true, causes: true, role: true },
        });
        if (profile && profile.role === "volunteer") {
          volunteerProfile = {
            location: profile.location || "Amritsar, Punjab",
            skills: profile.skills,
            causes: profile.causes,
          };
        }
      }
    } catch {
      // Auth optional — continue without scoring adjustment
    }

    // ── Serialize Decimal fields & apply matching ──────────
    const serialized = opportunities.map((o) => ({
      id:                 o.id,
      ngo_id:             o.ngoId,
      title:              o.title,
      description:        o.description,
      category:           o.category,
      location:           o.location,
      city:               o.city,
      state:              o.state,
      is_remote:          o.isRemote,
      urgency:            o.urgency,
      required_skills:    o.requiredSkills,
      volunteers_needed:  o.volunteersNeeded,
      volunteers_accepted: o.volunteersAccepted,
      date_start:         o.dateStart?.toISOString().split("T")[0] ?? null,
      date_end:           o.dateEnd?.toISOString().split("T")[0] ?? null,
      hours_per_week:     o.hoursPerWeek ? Number(o.hoursPerWeek) : null,
      is_one_time:        o.isOneTime,
      status:             o.status,
      created_at:         o.createdAt.toISOString(),
      ngo:                o.ngo,
      // For matching
      isRemote:           o.isRemote,
      requiredSkills:     o.requiredSkills,
      volunteersNeeded:   o.volunteersNeeded,
      volunteersAccepted: o.volunteersAccepted,
    }));

    const ranked_ = ranked ? rankOpportunities(serialized, volunteerProfile) : serialized;

    return NextResponse.json({ data: ranked_, isMock: false });

  } catch (err) {
    console.error("[GET /api/opportunities] Prisma error:", err);
    // Graceful fallback to mock data
    return NextResponse.json({ data: getMockOpportunities(), isMock: true });
  }
}

// ── Mock data fallback (used when DB not yet set up) ──────────
function getMockOpportunities() {
  const raw = [
    { id: "m1", title: "Food Distribution Drive",      category: "food",        city: "Amritsar",   state: "Punjab", urgency: "high",     required_skills: ["communication","physical activity"], volunteers_needed: 15, volunteers_accepted: 7,  is_remote: false, location: "Amritsar, Punjab",  date_start: "2026-05-01", date_end: "2026-05-01", hours_per_week: 4, is_one_time: true,  status: "active" },
    { id: "m2", title: "Youth Literacy Program",       category: "education",   city: "Ludhiana",   state: "Punjab", urgency: "medium",   required_skills: ["teaching","patience"],               volunteers_needed: 8,  volunteers_accepted: 3,  is_remote: false, location: "Ludhiana, Punjab",  date_start: "2026-05-05", date_end: "2026-07-31", hours_per_week: 6, is_one_time: false, status: "active" },
    { id: "m3", title: "River Cleanup — Beas",         category: "environment", city: "Amritsar",   state: "Punjab", urgency: "medium",   required_skills: ["physical activity"],                 volunteers_needed: 20, volunteers_accepted: 11, is_remote: false, location: "Amritsar, Punjab",  date_start: "2026-05-10", date_end: "2026-05-10", hours_per_week: 5, is_one_time: true,  status: "active" },
    { id: "m4", title: "Senior Citizen Companion",     category: "elderly",     city: "Chandigarh", state: "Punjab", urgency: "low",      required_skills: ["empathy","communication"],            volunteers_needed: 5,  volunteers_accepted: 2,  is_remote: false, location: "Chandigarh",        date_start: "2026-05-01", date_end: "2026-08-31", hours_per_week: 3, is_one_time: false, status: "active" },
    { id: "m5", title: "Digital Literacy Workshop",    category: "education",   city: null,         state: null,     urgency: "medium",   required_skills: ["teaching","technology"],              volunteers_needed: 10, volunteers_accepted: 4,  is_remote: true,  location: "Remote",            date_start: "2026-05-15", date_end: "2026-06-30", hours_per_week: 4, is_one_time: false, status: "active" },
    { id: "m6", title: "Mental Health Awareness",      category: "health",      city: "Amritsar",   state: "Punjab", urgency: "high",     required_skills: ["design","empathy"],                  volunteers_needed: 6,  volunteers_accepted: 1,  is_remote: false, location: "Amritsar, Punjab",  date_start: "2026-05-20", date_end: "2026-05-25", hours_per_week: 8, is_one_time: false, status: "active" },
    { id: "m7", title: "Animal Shelter Assistant",     category: "animals",     city: "Amritsar",   state: "Punjab", urgency: "critical", required_skills: ["animal care","physical activity"],   volunteers_needed: 4,  volunteers_accepted: 0,  is_remote: false, location: "Amritsar, Punjab",  date_start: "2026-05-01", date_end: "2026-09-30", hours_per_week: 5, is_one_time: false, status: "active" },
    { id: "m8", title: "Disaster Relief — Flood Prep", category: "disaster",    city: "Pathankot",  state: "Punjab", urgency: "critical", required_skills: ["first aid","physical activity"],     volunteers_needed: 12, volunteers_accepted: 5,  is_remote: false, location: "Pathankot, Punjab", date_start: "2026-05-25", date_end: "2026-06-05", hours_per_week: 6, is_one_time: false, status: "active" },
  ];

  // Apply default matching for mock data (Amritsar profile)
  const mockProfile: VolunteerProfileForMatch = { location: "Amritsar, Punjab", skills: [], causes: [] };
  return rankOpportunities(
    raw.map((o) => ({ ...o, isRemote: o.is_remote, requiredSkills: o.required_skills, volunteersNeeded: o.volunteers_needed, volunteersAccepted: o.volunteers_accepted })),
    mockProfile
  );
}
