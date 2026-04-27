import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("community_needs")
    .select("*")
    .eq("ngo_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ data: getMockNeeds(user.id), isMock: true });
  if (!data?.length) return NextResponse.json({ data: getMockNeeds(user.id), isMock: true });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, description, category, location, city, state, urgency, beneficiaries, source } = body;

  const { data, error } = await supabase
    .from("community_needs")
    .insert({ ngo_id: user.id, title, description, category, location, city, state, urgency, beneficiaries, source: source || "manual" })
    .select().single();

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ data: { id: "mock-" + Date.now(), ...body }, isMock: true });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

function getMockNeeds(ngoId: string) {
  return [
    { id: "need-1", ngo_id: ngoId, title: "Nutritious Meals for 200 Families", description: "Low-income families in Ram Nagar colony have been facing acute food shortage following factory closures. Approximately 200 families need weekly food support.", category: "food", location: "Amritsar, Punjab", city: "Amritsar", state: "Punjab", urgency: "critical", beneficiaries: 800, image_urls: [], status: "active", linked_opportunity_id: "mock-1", source: "manual", created_at: "2026-04-01T10:00:00Z" },
    { id: "need-2", ngo_id: ngoId, title: "After-School Tutoring — Class 6-10", description: "Government school in Ranjit Nagar lacks qualified teachers for science and math. 120 students risk failing exams without intervention.", category: "education", location: "Ludhiana, Punjab", city: "Ludhiana", state: "Punjab", urgency: "high", beneficiaries: 120, image_urls: [], status: "active", linked_opportunity_id: "mock-2", source: "manual", created_at: "2026-04-05T10:00:00Z" },
    { id: "need-3", ngo_id: ngoId, title: "Riverside Plastic Waste Crisis", description: "Beas river banks near Hari Nagar have accumulated over 2 tonnes of plastic waste. Immediate cleanup needed before monsoon season.", category: "environment", location: "Amritsar, Punjab", city: "Amritsar", state: "Punjab", urgency: "high", beneficiaries: 5000, image_urls: [], status: "addressed", linked_opportunity_id: "mock-3", source: "csv", created_at: "2026-03-20T10:00:00Z" },
    { id: "need-4", ngo_id: ngoId, title: "Elder Care — Isolation & Loneliness", description: "Senior care home in Sector 22 has 30 residents with no regular visitors. Many show signs of depression and cognitive decline.", category: "elderly", location: "Chandigarh", city: "Chandigarh", state: "Punjab", urgency: "medium", beneficiaries: 30, image_urls: [], status: "active", linked_opportunity_id: null, source: "manual", created_at: "2026-04-10T10:00:00Z" },
    { id: "need-5", ngo_id: ngoId, title: "Monsoon Flood Preparedness Training", description: "Rural villages near Pathankot flooded 3 times in last 5 years. Residents need basic rescue training and emergency kit preparation.", category: "disaster", location: "Pathankot, Punjab", city: "Pathankot", state: "Punjab", urgency: "critical", beneficiaries: 2000, image_urls: [], status: "active", linked_opportunity_id: null, source: "manual", created_at: "2026-04-15T10:00:00Z" },
  ];
}
