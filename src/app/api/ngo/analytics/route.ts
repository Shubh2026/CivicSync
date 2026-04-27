import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { CATEGORY_META } from "@/lib/types";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Try real data first
  const [needsRes, requestsRes, assignmentsRes] = await Promise.all([
    supabase.from("community_needs").select("*").eq("ngo_id", user.id),
    supabase.from("opportunities").select("*").eq("ngo_id", user.id),
    supabase.from("volunteer_assignments")
      .select("*, opportunity:opportunities!inner(ngo_id)")
      .eq("opportunity.ngo_id", user.id),
  ]);

  if (needsRes.error || requestsRes.error) {
    return NextResponse.json({ data: getMockAnalytics(), isMock: true });
  }

  const needs = needsRes.data || [];
  const requests = requestsRes.data || [];
  const assignments = assignmentsRes.data || [];

  const uniqueVolunteers = new Set(assignments.map((a) => a.volunteer_id)).size;
  const fulfilled = requests.filter((r) => r.volunteers_accepted >= r.volunteers_needed).length;
  const fulfillmentRate = requests.length ? Math.round((fulfilled / requests.length) * 100) : 0;
  const totalHours = assignments.reduce((s, a) => s + (a.hours_contributed || 0), 0);

  // Monthly engagement
  const monthlyMap: Record<string, { volunteers: Set<string>; requests: number }> = {};
  assignments.forEach((a) => {
    const key = new Date(a.accepted_at).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    if (!monthlyMap[key]) monthlyMap[key] = { volunteers: new Set(), requests: 0 };
    monthlyMap[key].volunteers.add(a.volunteer_id);
  });
  requests.forEach((r) => {
    const key = new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    if (!monthlyMap[key]) monthlyMap[key] = { volunteers: new Set(), requests: 0 };
    monthlyMap[key].requests += 1;
  });
  const engagementTimeline = Object.entries(monthlyMap).map(([month, v]) => ({
    month,
    volunteers: v.volunteers.size,
    requests: v.requests,
  }));

  // Category breakdown
  const catMap: Record<string, number> = {};
  [...needs, ...requests].forEach((item) => {
    catMap[item.category] = (catMap[item.category] || 0) + 1;
  });
  const categoryBreakdown = Object.entries(catMap).map(([cat, count]) => ({
    name: CATEGORY_META[cat]?.label || cat,
    count,
    color: CATEGORY_META[cat]?.color || "#94a3b8",
  }));

  const statusMap = { active: 0, completed: 0, closed: 0, draft: 0 };
  requests.forEach((r) => { statusMap[r.status as keyof typeof statusMap] = (statusMap[r.status as keyof typeof statusMap] || 0) + 1; });
  const requestStatusBreakdown = [
    { name: "Active", value: statusMap.active, color: "#34d399" },
    { name: "Completed", value: statusMap.completed, color: "#818cf8" },
    { name: "Closed", value: statusMap.closed, color: "#f59e0b" },
    { name: "Draft", value: statusMap.draft, color: "#94a3b8" },
  ].filter((s) => s.value > 0);

  return NextResponse.json({
    data: {
      totalNeeds: needs.length,
      totalRequests: requests.length,
      totalVolunteers: uniqueVolunteers,
      fulfillmentRate,
      totalHoursContributed: totalHours,
      engagementTimeline,
      categoryBreakdown,
      requestStatusBreakdown,
    },
  });
}

function getMockAnalytics() {
  return {
    totalNeeds: 5,
    totalRequests: 5,
    totalVolunteers: 29,
    fulfillmentRate: 60,
    totalHoursContributed: 124,
    engagementTimeline: [
      { month: "Jan '26", volunteers: 4,  requests: 1 },
      { month: "Feb '26", volunteers: 7,  requests: 2 },
      { month: "Mar '26", volunteers: 11, requests: 3 },
      { month: "Apr '26", volunteers: 18, requests: 4 },
      { month: "May '26", volunteers: 29, requests: 5 },
    ],
    categoryBreakdown: [
      { name: "Food Security",   count: 2, color: "#f97316" },
      { name: "Education",       count: 2, color: "#818cf8" },
      { name: "Environment",     count: 1, color: "#34d399" },
      { name: "Healthcare",      count: 1, color: "#f472b6" },
      { name: "Elderly Care",    count: 1, color: "#fb923c" },
      { name: "Disaster Relief", count: 1, color: "#ef4444" },
    ],
    requestStatusBreakdown: [
      { name: "Active",    value: 3, color: "#34d399" },
      { name: "Completed", value: 1, color: "#818cf8" },
      { name: "Closed",    value: 1, color: "#f59e0b" },
    ],
  };
}
