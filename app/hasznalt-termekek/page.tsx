"use client";

import Image from "next/image";
import Link from "next/link";

import LanguageSelector from "../components/LanguageSelector";
import { useLanguage } from "../context/LanguageContext";

export default function HasznaltTermekekPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f4f1eb] text-[#222b31]">

      {/* ===================================================== */}
      {/* FEJLÉC */}
      {/* ===================================================== */}

      <header className="relative z-20 border-b border-black/5 bg-white/95 shadow-sm">

        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">

          {/* Logó */}
          <Link
            href="/"
            className="flex items-center gap-3"
          >

            <Image
              src="/images/logo-mark.svg"
              alt="Logo"
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


          {/* Jobb oldali menü */}
          <div className="flex items-center gap-2 sm:gap-4">

          <Link
            href="/kapcsolat"
            className="hidden text-sm font-medium text-gray-700 transition hover:text-orange-600 sm:block"
          >
            {t.contact}
          </Link>

            <LanguageSelector />

          </div>

        </div>

      </header>


      {/* ===================================================== */}
      {/* HÁTTÉR */}
      {/* ===================================================== */}

      <div
        className="bg-cover bg-center bg-fixed bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(rgba(247,244,238,0.62), rgba(247,244,238,0.78)), url('/images/hero-bg.jpg')",
        }}
      >

        {/* Oldal címe */}
        <section className="mx-auto max-w-6xl px-6 pb-8 pt-14">

          <div className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-lg backdrop-blur-sm sm:p-10">

            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-orange-600">
              {t.usedPageEyebrow}
            </p>

            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {t.usedPageTitle}
            </h1>

            <p className="max-w-3xl text-lg leading-relaxed text-gray-600">
              {t.usedPageDescription}
            </p>

          </div>

        </section>


        {/* ===================================================== */}
        {/* TERMÉKEK */}
        {/* ===================================================== */}

        <main className="mx-auto max-w-6xl px-6 pb-16">

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">

            {/* ================================================= */}
            {/* BICIKLI */}
            {/* ================================================= */}

            <article className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl">

              {/* Kép */}
              <div className="relative h-[260px] w-full bg-gray-50">

                <Image
                  src="/images/bicikli.jpg"
                  alt={t.bicycleTitle}
                  fill
                  className="object-contain p-4"
                />

              </div>


              {/* Tartalom */}
              <div className="p-6">

                <h2 className="mb-2 text-2xl font-bold">
                  {t.bicycleTitle}
                </h2>

                <p className="mb-6 min-h-[48px] text-gray-600">
                  {t.bicycleSubtitle}
                </p>


                <div className="space-y-4 border-y border-gray-100 py-5">

                  <InfoRow
                    label={t.bicycleWheelLabel}
                    value={t.bicycleWheelValue}
                  />

                  <InfoRow
                    label={t.bicycleGearLabel}
                    value={t.bicycleGearValue}
                  />

                  <InfoRow
                    label={t.bicycleConditionLabel}
                    value={t.bicycleConditionValue}
                  />

                </div>


                {/* Ár */}
                <div className="mt-6 rounded-2xl bg-orange-50 p-5">

                  <p className="text-sm font-medium text-gray-600">
                    {t.price}
                  </p>

                  <p className="mt-1 text-3xl font-bold text-orange-600">
                    250 lej
                  </p>

                </div>

              </div>

            </article>


            {/* ================================================= */}
            {/* TRAKTOR */}
            {/* ================================================= */}

            <article className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl">

              {/* Kép */}
              <div className="relative h-[260px] w-full bg-gray-50">

                <Image
                  src="/images/traktor.jpg"
                  alt={t.tractorTitle}
                  fill
                  className="object-contain p-4"
                />

              </div>


              {/* Tartalom */}
              <div className="p-6">

                <h2 className="mb-2 text-2xl font-bold">
                  {t.tractorTitle}
                </h2>

                <p className="mb-6 min-h-[48px] text-gray-600">
                  {t.tractorSubtitle}
                </p>


                <div className="space-y-4 border-y border-gray-100 py-5">

                  <InfoRow
                    label={t.tractorEngineLabel}
                    value={t.tractorEngineValue}
                  />

                  <InfoRow
                    label={t.tractorPowerLabel}
                    value={t.tractorPowerValue}
                  />

                  <InfoRow
                    label={t.tractorYearLabel}
                    value={t.tractorYearValue}
                  />

                  <InfoRow
                    label={t.tractorConditionLabel}
                    value={t.tractorConditionValue}
                  />

                </div>


                {/* Ár */}
                <div className="mt-6 rounded-2xl bg-orange-50 p-5">

                  <p className="text-sm font-medium text-gray-600">
                    {t.price}
                  </p>

                  <p className="mt-1 text-3xl font-bold text-orange-600">
                    2 500 lej
                  </p>

                </div>

              </div>

            </article>


            {/* ================================================= */}
            {/* FŰNYÍRÓ */}
            {/* ================================================= */}

            <article className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl">

              {/* Kép */}
              <div className="relative h-[260px] w-full bg-gray-50">

                <Image
                  src="/images/funyiro.jpg"
                  alt={t.mowerTitle}
                  fill
                  className="object-contain p-4"
                />

              </div>


              {/* Tartalom */}
              <div className="p-6">

                <h2 className="mb-2 text-2xl font-bold">
                  {t.mowerTitle}
                </h2>

                <p className="mb-6 min-h-[48px] text-gray-600">
                  {t.mowerSubtitle}
                </p>


                <div className="space-y-4 border-y border-gray-100 py-5">

                  <InfoRow
                    label={t.mowerWidthLabel}
                    value={t.mowerWidthValue}
                  />

                  <InfoRow
                    label={t.mowerDriveLabel}
                    value={t.mowerDriveValue}
                  />

                  <InfoRow
                    label={t.mowerEngineLabel}
                    value={t.mowerEngineValue}
                  />

                  <InfoRow
                    label={t.mowerConditionLabel}
                    value={t.mowerConditionValue}
                  />

                </div>


                {/* Ár */}
                <div className="mt-6 rounded-2xl bg-orange-50 p-5">

                  <p className="text-sm font-medium text-gray-600">
                    {t.price}
                  </p>

                  <p className="mt-1 text-3xl font-bold text-orange-600">
                    350 lej
                  </p>

                </div>

              </div>

            </article>

          </div>


          {/* ================================================= */}
          {/* VISSZA */}
          {/* ================================================= */}

          <div className="mt-12">

            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-xl bg-[#222b31] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#354149]"
            >
              <span className="text-xl">←</span>

              <span>
                {t.backToHome}
              </span>

            </Link>

          </div>

        </main>

      </div>


      {/* ===================================================== */}
      {/* LÁBLÉC */}
      {/* ===================================================== */}

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


/* ========================================================= */
/* Közös információs sor */
/* ========================================================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">

      <span className="font-semibold text-gray-700">
        {label}
      </span>

      <span className="text-right text-gray-600">
        {value}
      </span>

    </div>
  );
}