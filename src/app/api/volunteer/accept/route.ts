import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { opportunityId } = await request.json();

  if (!opportunityId) {
    return NextResponse.json({ error: "opportunityId is required" }, { status: 400 });
  }

  // Check if already accepted
  const { data: existing } = await supabase
    .from("volunteer_assignments")
    .select("id")
    .eq("volunteer_id", user.id)
    .eq("opportunity_id", opportunityId)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Already accepted this opportunity" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("volunteer_assignments")
    .insert({
      volunteer_id: user.id,
      opportunity_id: opportunityId,
      status: "accepted",
    })
    .select()
    .single();

  if (error) {
    // If table doesn't exist, return success for demo
    if (error.code === "42P01") {
      return NextResponse.json({ data: { id: "mock-assign", status: "accepted" }, isMock: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
