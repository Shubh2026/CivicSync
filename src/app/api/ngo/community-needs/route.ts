// GET  /api/ngo/community-needs  — list NGO's community needs
// POST /api/ngo/community-needs  — create a new community need

import { prisma } from "@/lib/prisma";
import { requireNGORole } from "@/lib/auth-middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireNGORole();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const status   = searchParams.get("status");
  const category = searchParams.get("category");

  try {
    const where: Record<string, unknown> = { ngoId: auth.userId };
    if (status   && status   !== "all") where.status   = status;
    if (category && category !== "all") where.category = category;

    const needs = await prisma.communityNeed.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        linkedOpportunity: { select: { id: true, title: true, status: true } },
      },
    });

    return NextResponse.json(needs.map(serialize));

  } catch (err) {
    console.error("[GET /api/ngo/community-needs]", err);
    return NextResponse.json(getMockNeeds(), { headers: { "X-Mock": "true" } });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireNGORole();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const { title, description, category, location, city, state, urgency, beneficiaries, source } = body;

  if (!title || !description || !category || !location) {
    return NextResponse.json({ error: "title, description, category, location are required" }, { status: 422 });
  }

  try {
    const need = await prisma.communityNeed.create({
      data: {
        ngoId:        auth.userId,
        title:        title.trim(),
        description:  description.trim(),
        category,
        location:     location.trim(),
        city:         city?.trim() || null,
        state:        state?.trim() || null,
        urgency:      urgency || "medium",
        beneficiaries: beneficiaries ? Number(beneficiaries) : null,
        source:       source || "manual",
      },
    });
    return NextResponse.json(serialize(need), { status: 201 });
  } catch (err) {
    console.error("[POST /api/ngo/community-needs]", err);
    return NextResponse.json({ error: "Failed to create community need" }, { status: 500 });
  }
}

// ── CSV bulk import ───────────────────────────────────────────
// POST /api/ngo/community-needs?bulk=true — body: array of need objects

export async function PUT(request: NextRequest) {
  const auth = await requireNGORole();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => null);
  if (!Array.isArray(body)) return NextResponse.json({ error: "Expected an array" }, { status: 400 });

  try {
    const created = await prisma.communityNeed.createMany({
      data: body.map((n) => ({
        ngoId:        auth.userId,
        title:        (n.title || "Untitled").trim(),
        description:  (n.description || "").trim(),
        category:     n.category || "other",
        location:     (n.location || "Unknown").trim(),
        city:         n.city?.trim() || null,
        state:        n.state?.trim() || null,
        urgency:      n.urgency || "medium",
        beneficiaries: n.beneficiaries ? Number(n.beneficiaries) : null,
        source:       "csv",
      })),
      skipDuplicates: true,
    });
    return NextResponse.json({ count: created.count, inserted: created.count });
  } catch (err) {
    console.error("[PUT /api/ngo/community-needs bulk]", err);
    return NextResponse.json({ error: "Bulk import failed" }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const auth = await requireNGORole();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  try {
    await prisma.communityNeed.deleteMany({ where: { id, ngoId: auth.userId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/ngo/community-needs]", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

function serialize(n: ReturnType<typeof Object.assign>) {
  return {
    id:            n.id,
    ngo_id:        n.ngoId,
    title:         n.title,
    description:   n.description,
    category:      n.category,
    location:      n.location,
    city:          n.city,
    state:         n.state,
    urgency:       n.urgency,
    beneficiaries: n.beneficiaries,
    image_urls:    n.imageUrls ?? [],
    status:        n.status,
    source:        n.source,
    created_at:    n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
    linkedOpportunity: n.linkedOpportunity ?? null,
  };
}

function getMockNeeds() {
  return [
    { id: "mn1", title: "Clean Water Access",     category: "health",      urgency: "critical", location: "Amritsar, Punjab",  city: "Amritsar",   beneficiaries: 200, status: "active",   source: "manual", created_at: "2026-04-20T08:00:00Z" },
    { id: "mn2", title: "School Supplies Needed", category: "education",   urgency: "high",     location: "Ludhiana, Punjab",  city: "Ludhiana",   beneficiaries: 50,  status: "active",   source: "manual", created_at: "2026-04-18T08:00:00Z" },
    { id: "mn3", title: "Elderly Care Gaps",      category: "elderly",     urgency: "medium",   location: "Chandigarh",        city: "Chandigarh", beneficiaries: 30,  status: "active",   source: "csv",    created_at: "2026-04-15T08:00:00Z" },
    { id: "mn4", title: "Flood Relief Prep",      category: "disaster",    urgency: "critical", location: "Pathankot, Punjab", city: "Pathankot",  beneficiaries: 500, status: "active",   source: "manual", created_at: "2026-04-10T08:00:00Z" },
    { id: "mn5", title: "Food Insecurity — Ward 4",category: "food",       urgency: "high",     location: "Amritsar, Punjab",  city: "Amritsar",   beneficiaries: 120, status: "addressed",source: "manual", created_at: "2026-03-28T08:00:00Z" },
  ];
}
