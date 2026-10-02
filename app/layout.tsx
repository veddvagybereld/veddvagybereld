import type { Metadata } from "next";
import "./globals.css";

import { LanguageProvider } from "./context/LanguageContext";

export const metadata: Metadata = {
  title: "EladBérel",
  description:
    "Használt termékek értékesítése és állványok bérlése.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}