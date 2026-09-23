import { NextResponse } from "next/server";

// Identifiant stable pour ce déploiement précis : Vercel fournit le SHA du
// commit en build ; en local (ou hors Vercel) on retombe sur l'heure de
// démarrage du serveur. Calculé une seule fois au chargement du module, donc
// fixe tant que ce déploiement tourne, et différent au prochain déploiement.
const DEPLOY_VERSION = process.env.VERCEL_GIT_COMMIT_SHA ?? String(Date.now());

export async function GET() {
  return NextResponse.json(
    { version: DEPLOY_VERSION },
    { headers: { "Cache-Control": "no-store" } }
  );
}
