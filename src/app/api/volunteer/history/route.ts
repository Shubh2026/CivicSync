// GET  /api/volunteer/history — fetch volunteer's acceptance history with stats
// PATCH /api/volunteer/history?id=<acceptanceId> — update status/hours/feedback

import { prisma } from "@/lib/prisma";
import { requireVolunteerRole } from "@/lib/auth-middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireVolunteerRole();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    const where: Record<string, unknown> = { volunteerId: auth.userId };
    if (status && status !== "all") where.status = status;

    const acceptances = await prisma.volunteerAcceptance.findMany({
      where,
      orderBy: { acceptedAt: "desc" },
      include: {
        opportunity: {
          select: {
            id: true, title: true, description: true, category: true,
            location: true, city: true, urgency: true, dateStart: true,
            dateEnd: true, isOneTime: true, status: true,
            ngo: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    const serialized = acceptances.map((a) => ({
      id:                a.id,
      status:            a.status,
      hours_contributed: Number(a.hoursContributed),
      feedback:          a.feedback,
      rating:            a.rating,
      accepted_at:       a.acceptedAt.toISOString(),
      completed_at:      a.completedAt?.toISOString() ?? null,
      opportunity: {
        id:          a.opportunity.id,
        title:       a.opportunity.title,
        description: a.opportunity.description,
        category:    a.opportunity.category,
        location:    a.opportunity.location,
        city:        a.opportunity.city,
        urgency:     a.opportunity.urgency,
        date_start:  a.opportunity.dateStart?.toISOString().split("T")[0] ?? null,
        date_end:    a.opportunity.dateEnd?.toISOString().split("T")[0] ?? null,
        is_one_time: a.opportunity.isOneTime,
        status:      a.opportunity.status,
        ngo:         a.opportunity.ngo,
      },
    }));

    const totalHours     = acceptances.reduce((s, a) => s + Number(a.hoursContributed), 0);
    const totalCompleted = acceptances.filter((a) => a.status === "completed").length;
    const totalActive    = acceptances.filter((a) => ["accepted", "ongoing"].includes(a.status)).length;

    return NextResponse.json({
      data: serialized,
      stats: { total: acceptances.length, active: totalActive, completed: totalCompleted, totalHours },
    });

  } catch (err) {
    console.error("[GET /api/volunteer/history]", err);
    // Graceful mock fallback
    return NextResponse.json({ data: getMockHistory(), stats: { total: 5, active: 2, completed: 3, totalHours: 42 }, isMock: true });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireVolunteerRole();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Acceptance ID is required" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const { status, hoursContributed, feedback, rating } = body;

  const allowedStatuses = ["accepted", "ongoing", "completed", "cancelled"];
  if (status && !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const existing = await prisma.volunteerAcceptance.findFirst({ where: { id, volunteerId: auth.userId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.volunteerAcceptance.update({
      where: { id },
      data: {
        ...(status           !== undefined && { status }),
        ...(hoursContributed !== undefined && { hoursContributed }),
        ...(feedback         !== undefined && { feedback }),
        ...(rating           !== undefined && { rating }),
        ...(status === "completed"         && { completedAt: new Date() }),
      },
    });
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("[PATCH /api/volunteer/history]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

function getMockHistory() {
  return [
    { id: "h1", status: "completed", hours_contributed: 8,  rating: 5, accepted_at: "2026-03-15T10:00:00Z", completed_at: "2026-03-15T18:00:00Z", opportunity: { id: "o1", title: "Winter Blanket Distribution",  category: "food",        location: "Amritsar, Punjab",  date_start: "2026-03-15" } },
    { id: "h2", status: "completed", hours_contributed: 12, rating: 4, accepted_at: "2026-03-20T09:00:00Z", completed_at: "2026-04-05T17:00:00Z", opportunity: { id: "o2", title: "School Book Drive",             category: "education",   location: "Ludhiana, Punjab",  date_start: "2026-03-20" } },
    { id: "h3", status: "ongoing",   hours_contributed: 6,  rating: null, accepted_at: "2026-04-10T10:00:00Z", completed_at: null,                  opportunity: { id: "o3", title: "Youth Literacy Program",       category: "education",   location: "Ludhiana, Punjab",  date_start: "2026-04-10" } },
    { id: "h4", status: "accepted",  hours_contributed: 0,  rating: null, accepted_at: "2026-04-25T10:00:00Z", completed_at: null,                  opportunity: { id: "o4", title: "River Cleanup — Beas",         category: "environment", location: "Amritsar, Punjab",  date_start: "2026-05-10" } },
    { id: "h5", status: "completed", hours_contributed: 16, rating: 5, accepted_at: "2026-02-01T10:00:00Z", completed_at: "2026-02-28T17:00:00Z", opportunity: { id: "o5", title: "Health Camp — Rural Villages",  category: "health",      location: "Pathankot, Punjab", date_start: "2026-02-01" } },
  ];
}
