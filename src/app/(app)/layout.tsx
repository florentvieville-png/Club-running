import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { TopHeader } from "@/components/TopHeader";
import { BottomNav } from "@/components/BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");

  return (
    <>
      <TopHeader role={current.profile.role} />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 pb-24">
        {children}
      </div>
      <BottomNav />
      <InstallPrompt />
    </>
  );
}
