import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if the user has a role set in their profile
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Upsert a profile row if it doesn't exist yet
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!profile?.role) {
          // New user — send to role selection
          return NextResponse.redirect(`${origin}/role-select`);
        } else {
          // Existing user — send to their dashboard
          const dashboard =
            profile.role === "volunteer"
              ? "/dashboard/volunteer"
              : "/dashboard/ngo";
          return NextResponse.redirect(`${origin}${dashboard}`);
        }
      }
    }
  }

  // Something went wrong — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
