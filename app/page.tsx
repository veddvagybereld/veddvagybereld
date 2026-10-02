"use client";

import Image from "next/image";
import Link from "next/link";

import LanguageSelector from "./components/LanguageSelector";
import { useLanguage } from "./context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f4f1eb] text-[#222b31]">

      {/* Fejléc */}
      <header className="relative z-20 border-b border-black/5 bg-white/95 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">

          {/* Logó / név */}
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <Image
              src="/images/logo-mark.svg"
              alt="Vedd vagy Béreld"
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
                  {" "}{t.heroTitle2}{" "}
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

          {/* Jobb oldali menü */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
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

      {/* Teljes háttér */}
      <div
        className="bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(rgba(247,244,238,0.72), rgba(247,244,238,0.80)), url('/images/hero-bg.jpg')",
        }}
      >

        {/* Bemutatkozás */}
        <section className="mx-auto max-w-6xl px-6 pb-12 pt-16 text-center sm:pt-20">

          <h1 className="mb-5 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
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
          </h1>

          <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-[#333d43] sm:text-xl">
            {t.heroDescription}
          </p>

          <p className="mt-5 text-lg italic text-gray-600 sm:text-xl">
            {t.heroSlogan}
          </p>

          <div className="mx-auto mt-3 h-1 w-32 rounded-full bg-orange-500" />

        </section>

        {/* Kártyák */}
        <main className="mx-auto max-w-5xl px-5 pb-20 sm:px-6">

          <div className="flex flex-col gap-8">

            {/* Használt termékek */}
            <Link
              href="/hasznalt-termekek"
              className="group overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >

              <div className="grid grid-cols-1 md:grid-cols-2">

                <div
                  className="min-h-[260px] bg-gray-200 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(0,0,0,0.04), rgba(0,0,0,0.04)), url('/images/used-products.jpg')",
                  }}
                >
                  <div className="flex h-full min-h-[260px] items-end p-5">
                    <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow">
                      🚲 &nbsp; 🌱 &nbsp; 🚜
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center p-7 sm:p-9">

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-2xl">
                    🏷️
                  </div>

                  <p className="mb-3 text-xs font-semibold tracking-[0.15em] text-gray-500">
                    {t.usedProductsSmallTitle}
                  </p>

                  <h2 className="mb-4 text-3xl font-bold leading-tight text-[#222b31]">
                    {t.usedProductsTitle}
                  </h2>

                  <p className="mb-7 leading-relaxed text-gray-600">
                    {t.usedProductsDescription}
                  </p>

                  <div className="rounded-xl bg-orange-600 px-6 py-3.5 text-center font-semibold text-white transition group-hover:bg-orange-700">
                    {t.usedProductsButton} →
                  </div>

                </div>
              </div>
            </Link>

            {/* Állványok */}
            <Link
              href="/allvanyberles"
              className="group overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >

              <div className="grid grid-cols-1 md:grid-cols-2">

                <div
                  className="min-h-[260px] bg-gray-200 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(0,0,0,0.03), rgba(0,0,0,0.03)), url('/images/scaffolding.jpg')",
                  }}
                >
                  <div className="flex h-full min-h-[260px] items-end p-5">
                    <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow">
                      ▦ Állványrendszerek
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center p-7 sm:p-9">

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-3xl font-bold text-orange-600">
                    ▦
                  </div>

                  <p className="mb-3 text-xs font-semibold tracking-[0.15em] text-gray-500">
                    {t.scaffoldSmallTitle}
                  </p>

                  <h2 className="mb-4 text-3xl font-bold leading-tight text-[#222b31]">
                    {t.scaffoldTitle}
                  </h2>

                  <p className="mb-7 leading-relaxed text-gray-600">
                    {t.scaffoldDescription}
                  </p>

                  <div className="rounded-xl bg-orange-600 px-6 py-3.5 text-center font-semibold text-white transition group-hover:bg-orange-700">
                    {t.scaffoldButton} →
                  </div>

                </div>
              </div>
            </Link>

          </div>
        </main>

      </div>

      {/* Alsó kapcsolat */}
      <footer
        id="kapcsolat"
        className="bg-[#222b31] text-white"
      >

        <div className="mx-auto max-w-6xl px-6 py-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex flex-col gap-3 text-sm text-gray-200 sm:flex-row sm:gap-8">

              <div className="flex items-center gap-2">
                <span className="text-lg">📍</span>
                <span>{t.address}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-lg">☎</span>
                <span>{t.phone}</span>
              </div>

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