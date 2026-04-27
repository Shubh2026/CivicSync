import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NGODashboardClient from "@/components/dashboard/NGODashboardClient";

export default async function NGODashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.role) redirect("/role-select");
  if (profile.role !== "ngo") redirect("/dashboard/volunteer");

  return <NGODashboardClient user={user} profile={profile} />;
}
