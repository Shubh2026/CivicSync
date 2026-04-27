import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category");
  const city = searchParams.get("city");
  const urgency = searchParams.get("urgency");
  const dateFrom = searchParams.get("dateFrom");
  const search = searchParams.get("search");

  let query = supabase
    .from("opportunities")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (category && category !== "all") query = query.eq("category", category);
  if (city && city !== "all") query = query.ilike("city", `%${city}%`);
  if (urgency && urgency !== "all") query = query.eq("urgency", urgency);
  if (dateFrom) query = query.gte("date_start", dateFrom);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error } = await query;

  if (error) {
    // Return mock data if table doesn't exist yet
    return NextResponse.json({ data: getMockOpportunities(), isMock: true });
  }

  // If table exists but is empty, seed with mock data
  if (!data || data.length === 0) {
    return NextResponse.json({ data: getMockOpportunities(), isMock: true });
  }

  return NextResponse.json({ data, isMock: false });
}

function getMockOpportunities() {
  return [
    {
      id: "mock-1",
      title: "Food Distribution Drive",
      description: "Help distribute nutritious meals to families in low-income areas of Amritsar. No prior experience needed — just a warm heart and willingness to help.",
      category: "food",
      location: "Amritsar, Punjab",
      city: "Amritsar",
      state: "Punjab",
      urgency: "high",
      required_skills: ["communication", "physical activity"],
      volunteers_needed: 15,
      volunteers_accepted: 7,
      date_start: "2026-05-01",
      date_end: "2026-05-01",
      hours_per_week: 4,
      is_one_time: true,
      is_remote: false,
      status: "active",
    },
    {
      id: "mock-2",
      title: "Youth Literacy Program",
      description: "Teach basic reading and writing to underprivileged children aged 8–14 in Ludhiana. Prior teaching experience preferred but not required.",
      category: "education",
      location: "Ludhiana, Punjab",
      city: "Ludhiana",
      state: "Punjab",
      urgency: "medium",
      required_skills: ["teaching", "communication", "patience"],
      volunteers_needed: 8,
      volunteers_accepted: 3,
      date_start: "2026-05-05",
      date_end: "2026-07-31",
      hours_per_week: 6,
      is_one_time: false,
      is_remote: false,
      status: "active",
    },
    {
      id: "mock-3",
      title: "River Cleanup — Beas",
      description: "Join our monthly cleanup drive along the Beas river. Gloves and materials provided. Help keep Punjab's rivers clean for future generations.",
      category: "environment",
      location: "Amritsar, Punjab",
      city: "Amritsar",
      state: "Punjab",
      urgency: "medium",
      required_skills: ["physical activity"],
      volunteers_needed: 20,
      volunteers_accepted: 11,
      date_start: "2026-05-10",
      date_end: "2026-05-10",
      hours_per_week: 5,
      is_one_time: true,
      is_remote: false,
      status: "active",
    },
    {
      id: "mock-4",
      title: "Senior Citizen Companion",
      description: "Spend a few hours weekly with elderly residents at a care home in Chandigarh. Light activities, conversations, and genuine companionship.",
      category: "elderly",
      location: "Chandigarh",
      city: "Chandigarh",
      state: "Punjab",
      urgency: "low",
      required_skills: ["empathy", "communication"],
      volunteers_needed: 5,
      volunteers_accepted: 2,
      date_start: "2026-05-01",
      date_end: "2026-08-31",
      hours_per_week: 3,
      is_one_time: false,
      is_remote: false,
      status: "active",
    },
    {
      id: "mock-5",
      title: "Digital Literacy Workshop",
      description: "Teach basic smartphone and internet skills to adults above 50 in rural Punjab. Remote & in-person sessions available. Make a tech difference.",
      category: "education",
      location: "Remote",
      city: null,
      state: null,
      urgency: "medium",
      required_skills: ["teaching", "technology", "communication"],
      volunteers_needed: 10,
      volunteers_accepted: 4,
      date_start: "2026-05-15",
      date_end: "2026-06-30",
      hours_per_week: 4,
      is_one_time: false,
      is_remote: true,
      status: "active",
    },
    {
      id: "mock-6",
      title: "Mental Health Awareness Campaign",
      description: "Design and distribute mental health awareness materials across colleges in Amritsar. Creative and communication skills are especially valued.",
      category: "health",
      location: "Amritsar, Punjab",
      city: "Amritsar",
      state: "Punjab",
      urgency: "high",
      required_skills: ["design", "communication", "empathy"],
      volunteers_needed: 6,
      volunteers_accepted: 1,
      date_start: "2026-05-20",
      date_end: "2026-05-25",
      hours_per_week: 8,
      is_one_time: false,
      is_remote: false,
      status: "active",
    },
    {
      id: "mock-7",
      title: "Animal Shelter Assistant",
      description: "Help care for rescued animals at the Amritsar Animal Aid shelter. Tasks include feeding, cleaning, and socialising with rescued animals.",
      category: "animals",
      location: "Amritsar, Punjab",
      city: "Amritsar",
      state: "Punjab",
      urgency: "critical",
      required_skills: ["animal care", "physical activity"],
      volunteers_needed: 4,
      volunteers_accepted: 0,
      date_start: "2026-05-01",
      date_end: "2026-09-30",
      hours_per_week: 5,
      is_one_time: false,
      is_remote: false,
      status: "active",
    },
    {
      id: "mock-8",
      title: "Disaster Relief — Flood Prep",
      description: "Assist in pre-monsoon flood preparedness training for rural communities near Pathankot. First aid training provided on-site.",
      category: "disaster",
      location: "Pathankot, Punjab",
      city: "Pathankot",
      state: "Punjab",
      urgency: "critical",
      required_skills: ["first aid", "communication", "physical activity"],
      volunteers_needed: 12,
      volunteers_accepted: 5,
      date_start: "2026-05-25",
      date_end: "2026-06-05",
      hours_per_week: 6,
      is_one_time: false,
      is_remote: false,
      status: "active",
    },
  ];
}
