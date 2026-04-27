import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("volunteer_assignments")
    .select(`
      *,
      opportunity:opportunities(*)
    `)
    .eq("volunteer_id", user.id)
    .order("accepted_at", { ascending: false });

  if (error) {
    // Return mock history if table doesn't exist
    return NextResponse.json({ data: getMockHistory(), isMock: true });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ data: getMockHistory(), isMock: true });
  }

  return NextResponse.json({ data, isMock: false });
}

function getMockHistory() {
  return [
    {
      id: "hist-1",
      volunteer_id: "mock-user",
      opportunity_id: "mock-opp-1",
      status: "completed",
      hours_contributed: 8,
      accepted_at: "2026-03-15T10:00:00Z",
      completed_at: "2026-03-15T18:00:00Z",
      rating: 5,
      opportunity: {
        id: "mock-opp-1",
        title: "Winter Blanket Distribution",
        category: "food",
        location: "Amritsar, Punjab",
        date_start: "2026-03-15",
      },
    },
    {
      id: "hist-2",
      volunteer_id: "mock-user",
      opportunity_id: "mock-opp-2",
      status: "completed",
      hours_contributed: 12,
      accepted_at: "2026-03-20T09:00:00Z",
      completed_at: "2026-04-05T17:00:00Z",
      rating: 4,
      opportunity: {
        id: "mock-opp-2",
        title: "School Book Drive",
        category: "education",
        location: "Ludhiana, Punjab",
        date_start: "2026-03-20",
      },
    },
    {
      id: "hist-3",
      volunteer_id: "mock-user",
      opportunity_id: "mock-opp-3",
      status: "ongoing",
      hours_contributed: 6,
      accepted_at: "2026-04-10T10:00:00Z",
      completed_at: null,
      rating: null,
      opportunity: {
        id: "mock-opp-3",
        title: "Youth Literacy Program",
        category: "education",
        location: "Ludhiana, Punjab",
        date_start: "2026-04-10",
      },
    },
    {
      id: "hist-4",
      volunteer_id: "mock-user",
      opportunity_id: "mock-opp-4",
      status: "accepted",
      hours_contributed: 0,
      accepted_at: "2026-04-25T10:00:00Z",
      completed_at: null,
      rating: null,
      opportunity: {
        id: "mock-opp-4",
        title: "River Cleanup — Beas",
        category: "environment",
        location: "Amritsar, Punjab",
        date_start: "2026-05-10",
      },
    },
    {
      id: "hist-5",
      volunteer_id: "mock-user",
      opportunity_id: "mock-opp-5",
      status: "completed",
      hours_contributed: 16,
      accepted_at: "2026-02-01T10:00:00Z",
      completed_at: "2026-02-28T17:00:00Z",
      rating: 5,
      opportunity: {
        id: "mock-opp-5",
        title: "Health Camp — Rural Villages",
        category: "health",
        location: "Pathankot, Punjab",
        date_start: "2026-02-01",
      },
    },
  ];
}
