"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import Link from "next/link";

import {

  collection,

  doc,

  getDoc,

  getDocs,



} from "firebase/firestore";

import { db } from "./lib/firebase";

import LanguageSelector from "./components/LanguageSelector";

import { useLanguage } from "./context/LanguageContext";

type HomeSettings = {

  description?: {

    hu?: string;

    ro?: string;

  };

  backgroundImageUrl?: string;

};

type ContactData = {

  address: {

    hu: string;

    ro: string;

  };

  phone: string;

};

type Category = {

  id: string;

  slug: string;

  order: number;

  active: boolean;

  title: {

    hu: string;

    ro: string;

  };

  description: {

    hu: string;

    ro: string;

  };

  cardImageUrl: string;

};

export default function Home() {

  const { t, language } = useLanguage();

  const [homeSettings, setHomeSettings] =

    useState<HomeSettings | null>(null);

  const [contact, setContact] =

    useState<ContactData>({

      address: {

        hu: "",

        ro: "",

      },

      phone: "",

    });

  const [categories, setCategories] =

    useState<Category[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Die drei Datenbereiche werden unabhängig voneinander geladen.
    async function loadPageData() {
      const loadHome = async () => {
        try {
          const snapshot = await getDoc(doc(db, "siteSettings", "home"));
          if (!cancelled && snapshot.exists()) {
            setHomeSettings(snapshot.data() as HomeSettings);
          }
        } catch (error) {
          console.error("Hiba a főoldal beállításainak betöltésekor:", error);
        }
      };

      const loadContact = async () => {
        try {
          const snapshot = await getDoc(doc(db, "siteSettings", "contact"));
          if (!cancelled && snapshot.exists()) {
            const data = snapshot.data();
            setContact({
              address: {
                hu: data.address?.hu ?? "",
                ro: data.address?.ro ?? "",
              },
              phone: data.phone ?? "",
            });
          }
        } catch (error) {
          console.error("Hiba a kapcsolati adatok betöltésekor:", error);
        }
      };

      const loadCategories = async () => {
        try {
          // Ohne orderBy werden auch Kategorien ohne Sortierfeld geladen.
          const snapshot = await getDocs(collection(db, "categories"));
          const loadedCategories: Category[] = snapshot.docs
            .map((document) => {
              const data = document.data();
              return {
                id: document.id,
                slug: typeof data.slug === "string" ? data.slug : "",
                order: typeof data.order === "number" ? data.order : 0,
                active: data.active === true,
                title: {
                  hu: data.title?.hu ?? "",
                  ro: data.title?.ro ?? "",
                },
                description: {
                  hu: data.cardDescription?.hu ?? data.description?.hu ?? "",
                  ro: data.cardDescription?.ro ?? data.description?.ro ?? "",
                },
                cardImageUrl: data.cardImageUrl ?? "",
              };
            })
            .filter((category) => category.active)
            .sort((a, b) => a.order - b.order);

          if (!cancelled) setCategories(loadedCategories);
        } catch (error) {
          console.error("Hiba a kategóriák betöltésekor:", error);
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      await Promise.all([loadHome(), loadContact(), loadCategories()]);
    }

    void loadPageData();
    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================

  const firebaseDescription =

    language === "hu"

      ? homeSettings?.description?.hu

      : homeSettings?.description?.ro;

  const heroDescription =

    firebaseDescription?.trim() ||

    t.heroDescription;

  // =========================================================

  // Közös weboldal-háttérkép

  // =========================================================

  const backgroundImageUrl =

    homeSettings?.backgroundImageUrl ?? "";

  // =========================================================

  // Kapcsolati adatok

  // =========================================================

  const contactAddress =

    language === "ro"

      ? contact.address.ro

      : contact.address.hu;

  const contactPhone =

    contact.phone.trim();

  const phoneHref =

    contactPhone

      ? `tel:${contactPhone.replace(/[^\d+]/g, "")}`

      : "";

  return (

    <div

      className="min-h-screen bg-[#f4f1eb] bg-cover bg-center bg-fixed bg-no-repeat text-[#222b31]"

      style={

        backgroundImageUrl

          ? {

              backgroundImage: `linear-gradient(

                rgba(247,244,238,0.76),

                rgba(247,244,238,0.88)

              ), url("${backgroundImageUrl}")`,

            }

          : undefined

      }

    >

      {/* =====================================================

          FEJLÉC

      ===================================================== */}

      <header className="border-b border-black/5 bg-white shadow-sm">

        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">

          {/* Logó */}

          <Link

            href="/"

            className="flex items-center gap-3"

          >

            <Image

              src="/images/logo-mark.svg"

              alt={t.siteName}

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

                  {t.heroTitle2}

                  {" "}

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

          <div className="flex items-center gap-2 sm:gap-4">

            <Link

              href="/kapcsolat"

              className="hidden text-sm font-medium text-gray-700 transition hover:text-orange-600 sm:block"

            >

              {t.contact}

            </Link>

            <LanguageSelector />

            <Link

              href="/admin"

              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-orange-600"

            >

              {t.admin}

            </Link>

          </div>

        </div>

      </header>

      {/* =====================================================

          FŐOLDAL SZÖVEG

      ===================================================== */}

      <section className="mx-auto max-w-5xl px-5 pb-10 pt-12 text-center sm:px-6 sm:pt-16">

        <h1 className="mb-5 text-4xl font-extrabold tracking-tight sm:text-5xl">

          <span className="text-orange-600">

            {t.heroTitle1}

          </span>

          <span>

            {" "}

            {t.heroTitle2}

            {" "}

          </span>

          <span className="text-orange-600">

            {t.heroTitle3}

          </span>

        </h1>

        <p className="mx-auto max-w-3xl whitespace-pre-line text-left text-lg leading-relaxed text-gray-700 sm:text-xl">

          {heroDescription}

        </p>

        <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-orange-500" />

      </section>

      {/* =====================================================

          KATEGÓRIÁK

      ===================================================== */}

      <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-6">

        {loading ? (

          <div className="py-12 text-center text-gray-500">

            Betöltés...

          </div>

        ) : categories.length === 0 ? (

          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

            <p className="text-gray-500">

              Jelenleg nincs elérhető kategória.

            </p>

          </div>

        ) : (

          <div className="grid gap-6 md:grid-cols-2">

            {categories.map((category) => {

              const categoryTitle =

                language === "hu"

                  ? category.title.hu

                  : category.title.ro ||

                    category.title.hu;

              const categoryDescription =

                language === "hu"

                  ? category.description.hu

                  : category.description.ro ||

                    category.description.hu;

              return (

                <Link

                  key={category.id}

                  href={`/kategoria/${category.slug || category.id}`}

                  className="group overflow-hidden rounded-[24px] bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl"

                >

                  <div className="flex min-h-[190px]">

                    {/* Kép */}

                    <div className="w-[42%] shrink-0 bg-gray-100">

                      {category.cardImageUrl ? (

                        <img

                          src={category.cardImageUrl}

                          alt={categoryTitle}

                          className="h-full min-h-[190px] w-full object-cover"

                        />

                      ) : (

                        <div className="flex h-full min-h-[190px] items-center justify-center text-4xl text-gray-300">

                          📁

                        </div>

                      )}

                    </div>

                    {/* Szöveg */}

                    <div className="flex min-w-0 flex-1 flex-col justify-center p-6">

                      <h2 className="text-2xl font-bold leading-tight text-[#222b31] transition group-hover:text-orange-600">

                        {categoryTitle}

                      </h2>

                      {categoryDescription && (

                        <p className="mt-3 line-clamp-3 leading-relaxed text-gray-600">

                          {categoryDescription}

                        </p>

                      )}

                      <div className="mt-5 font-semibold text-orange-600">

                        →

                      </div>

                    </div>

                  </div>

                </Link>

              );

            })}

          </div>

        )}

      </main>

      {/* =====================================================

          LÁBLÉC

      ===================================================== */}

      <footer className="bg-[#222b31] text-white">

        <div className="mx-auto max-w-6xl px-6 py-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex flex-col gap-3 text-sm text-gray-200 sm:flex-row sm:gap-8">

              {contactAddress && (

                <div className="flex items-center gap-2">

                  <span className="text-lg">

                    📍

                  </span>

                  <span>

                    {contactAddress}

                  </span>

                </div>

              )}

              {contactPhone && (

                <div className="flex items-center gap-2">

                  <span className="text-lg">

                    ☎

                  </span>

                  <a

                    href={phoneHref}

                    className="transition hover:text-orange-400"

                  >

                    {contactPhone}

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