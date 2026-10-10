
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminFirestore } from "../../lib/firebase-admin";
import KategoriaClient from "./KategoriaClient";
import type { Category, Product, MediaItem, Localized } from "./types";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

function localized(value: unknown): Localized {
  const data = (value ?? {}) as Record<string, unknown>;

  return {
    hu: typeof data.hu === "string" ? data.hu : "",
    ro: typeof data.ro === "string" ? data.ro : "",
  };
}

function media(value: unknown): MediaItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item): MediaItem[] => {
    if (!item || typeof item !== "object") return [];
    if (!["image", "video", "document"].includes(item.type)) return [];
    if (typeof item.url !== "string") return [];

    return [{
      type: item.type,
      url: item.url,
      name: String(item.name ?? ""),
    }];
  });
}

async function loadCategory(slug: string) {
  const db = getAdminFirestore();

  const categorySnapshot = await db
    .collection("categories")
    .where("slug", "==", slug)
    .where("active", "==", true)
    .limit(1)
    .get();

  if (categorySnapshot.empty) return null;

  const categoryDoc = categorySnapshot.docs[0];
  const data = categoryDoc.data();

  const category: Category = {
    id: categoryDoc.id,
    title: localized(data.title),
    intro: localized(data.intro),
    media: media(data.media),
  };

  const [productSnapshot, homeSnapshot] = await Promise.all([
    db
      .collection("products")
      .where("categoryId", "==", categoryDoc.id)
      .where("active", "==", true)
      .orderBy("order", "asc")
      .get(),

    db.collection("siteSettings").doc("home").get(),
  ]);

  const products: Product[] = productSnapshot.docs.map((productDoc) => {
    const product = productDoc.data();

    return {
      id: productDoc.id,
      title: localized(product.title),
      description: localized(product.description),
      rentable: product.rentable === true,
      properties: Array.isArray(product.properties)
        ? product.properties.map((property: Record<string, unknown>) => ({
            label: localized(property?.label),
            value: localized(property?.value),
          }))
        : [],
      media: media(product.media),
    };
  });

  const homeData = homeSnapshot.data();

  const backgroundImageUrl =
    typeof homeData?.backgroundImageUrl === "string"
      ? homeData.backgroundImageUrl
      : "";

  return { category, products, backgroundImageUrl };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadCategory(slug);

  if (!result) {
    return {
      title: "Kategória nem található",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { category, products } = result;

  // Ungarische Sprache als Standard für SEO verwenden
  const title =
    category.title.hu ||
    category.title.ro ||
    "Termékek";

  const text =
    category.intro.hu ||
    category.intro.ro ||
    products
      .map((p) => p.title.hu || p.title.ro)
      .filter(Boolean)
      .join(", ");

  const description =
    text.replace(/\s+/g, " ").trim().slice(0, 160) ||
    "MolnarRent – termékek és bérlési lehetőségek.";

  const url =
    `https://www.molnarrent.ro/kategoria/${encodeURIComponent(slug)}`;

  return {
    // Der Root-Layout ergänzt automatisch "| MolnarRent"
    title,
    description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title: `${title} | MolnarRent`,
      description,
      url,
      type: "website",
      locale: "hu_HU",
      alternateLocale: ["ro_RO"],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function KategoriaPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const result = await loadCategory(slug);

  if (!result) notFound();

  return <KategoriaClient {...result} />;
}
