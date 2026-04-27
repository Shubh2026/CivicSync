// GET /api/ngo/requests/[id]/volunteers — volunteers on a specific request

import { prisma } from "@/lib/prisma";
import { requireNGORole } from "@/lib/auth-middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireNGORole();
  if (auth instanceof NextResponse) return auth;

  const { id: opportunityId } = await params;

  try {
    // Guard: opportunity must belong to this NGO
    const opportunity = await prisma.opportunity.findFirst({
      where: { id: opportunityId, ngoId: auth.userId },
      select: { id: true, title: true, volunteersNeeded: true, volunteersAccepted: true },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    const acceptances = await prisma.volunteerAcceptance.findMany({
      where: { opportunityId },
      orderBy: { acceptedAt: "desc" },
      include: {
        volunteer: {
          select: {
            id: true, fullName: true, email: true, avatarUrl: true,
            location: true, bio: true, skills: true, phone: true,
          },
        },
      },
    });

    const data = acceptances.map((a) => ({
      id:               a.id,
      status:           a.status,
      hours_contributed: Number(a.hoursContributed),
      feedback:         a.feedback,
      rating:           a.rating,
      accepted_at:      a.acceptedAt.toISOString(),
      completed_at:     a.completedAt?.toISOString() ?? null,
      volunteer: {
        id:        a.volunteer.id,
        full_name: a.volunteer.fullName,
        email:     a.volunteer.email,
        avatar_url: a.volunteer.avatarUrl,
        location:  a.volunteer.location,
        bio:       a.volunteer.bio,
        skills:    a.volunteer.skills,
        phone:     a.volunteer.phone,
      },
    }));

    return NextResponse.json({
      data,
      opportunity: {
        id:                 opportunity.id,
        title:              opportunity.title,
        volunteers_needed:  opportunity.volunteersNeeded,
        volunteers_accepted: opportunity.volunteersAccepted,
      },
    });

  } catch (err) {
    console.error("[GET /api/ngo/requests/[id]/volunteers]", err);
    return NextResponse.json({ data: [], isMock: true });
  }
}
