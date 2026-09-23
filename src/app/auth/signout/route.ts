import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 force le navigateur à refaire la requête suivante en GET (le
  // 307 par défaut la répète en POST, ce qui fait échouer /login avec 405).
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
