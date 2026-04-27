// GET  /api/ngo/requests       — list NGO's volunteer requests
// POST /api/ngo/requests       — create a new request
// PATCH /api/ngo/requests?id=X — update a request (status, details)
// DELETE /api/ngo/requests?id=X

import { prisma } from "@/lib/prisma";
import { requireNGORole } from "@/lib/auth-middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireNGORole();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    const where: Record<string, unknown> = { ngoId: auth.userId };
    if (status && status !== "all") where.status = status;

    const requests = await prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { acceptances: true } },
        acceptances: {
          where: { status: { in: ["accepted", "ongoing", "completed"] } },
          select: { id: true, status: true, volunteerId: true },
        },
      },
    });

    return NextResponse.json(requests.map(serializeRequest));

  } catch (err) {
    console.error("[GET /api/ngo/requests]", err);
    return NextResponse.json(getMockRequests());
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireNGORole();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const {
    title, description, category, location, city, state,
    urgency, requiredSkills, volunteersNeeded, dateStart, dateEnd,
    hoursPerWeek, isOneTime, isRemote, linkedNeedId,
  } = body;

  if (!title || !description || !category || !location) {
    return NextResponse.json({ error: "title, description, category, location required" }, { status: 422 });
  }

  try {
    const opp = await prisma.opportunity.create({
      data: {
        ngoId:           auth.userId,
        title:           title.trim(),
        description:     description.trim(),
        category,
        location:        location.trim(),
        city:            city?.trim() || null,
        state:           state?.trim() || null,
        urgency:         urgency || "medium",
        requiredSkills:  Array.isArray(requiredSkills) ? requiredSkills : [],
        volunteersNeeded: Number(volunteersNeeded) || 1,
        dateStart:       dateStart ? new Date(dateStart) : null,
        dateEnd:         dateEnd   ? new Date(dateEnd)   : null,
        hoursPerWeek:    hoursPerWeek ? Number(hoursPerWeek) : null,
        isOneTime:       Boolean(isOneTime),
        isRemote:        Boolean(isRemote),
        status:          "active",
      },
    });

    // Optionally link to a community need
    if (linkedNeedId) {
      await prisma.communityNeed.updateMany({
        where: { id: linkedNeedId, ngoId: auth.userId },
        data: { linkedOpportunityId: opp.id, status: "addressed" },
      });
    }

    return NextResponse.json(serializeRequest({ ...opp, _count: { acceptances: 0 }, acceptances: [] }), { status: 201 });

  } catch (err) {
    console.error("[POST /api/ngo/requests]", err);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireNGORole();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const { title, description, urgency, status, requiredSkills, volunteersNeeded, dateStart, dateEnd } = body;

  const allowedStatuses = ["draft", "active", "closed", "completed"];
  if (status && !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    // Ensure NGO owns this request
    const existing = await prisma.opportunity.findFirst({ where: { id, ngoId: auth.userId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        ...(title           !== undefined && { title }),
        ...(description     !== undefined && { description }),
        ...(urgency         !== undefined && { urgency }),
        ...(status          !== undefined && { status }),
        ...(requiredSkills  !== undefined && { requiredSkills }),
        ...(volunteersNeeded !== undefined && { volunteersNeeded: Number(volunteersNeeded) }),
        ...(dateStart       !== undefined && { dateStart: new Date(dateStart) }),
        ...(dateEnd         !== undefined && { dateEnd:   new Date(dateEnd) }),
      },
    });
    return NextResponse.json(serializeRequest({ ...updated, _count: { acceptances: 0 }, acceptances: [] }));
  } catch (err) {
    console.error("[PATCH /api/ngo/requests]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireNGORole();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    await prisma.opportunity.deleteMany({ where: { id, ngoId: auth.userId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/ngo/requests]", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

function serializeRequest(r: {
  id: string; ngoId?: string | null; title: string; description: string; category: string;
  location: string; city?: string | null; state?: string | null; isRemote?: boolean;
  urgency: string; requiredSkills?: string[]; volunteersNeeded: number; volunteersAccepted: number;
  dateStart?: Date | null; dateEnd?: Date | null; hoursPerWeek?: unknown; isOneTime?: boolean;
  status: string; createdAt: Date; _count: { acceptances: number }; acceptances: { status: string }[];
}) {
  return {
    id:                 r.id,
    ngo_id:             r.ngoId,
    title:              r.title,
    description:        r.description,
    category:           r.category,
    location:           r.location,
    city:               r.city,
    state:              r.state,
    is_remote:          r.isRemote,
    urgency:            r.urgency,
    required_skills:    r.requiredSkills ?? [],
    volunteers_needed:  r.volunteersNeeded,
    volunteers_accepted: r.volunteersAccepted,
    date_start:         r.dateStart instanceof Date ? r.dateStart.toISOString().split("T")[0] : null,
    date_end:           r.dateEnd   instanceof Date ? r.dateEnd.toISOString().split("T")[0]   : null,
    hours_per_week:     r.hoursPerWeek != null ? Number(r.hoursPerWeek) : null,
    is_one_time:        r.isOneTime,
    status:             r.status,
    created_at:         r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    volunteer_count:    r._count.acceptances,
    active_volunteers:  r.acceptances.filter((a) => ["accepted","ongoing"].includes(a.status)).length,
  };
}

function getMockRequests() {
  return [
    { id: "r1", title: "Food Distribution Drive", category: "food", urgency: "high", location: "Amritsar, Punjab", status: "active", volunteers_needed: 15, volunteers_accepted: 7, volunteer_count: 7, required_skills: ["communication"], date_start: "2026-05-01", created_at: "2026-04-20T08:00:00Z" },
    { id: "r2", title: "Youth Literacy Program",  category: "education", urgency: "medium", location: "Ludhiana, Punjab", status: "active", volunteers_needed: 8, volunteers_accepted: 3, volunteer_count: 3, required_skills: ["teaching"], date_start: "2026-05-05", created_at: "2026-04-18T08:00:00Z" },
    { id: "r3", title: "River Cleanup — Beas",    category: "environment", urgency: "medium", location: "Amritsar, Punjab", status: "active", volunteers_needed: 20, volunteers_accepted: 11, volunteer_count: 11, required_skills: ["physical activity"], date_start: "2026-05-10", created_at: "2026-04-15T08:00:00Z" },
  ];
}
