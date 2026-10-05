"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { doc, getDoc } from "firebase/firestore";

import LanguageSelector from "../components/LanguageSelector";
import { useLanguage } from "../context/LanguageContext";
import { db } from "../lib/firebase";

type ContactData = {
  name: string;
  address: {
    hu: string;
    ro: string;
  };
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
};

const emptyContact: ContactData = {
  name: "",
  address: {
    hu: "",
    ro: "",
  },
  phone: "",
  email: "",
  website: "",
  whatsapp: "",
};

export default function KapcsolatPage() {
  const { t, language } = useLanguage();

  const [contact, setContact] =
    useState<ContactData>(emptyContact);

  const [loading, setLoading] = useState(true);

  const googleMapsUrl =
    "https://www.google.hu/maps/place/Strada+S%C3%A2ntana+Niraj+11,+547410+Miercurea+Nirajului,+Rom%C3%A2nia/@46.5270553,24.7951928,14.25z/data=!4m6!3m5!1s0x474bade07e90af55:0xafdf144cf8385dde!8m2!3d46.528447!4d24.806287!16s%2Fg%2F11c2b68w_z";

  useEffect(() => {
    async function loadContact() {
      try {
        const contactRef = doc(
          db,
          "siteSettings",
          "contact"
        );

        const snapshot = await getDoc(contactRef);

        if (snapshot.exists()) {
          const data = snapshot.data();

          setContact({
            name: data.name ?? "",
            address: {
              hu: data.address?.hu ?? "",
              ro: data.address?.ro ?? "",
            },
            phone: data.phone ?? "",
            email: data.email ?? "",
            website: data.website ?? "",
            whatsapp: data.whatsapp ?? "",
          });
        }
      } catch (error) {
        console.error(
          "Kapcsolati adatok betöltési hiba:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadContact();
  }, []);

  const address =
    language === "ro"
      ? contact.address.ro
      : contact.address.hu;

  function getPhoneHref(phone: string) {
    return `tel:${phone.replace(/[^\d+]/g, "")}`;
  }

  function getWhatsAppHref(value: string) {
    const cleanNumber = value.replace(/\D/g, "");

    return `https://wa.me/${cleanNumber}`;
  }

  function getWebsiteHref(value: string) {
    if (
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {
      return value;
    }

    return `https://${value}`;
  }

  return (
    <div className="min-h-screen bg-[#f4f1eb] text-[#222b31]">

      {/* Fejléc */}
      <header className="relative z-20 border-b border-black/5 bg-white/95 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">

          {/* Logó */}
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <Image
              src="/images/logo-mark.svg"
              alt="MolnarRent"
              width={54}
              height={54}
              priority
              className="h-12 w-12 sm:h-14 sm:w-14"
            />

            <div>
              <div className="text-xl font-bold sm:text-2xl">
                <span className="text-orange-600">
                  {t.heroTitle1}
                </span>

                <span className="text-[#222b31]">
                  {" "}
                  {t.heroTitle2}{" "}
                </span>

                <span className="text-orange-600">
                  {t.heroTitle3}
                </span>
              </div>

              <div className="hidden text-xs tracking-wide text-gray-500 sm:block">
                {t.siteSubtitle}
              </div>
            </div>
          </Link>

          {/* Jobb oldal */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="hidden text-sm font-medium text-gray-700 transition hover:text-orange-600 sm:block"
            >
              {t.home}
            </Link>

            <LanguageSelector />
          </div>

        </div>
      </header>

      {/* Háttér */}
      <div
        className="bg-cover bg-center bg-fixed bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(rgba(247,244,238,0.65), rgba(247,244,238,0.80)), url('/images/hero-bg.jpg')",
        }}
      >
        <main className="mx-auto max-w-6xl px-6 py-14">

          {/* Oldalcím */}
          <div className="mb-8 rounded-3xl border border-white/70 bg-white/90 p-8 shadow-lg backdrop-blur-sm sm:p-10">
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-orange-600">
              {t.contactPageEyebrow}
            </p>

            <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
              {t.contactPageTitle}
            </h1>

            <p className="max-w-3xl text-lg leading-relaxed text-gray-600">
              {t.contactPageDescription}
            </p>
          </div>

          {/* Kapcsolat + térkép */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr]">

            {/* Kapcsolati adatok */}
            <div className="rounded-3xl border border-white/70 bg-white p-8 shadow-xl">

              {loading ? (
                <p className="text-gray-500">
                  Kapcsolati adatok betöltése...
                </p>
              ) : (
                <div className="space-y-7">

                  {/* Név */}
                  {contact.name && (
                    <div>
                      <p className="text-xl font-bold text-[#222b31]">
                        {contact.name}
                      </p>
                    </div>
                  )}

                  {/* Cím */}
                  {address && (
                    <div>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-xl">
                          📍
                        </div>

                        <h2 className="text-lg font-bold">
                          {t.addressLabel}
                        </h2>
                      </div>

                      <p className="pl-14 leading-relaxed text-gray-600">
                        {address}
                      </p>
                    </div>
                  )}

                  {/* Telefon */}
                  {contact.phone && (
                    <div>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-xl">
                          ☎
                        </div>

                        <h2 className="text-lg font-bold">
                          {t.phoneLabel}
                        </h2>
                      </div>

                      <div className="pl-14">
                        <a
                          href={getPhoneHref(contact.phone)}
                          className="text-gray-600 transition hover:text-orange-600"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* E-mail */}
                  {contact.email && (
                    <div>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-xl">
                          ✉
                        </div>

                        <h2 className="text-lg font-bold">
                          E-mail
                        </h2>
                      </div>

                      <div className="pl-14">
                        <a
                          href={`mailto:${contact.email}`}
                          className="break-all text-gray-600 transition hover:text-orange-600"
                        >
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Weboldal */}
                  {contact.website && (
                    <div>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-xl">
                          🌐
                        </div>

                        <h2 className="text-lg font-bold">
                          Web
                        </h2>
                      </div>

                      <div className="pl-14">
                        <a
                          href={getWebsiteHref(contact.website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-gray-600 transition hover:text-orange-600"
                        >
                          {contact.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp */}
                  {contact.whatsapp && (
                    <div>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-xl">
                          💬
                        </div>

                        <h2 className="text-lg font-bold">
                          WhatsApp
                        </h2>
                      </div>

                      <div className="pl-14">
                        <a
                          href={getWhatsAppHref(
                            contact.whatsapp
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 transition hover:text-orange-600"
                        >
                          {contact.whatsapp}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Google Maps */}
                  <div className="pt-3">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-700"
                    >
                      <span>📍</span>
                      <span>{t.openInMaps}</span>
                    </a>
                  </div>

                </div>
              )}

            </div>

            {/* Térkép */}
            <div className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="text-xl font-bold">
                  {t.mapTitle}
                </h2>
              </div>

              <iframe
                src="https://www.google.com/maps?q=46.528447,24.806287&z=16&output=embed"
                width="100%"
                height="460"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t.mapTitle}
                className="block w-full"
              />
            </div>

          </div>

          {/* Vissza */}
          <div className="mt-12">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-xl bg-[#222b31] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#354149]"
            >
              <span className="text-xl">←</span>
              <span>{t.backToHome}</span>
            </Link>
          </div>

        </main>
      </div>

      {/* Lábléc */}
      <footer className="bg-[#222b31] text-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex flex-col gap-3 text-sm text-gray-200 sm:flex-row sm:gap-8">

              {address && (
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{address}</span>
                </div>
              )}

              {contact.phone && (
                <div className="flex items-center gap-2">
                  <span>☎</span>

                  <a
                    href={getPhoneHref(contact.phone)}
                    className="transition hover:text-orange-400"
                  >
                    {contact.phone}
                  </a>
                </div>
              )}

            </div>

            <div className="italic text-gray-300">
              {t.footerSlogan}
            </div>

          </div>

          <div className="mt-7 border-t border-white/10 pt-5 text-center text-xs text-gray-400">
            {t.copyright}
          </div>
        </div>
      </footer>

    </div>
  );
}