import type { MetadataRoute } from "next";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// A webhelytérkép minden kéréskor friss adatokat olvas.
export const dynamic = "force-dynamic";

const baseUrl = "https://www.molnarrent.ro";

function getAdminFirestore() {
  const existingApp = getApps().find((app) => app.name === "molnarrent-sitemap");
  const app =
    existingApp ??
    initializeApp(
      {
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      },
      "molnarrent-sitemap"
    );

  return getFirestore(app);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A meglévő oldalak változatlanul szerepelnek a webhelytérképen.
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/kapcsolat`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/allvanyberles`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/hasznalt-termekek`, changeFrequency: "weekly", priority: 0.9 },
  ];

  try {
    const snapshot = await getAdminFirestore()
      .collection("categories")
      .where("active", "==", true)
      .get();

    const categoryPages: MetadataRoute.Sitemap = snapshot.docs.flatMap((document) => {
      const data = document.data();
      const slug = typeof data.slug === "string" ? data.slug.trim() : "";

      // Csak a publikus útvonalként is használható azonosítók kerülnek be.
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        return [];
      }

      return [{
        url: `${baseUrl}/kategoria/${slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }];
    });

    return [...staticPages, ...categoryPages];
  } catch (error) {
    console.error("Nem sikerült betölteni a kategóriákat a webhelytérképhez:", error);
    return staticPages;
  }
}
