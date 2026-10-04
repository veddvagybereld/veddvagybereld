import type { Metadata } from "next";
import "./globals.css";

import { LanguageProvider } from "./context/LanguageContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.molnarrent.ro"),

  title: {
    default: "MolnarRent – Vedd vagy Béreld",
    template: "%s | MolnarRent",
  },

  description:
    "Használt termékek értékesítése és állványok bérlése. Vedd vagy béreld a számodra megfelelő terméket a MolnarRent kínálatából.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "hu_HU",
    alternateLocale: ["ro_RO"],
    url: "https://www.molnarrent.ro",
    siteName: "MolnarRent",
    title: "MolnarRent – Állványbérlés és használt termékek",
    description:
      "Állványrendszerek bérlése és minőségi használt termékek a MolnarRent kínálatából.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MolnarRent – Állványbérlés és használt termékek",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "MolnarRent – Állványbérlés és használt termékek",
    description:
      "Állványrendszerek bérlése és minőségi használt termékek a MolnarRent kínálatából.",
    images: ["/images/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}