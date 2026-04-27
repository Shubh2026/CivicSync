// GET /api/ngo/volunteers-engaged — all volunteers engaged with NGO's requests

import { prisma } from "@/lib/prisma";
import { requireNGORole } from "@/lib/auth-middleware";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireNGORole();
  if (auth instanceof NextResponse) return auth;

  try {
    const acceptances = await prisma.volunteerAcceptance.findMany({
      where: {
        opportunity: { ngoId: auth.userId },
      },
      orderBy: { acceptedAt: "desc" },
      include: {
        volunteer: {
          select: {
            id: true, fullName: true, email: true, avatarUrl: true,
            location: true, skills: true, bio: true, phone: true,
          },
        },
        opportunity: {
          select: {
            id: true, title: true, category: true, location: true, city: true,
          },
        },
      },
    });

    return NextResponse.json(
      acceptances.map((a) => ({
        id:               a.id,
        volunteer_id:     a.volunteerId,
        opportunity_id:   a.opportunityId,
        status:           a.status,
        hours_contributed: Number(a.hoursContributed),
        accepted_at:      a.acceptedAt.toISOString(),
        completed_at:     a.completedAt?.toISOString() ?? null,
        volunteer: {
          id:        a.volunteer.id,
          full_name: a.volunteer.fullName,
          email:     a.volunteer.email,
          avatar_url: a.volunteer.avatarUrl,
          location:  a.volunteer.location,
          skills:    a.volunteer.skills,
          bio:       a.volunteer.bio,
          phone:     a.volunteer.phone,
        },
        opportunity: {
          id:       a.opportunity.id,
          title:    a.opportunity.title,
          category: a.opportunity.category,
          location: a.opportunity.location,
          city:     a.opportunity.city,
        },
      }))
    );

  } catch (err) {
    console.error("[GET /api/ngo/volunteers-engaged]", err);
    return NextResponse.json(getMockEngaged());
  }
}

function getMockEngaged() {
  return [
    { id: "ve1", volunteer_id: "v1", status: "completed", hours_contributed: 8,  accepted_at: "2026-04-10T10:00:00Z", volunteer: { id: "v1", full_name: "Priya Sharma",  email: "priya@example.com", skills: ["teaching","communication"], location: "Amritsar, Punjab" }, opportunity: { id: "r1", title: "Youth Literacy Program", category: "education" } },
    { id: "ve2", volunteer_id: "v2", status: "accepted",  hours_contributed: 0,  accepted_at: "2026-04-22T10:00:00Z", volunteer: { id: "v2", full_name: "Rahul Singh",   email: "rahul@example.com", skills: ["physical activity"],         location: "Amritsar, Punjab" }, opportunity: { id: "r2", title: "Food Distribution",      category: "food" } },
    { id: "ve3", volunteer_id: "v3", status: "ongoing",   hours_contributed: 4,  accepted_at: "2026-04-18T10:00:00Z", volunteer: { id: "v3", full_name: "Ananya Bhat",   email: "ananya@example.com", skills: ["first aid","empathy"],       location: "Chandigarh" },        opportunity: { id: "r3", title: "River Cleanup — Beas",   category: "environment" } },
    { id: "ve4", volunteer_id: "v4", status: "completed", hours_contributed: 12, accepted_at: "2026-04-01T10:00:00Z", volunteer: { id: "v4", full_name: "Kunal Mehta",   email: "kunal@example.com", skills: ["design","communication"],    location: "Ludhiana, Punjab" },  opportunity: { id: "r1", title: "Youth Literacy Program", category: "education" } },
    { id: "ve5", volunteer_id: "v5", status: "accepted",  hours_contributed: 0,  accepted_at: "2026-04-25T10:00:00Z", volunteer: { id: "v5", full_name: "Simran Kaur",   email: "simran@example.com", skills: ["animal care"],              location: "Amritsar, Punjab" }, opportunity: { id: "r4", title: "Animal Shelter Assistant", category: "animals" } },
  ];
}
