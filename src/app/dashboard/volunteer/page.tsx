import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VolunteerDashboardClient from "@/components/dashboard/VolunteerDashboardClient";
import type { VolunteerProfile } from "@/lib/types";

export default async function VolunteerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.role) redirect("/role-select");
  if (profile.role !== "volunteer") redirect("/dashboard/ngo");

  // Ensure arrays exist
  const typedProfile: VolunteerProfile = {
    ...profile,
    skills:       profile.skills       ?? [],
    availability: profile.availability ?? [],
    causes:       profile.causes       ?? [],
  };

  return <VolunteerDashboardClient user={user} profile={typedProfile} />;
}
