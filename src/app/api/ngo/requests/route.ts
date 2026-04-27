import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("opportunities")
    .select("*, assignments:volunteer_assignments(count)")
    .eq("ngo_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ data: getMockRequests(user.id), isMock: true });
  if (!data?.length) return NextResponse.json({ data: getMockRequests(user.id), isMock: true });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    title, description, category, location, city, state,
    urgency, required_skills, volunteers_needed,
    date_start, date_end, hours_per_week, is_one_time, is_remote,
    linked_need_id,
  } = body;

  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      ngo_id: user.id,
      title, description, category, location, city, state,
      urgency, required_skills: required_skills || [],
      volunteers_needed: volunteers_needed || 1,
      date_start, date_end, hours_per_week,
      is_one_time: is_one_time || false,
      is_remote: is_remote || false,
      status: "active",
    })
    .select().single();

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ data: { id: "mock-" + Date.now(), ...body, volunteers_accepted: 0 }, isMock: true });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If linked to a community need, update it
  if (linked_need_id && data) {
    await supabase
      .from("community_needs")
      .update({ linked_opportunity_id: data.id, status: "addressed" })
      .eq("id", linked_need_id);
  }

  return NextResponse.json({ data });
}

function getMockRequests(ngoId: string) {
  return [
    { id: "req-1", ngo_id: ngoId, title: "Food Distribution Drive", description: "Weekly food distribution in Ram Nagar.", category: "food", location: "Amritsar, Punjab", city: "Amritsar", urgency: "high", required_skills: ["communication", "physical activity"], volunteers_needed: 15, volunteers_accepted: 7, date_start: "2026-05-01", date_end: "2026-05-01", hours_per_week: 4, is_one_time: true, is_remote: false, status: "active", created_at: "2026-04-10T10:00:00Z" },
    { id: "req-2", ngo_id: ngoId, title: "Youth Literacy Program", description: "Science and math tutoring for underprivileged students.", category: "education", location: "Ludhiana, Punjab", city: "Ludhiana", urgency: "medium", required_skills: ["teaching", "communication"], volunteers_needed: 8, volunteers_accepted: 8, date_start: "2026-05-05", date_end: "2026-07-31", hours_per_week: 6, is_one_time: false, is_remote: false, status: "active", created_at: "2026-04-05T10:00:00Z" },
    { id: "req-3", ngo_id: ngoId, title: "River Cleanup — Beas", description: "Monthly cleanup drive along Beas riverbank.", category: "environment", location: "Amritsar, Punjab", city: "Amritsar", urgency: "medium", required_skills: ["physical activity"], volunteers_needed: 20, volunteers_accepted: 11, date_start: "2026-04-10", date_end: "2026-04-10", hours_per_week: 5, is_one_time: true, is_remote: false, status: "completed", created_at: "2026-03-25T10:00:00Z" },
    { id: "req-4", ngo_id: ngoId, title: "Senior Citizen Companion", description: "Weekly visits and activities for elderly residents.", category: "elderly", location: "Chandigarh", city: "Chandigarh", urgency: "low", required_skills: ["empathy", "communication"], volunteers_needed: 5, volunteers_accepted: 2, date_start: "2026-05-01", date_end: "2026-08-31", hours_per_week: 3, is_one_time: false, is_remote: false, status: "active", created_at: "2026-04-12T10:00:00Z" },
    { id: "req-5", ngo_id: ngoId, title: "Mental Health Awareness Campaign", description: "Distribute mental health resources across colleges.", category: "health", location: "Amritsar, Punjab", city: "Amritsar", urgency: "high", required_skills: ["design", "communication"], volunteers_needed: 6, volunteers_accepted: 1, date_start: "2026-05-20", date_end: "2026-05-25", hours_per_week: 8, is_one_time: false, is_remote: false, status: "active", created_at: "2026-04-18T10:00:00Z" },
  ];
}
