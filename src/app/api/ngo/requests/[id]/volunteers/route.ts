import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { data, error } = await supabase
    .from("volunteer_assignments")
    .select(`
      *,
      volunteer:profiles(id, full_name, avatar_url, email, skills, location, bio)
    `)
    .eq("opportunity_id", id)
    .order("accepted_at", { ascending: false });

  if (error) return NextResponse.json({ data: getMockVolunteers(), isMock: true });
  if (!data?.length) return NextResponse.json({ data: getMockVolunteers(), isMock: true });
  return NextResponse.json({ data });
}

function getMockVolunteers() {
  return [
    { id: "a1", volunteer_id: "v1", opportunity_id: "req-1", status: "accepted", hours_contributed: 0, accepted_at: "2026-04-22T10:00:00Z", volunteer: { id: "v1", full_name: "Priya Sharma", email: "priya@example.com", avatar_url: null, skills: ["communication", "teaching"], location: "Amritsar, Punjab", bio: "Passionate about community development." } },
    { id: "a2", volunteer_id: "v2", opportunity_id: "req-1", status: "ongoing",  hours_contributed: 4, accepted_at: "2026-04-20T10:00:00Z", volunteer: { id: "v2", full_name: "Arjun Singh", email: "arjun@example.com", avatar_url: null, skills: ["physical activity", "first aid"], location: "Amritsar, Punjab", bio: "Ex-NCC cadet, love serving." } },
    { id: "a3", volunteer_id: "v3", opportunity_id: "req-1", status: "completed", hours_contributed: 8, accepted_at: "2026-04-15T10:00:00Z", volunteer: { id: "v3", full_name: "Kavya Mehta", email: "kavya@example.com", avatar_url: null, skills: ["communication", "empathy"], location: "Ludhiana, Punjab", bio: "Social worker with 3 years exp." } },
    { id: "a4", volunteer_id: "v4", opportunity_id: "req-1", status: "accepted", hours_contributed: 0, accepted_at: "2026-04-25T10:00:00Z", volunteer: { id: "v4", full_name: "Rohan Gupta", email: "rohan@example.com", avatar_url: null, skills: ["technology", "design"], location: "Chandigarh", bio: "CS student looking to give back." } },
  ];
}
