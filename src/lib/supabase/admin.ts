import { createClient } from "@supabase/supabase-js";

// Client "admin" : utilise la clé service_role, qui contourne toute la
// sécurité RLS et peut supprimer des comptes d'authentification. Réservé
// aux Server Actions déjà protégées par une vérification de rôle — ne
// jamais exposer ce client ou cette clé côté navigateur.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquante : ajoutez-la dans les variables d'environnement Vercel pour activer la suppression de membres."
    );
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
