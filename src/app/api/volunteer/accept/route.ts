// POST /api/volunteer/accept  — volunteer accepts a request
// DELETE /api/volunteer/accept — volunteer withdraws

import { prisma } from "@/lib/prisma";
import { requireVolunteerRole } from "@/lib/auth-middleware";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const auth = await requireVolunteerRole();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => ({}));
  const { opportunityId } = body;

  if (!opportunityId) {
    return NextResponse.json({ error: "opportunityId is required" }, { status: 400 });
  }

  try {
    // ── Guard: opportunity must exist and be active ────────
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      select: { id: true, status: true, volunteersNeeded: true, volunteersAccepted: true },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }
    if (opportunity.status !== "active") {
      return NextResponse.json({ error: "Opportunity is no longer accepting volunteers" }, { status: 409 });
    }
    if (opportunity.volunteersAccepted >= opportunity.volunteersNeeded) {
      return NextResponse.json({ error: "Opportunity is already full" }, { status: 409 });
    }

    // ── Create acceptance + increment counter (transaction) ─
    const [acceptance] = await prisma.$transaction([
      prisma.volunteerAcceptance.create({
        data: {
          volunteerId:  auth.userId,
          opportunityId,
          status: "accepted",
        },
        include: {
          opportunity: { select: { title: true, category: true, location: true } },
        },
      }),
      prisma.opportunity.update({
        where: { id: opportunityId },
        data: { volunteersAccepted: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ data: acceptance }, { status: 201 });

  } catch (err: unknown) {
    // Unique constraint: already accepted
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "Already accepted this opportunity" }, { status: 409 });
    }
    console.error("[POST /api/volunteer/accept]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireVolunteerRole();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const opportunityId = searchParams.get("opportunityId");

  if (!opportunityId) {
    return NextResponse.json({ error: "opportunityId is required" }, { status: 400 });
  }

  try {
    await prisma.$transaction([
      prisma.volunteerAcceptance.delete({
        where: {
          volunteerId_opportunityId: {
            volunteerId:  auth.userId,
            opportunityId,
          },
        },
      }),
      prisma.opportunity.update({
        where: { id: opportunityId },
        data: { volunteersAccepted: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/volunteer/accept]", err);
    return NextResponse.json({ error: "Could not withdraw from opportunity" }, { status: 500 });
  }
}
