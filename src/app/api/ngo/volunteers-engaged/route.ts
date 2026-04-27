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
      volunteer:profiles(id, full_name, avatar_url, email, skills, location, bio, phone),
      opportunity:opportunities!inner(id, title, ngo_id)
    `)
    .eq("opportunity.ngo_id", user.id)
    .order("accepted_at", { ascending: false });

  if (error) return NextResponse.json({ data: getMockEngaged(), isMock: true });
  if (!data?.length) return NextResponse.json({ data: getMockEngaged(), isMock: true });
  return NextResponse.json({ data });
}

function getMockEngaged() {
  return [
    { id: "a1", volunteer_id: "v1", status: "accepted",  hours_contributed: 0,  accepted_at: "2026-04-22T10:00:00Z", opportunity: { id: "req-1", title: "Food Distribution Drive", ngo_id: "ngo" }, volunteer: { id: "v1", full_name: "Priya Sharma",  email: "priya@example.com",  avatar_url: null, skills: ["communication", "teaching"],         location: "Amritsar, Punjab", bio: "Passionate about community development." } },
    { id: "a2", volunteer_id: "v2", status: "ongoing",   hours_contributed: 4,  accepted_at: "2026-04-20T10:00:00Z", opportunity: { id: "req-1", title: "Food Distribution Drive", ngo_id: "ngo" }, volunteer: { id: "v2", full_name: "Arjun Singh",   email: "arjun@example.com",  avatar_url: null, skills: ["physical activity", "first aid"],  location: "Amritsar, Punjab", bio: "Ex-NCC cadet, love serving." } },
    { id: "a3", volunteer_id: "v3", status: "completed", hours_contributed: 8,  accepted_at: "2026-04-15T10:00:00Z", opportunity: { id: "req-2", title: "Youth Literacy Program", ngo_id: "ngo" },   volunteer: { id: "v3", full_name: "Kavya Mehta",   email: "kavya@example.com",  avatar_url: null, skills: ["teaching", "communication"],        location: "Ludhiana, Punjab", bio: "Social worker with 3 years experience." } },
    { id: "a4", volunteer_id: "v4", status: "accepted",  hours_contributed: 0,  accepted_at: "2026-04-25T10:00:00Z", opportunity: { id: "req-2", title: "Youth Literacy Program", ngo_id: "ngo" },   volunteer: { id: "v4", full_name: "Rohan Gupta",   email: "rohan@example.com",  avatar_url: null, skills: ["technology", "design"],             location: "Chandigarh",      bio: "CS student looking to give back." } },
    { id: "a5", volunteer_id: "v5", status: "ongoing",   hours_contributed: 12, accepted_at: "2026-04-12T10:00:00Z", opportunity: { id: "req-3", title: "River Cleanup — Beas", ngo_id: "ngo" },     volunteer: { id: "v5", full_name: "Simran Kaur",   email: "simran@example.com", avatar_url: null, skills: ["physical activity", "leadership"],  location: "Amritsar, Punjab", bio: "Environmental activist." } },
    { id: "a6", volunteer_id: "v6", status: "accepted",  hours_contributed: 0,  accepted_at: "2026-04-26T10:00:00Z", opportunity: { id: "req-4", title: "Senior Citizen Companion", ngo_id: "ngo" }, volunteer: { id: "v6", full_name: "Aarav Patel",   email: "aarav@example.com",  avatar_url: null, skills: ["empathy", "communication"],         location: "Chandigarh",      bio: "Retired doctor, want to contribute." } },
    { id: "a7", volunteer_id: "v7", status: "completed", hours_contributed: 16, accepted_at: "2026-03-20T10:00:00Z", opportunity: { id: "req-3", title: "River Cleanup — Beas", ngo_id: "ngo" },     volunteer: { id: "v7", full_name: "Naina Verma",   email: "naina@example.com",  avatar_url: null, skills: ["photography", "social media"],      location: "Ludhiana, Punjab", bio: "Freelance photographer & activist." } },
  ];
}
