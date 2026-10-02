"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import LanguageSelector from "../components/LanguageSelector";
import { useLanguage } from "../context/LanguageContext";

export default function AllvanyberlesPage() {
  const { t } = useLanguage();

  const [baseQuantity, setBaseQuantity] = useState(1);
  const [platformQuantity, setPlatformQuantity] = useState(1);

  const baseAvailable = 40;
  const platformAvailable = 24;

  function changeQuantity(
    value: number,
    max: number,
    setter: (value: number) => void
  ) {
    if (value < 1) {
      setter(1);
      return;
    }

    if (value > max) {
      setter(max);
      return;
    }

    setter(value);
  }

  return (
    <div className="min-h-screen bg-[#f4f1eb] text-[#222b31]">

      {/* Fejléc */}
      <header className="relative z-20 border-b border-black/5 bg-white/95 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">

          {/* Logó */}
          <Link href="/" className="flex items-center gap-3">

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


          {/* Jobb oldal */}
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


      {/* Háttér */}
      <div
        className="bg-cover bg-center bg-fixed bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(rgba(247,244,238,0.64), rgba(247,244,238,0.78)), url('/images/hero-bg.jpg')",
        }}
      >

        {/* Oldal címe */}
        <section className="mx-auto max-w-6xl px-6 pb-8 pt-14">

          <div className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-lg backdrop-blur-sm sm:p-10">

            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-orange-600">
              {t.scaffoldPageEyebrow}
            </p>

            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {t.scaffoldPageTitle}
            </h1>

            <p className="max-w-3xl text-lg leading-relaxed text-gray-600">
              {t.scaffoldPageDescription}
            </p>

          </div>

        </section>


        {/* Alkatrészek */}
        <main className="mx-auto max-w-6xl px-6 pb-16">

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

            {/* ================================================= */}
            {/* ÁLLVÁNYLÁB */}
            {/* ================================================= */}

            <article className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl">

              {/* Kép */}
              <div className="relative h-[340px] w-full bg-gray-100">

                <Image
                  src="/images/scaffold-base.jpg"
                  alt={t.scaffoldBaseTitle}
                  fill
                  className="object-contain p-4"
                />

              </div>


              {/* Tartalom */}
              <div className="p-7 sm:p-8">

                <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
                  {t.scaffoldBaseTitle}
                </h2>

                <p className="mb-6 text-gray-600">
                  {t.scaffoldBaseSubtitle}
                </p>


                {/* Adatok */}
                <div className="space-y-4 border-y border-gray-100 py-5">

                  <InfoRow
                    label={t.scaffoldBaseRangeLabel}
                    value={t.scaffoldBaseRange}
                  />

                  <InfoRow
                    label={t.scaffoldBaseWeightLabel}
                    value={t.scaffoldBaseWeight}
                  />

                  <InfoRow
                    label={t.scaffoldBaseMaterialLabel}
                    value={t.scaffoldBaseMaterial}
                  />

                  <InfoRow
                    label={t.compatibleLabel}
                    value={t.compatibleValue}
                  />

                </div>


                {/* Ár */}
                <div className="mt-6 rounded-2xl bg-orange-50 p-5">

                  <p className="text-sm font-medium text-gray-600">
                    {t.rentalPrice}
                  </p>

                  <div className="mt-1 flex items-baseline gap-2">

                    <span className="text-3xl font-bold text-orange-600">
                      5
                    </span>

                    <span className="font-semibold text-orange-600">
                      {t.perPiecePerDay}
                    </span>

                  </div>

                </div>


                {/* Elérhető */}
                <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">

                  <span className="font-medium text-gray-600">
                    {t.available}
                  </span>

                  <span className="font-bold text-[#222b31]">
                    {baseAvailable} {t.pieces}
                  </span>

                </div>


                {/* Darabszám */}
                <div className="mt-6">

                  <p className="mb-3 font-semibold">
                    {t.quantity}
                  </p>

                  <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <button
                      type="button"
                      onClick={() =>
                        changeQuantity(
                          baseQuantity - 1,
                          baseAvailable,
                          setBaseQuantity
                        )
                      }
                      className="flex h-12 w-12 items-center justify-center text-xl font-bold transition hover:bg-gray-100"
                    >
                      −
                    </button>


                    <input
                      type="number"
                      min={1}
                      max={baseAvailable}
                      value={baseQuantity}
                      onChange={(e) =>
                        changeQuantity(
                          Number(e.target.value),
                          baseAvailable,
                          setBaseQuantity
                        )
                      }
                      className="h-12 w-20 border-x border-gray-200 text-center text-lg font-semibold outline-none"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        changeQuantity(
                          baseQuantity + 1,
                          baseAvailable,
                          setBaseQuantity
                        )
                      }
                      className="flex h-12 w-12 items-center justify-center text-xl font-bold transition hover:bg-gray-100"
                    >
                      +
                    </button>

                  </div>

                </div>

              </div>

            </article>


            {/* ================================================= */}
            {/* ÁLLVÁNYPADLÓ */}
            {/* ================================================= */}

            <article className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl">

              {/* Kép */}
              <div className="relative h-[340px] w-full bg-gray-100">

                <Image
                  src="/images/scaffold-platform.jpg"
                  alt={t.scaffoldPlatformTitle}
                  fill
                  className="object-contain p-4"
                />

              </div>


              {/* Tartalom */}
              <div className="p-7 sm:p-8">

                <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
                  {t.scaffoldPlatformTitle}
                </h2>

                <p className="mb-6 text-gray-600">
                  {t.scaffoldPlatformSubtitle}
                </p>


                {/* Adatok */}
                <div className="space-y-4 border-y border-gray-100 py-5">

                  <InfoRow
                    label={t.scaffoldPlatformSizeLabel}
                    value={t.scaffoldPlatformSize}
                  />

                  <InfoRow
                    label={t.scaffoldPlatformTypeLabel}
                    value={t.scaffoldPlatformType}
                  />

                  <InfoRow
                    label={t.scaffoldPlatformWeightLabel}
                    value={t.scaffoldPlatformWeight}
                  />

                  <InfoRow
                    label={t.compatibleLabel}
                    value={t.compatibleValue}
                  />

                </div>


                {/* Ár */}
                <div className="mt-6 rounded-2xl bg-orange-50 p-5">

                  <p className="text-sm font-medium text-gray-600">
                    {t.rentalPrice}
                  </p>

                  <div className="mt-1 flex items-baseline gap-2">

                    <span className="text-3xl font-bold text-orange-600">
                      10
                    </span>

                    <span className="font-semibold text-orange-600">
                      {t.perPiecePerDay}
                    </span>

                  </div>

                </div>


                {/* Elérhető */}
                <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">

                  <span className="font-medium text-gray-600">
                    {t.available}
                  </span>

                  <span className="font-bold text-[#222b31]">
                    {platformAvailable} {t.pieces}
                  </span>

                </div>


                {/* Darabszám */}
                <div className="mt-6">

                  <p className="mb-3 font-semibold">
                    {t.quantity}
                  </p>

                  <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <button
                      type="button"
                      onClick={() =>
                        changeQuantity(
                          platformQuantity - 1,
                          platformAvailable,
                          setPlatformQuantity
                        )
                      }
                      className="flex h-12 w-12 items-center justify-center text-xl font-bold transition hover:bg-gray-100"
                    >
                      −
                    </button>


                    <input
                      type="number"
                      min={1}
                      max={platformAvailable}
                      value={platformQuantity}
                      onChange={(e) =>
                        changeQuantity(
                          Number(e.target.value),
                          platformAvailable,
                          setPlatformQuantity
                        )
                      }
                      className="h-12 w-20 border-x border-gray-200 text-center text-lg font-semibold outline-none"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        changeQuantity(
                          platformQuantity + 1,
                          platformAvailable,
                          setPlatformQuantity
                        )
                      }
                      className="flex h-12 w-12 items-center justify-center text-xl font-bold transition hover:bg-gray-100"
                    >
                      +
                    </button>

                  </div>

                </div>

              </div>

            </article>

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
    <div className="flex items-start justify-between gap-6">

      <span className="font-semibold text-gray-700">
        {label}
      </span>

      <span className="text-right text-gray-600">
        {value}
      </span>

    </div>
  );
}