import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { SHOP_RESERVATION_LABELS, type ShopReservationWithDetails } from "@/lib/types/database";

export async function GET() {
  const current = await getCurrentProfile();
  if (!current) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (current.profile.role !== "admin" && current.profile.role !== "coach") {
    return NextResponse.json({ error: "Réservé aux coachs et admins" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shop_reservations")
    .select("*, item:shop_items(id, name), member:profiles!shop_reservations_user_id_fkey(id, full_name)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const reservations = (data ?? []) as unknown as ShopReservationWithDetails[];

  const detailRows = reservations.map((r) => ({
    Demandeur: r.member?.full_name ?? "Membre",
    Article: r.item?.name ?? "Article supprimé",
    Quantité: r.quantity,
    Statut: SHOP_RESERVATION_LABELS[r.status],
    Note: r.note ?? "",
    Date: new Date(r.created_at).toLocaleDateString("fr-FR"),
  }));

  const quantityByArticle = new Map<string, number>();
  for (const r of reservations) {
    if (r.status === "cancelled") continue;
    const name = r.item?.name ?? "Article supprimé";
    quantityByArticle.set(name, (quantityByArticle.get(name) ?? 0) + r.quantity);
  }
  const summaryRows = Array.from(quantityByArticle.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([Article, Quantité]) => ({ Article, Quantité }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryRows), "Quantités à commander");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(detailRows), "Demandes");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="boutique-demandes-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
