"use client";

import { useState } from "react";
import Link from "next/link";

export default function UjTermekPage() {
  const [productType, setProductType] = useState("rental");

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">

        {/* Fejléc */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Adminisztráció
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#222b31]">
              Új termék
            </h1>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            ← Vissza
          </Link>
        </div>

        <form className="space-y-6 rounded-[28px] bg-white p-6 shadow-lg sm:p-8">

          {/* Termék típusa */}
          <section>
            <label className="mb-3 block font-bold text-gray-800">
              Termék típusa
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setProductType("rental")}
                className={`rounded-2xl border-2 p-4 font-semibold transition ${
                  productType === "rental"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 bg-white text-gray-600"
                }`}
              >
                🔧 Bérelhető
              </button>

              <button
                type="button"
                onClick={() => setProductType("sale")}
                className={`rounded-2xl border-2 p-4 font-semibold transition ${
                  productType === "sale"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 bg-white text-gray-600"
                }`}
              >
                🏷️ Eladó
              </button>

              <button
                type="button"
                onClick={() => setProductType("both")}
                className={`rounded-2xl border-2 p-4 font-semibold transition ${
                  productType === "both"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 bg-white text-gray-600"
                }`}
              >
                🔄 Mindkettő
              </button>
            </div>
          </section>

          {/* Kategória */}
          <section>
            <label className="mb-2 block font-semibold">
              Kategória
            </label>

            <select className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500">
              <option value="">Válassz kategóriát...</option>
              <option value="scaffolding">Állványzat</option>
              <option value="other">Egyéb</option>
            </select>
          </section>

          {/* Megnevezések */}
          <section className="space-y-4">
            <h2 className="border-b pb-2 text-lg font-bold">
              Megnevezések
            </h2>

            <Input
              label="🇭🇺 Magyar megnevezés"
              placeholder="pl. Állványkeret"
            />

            <Input
              label="🇷🇴 Román megnevezés"
              placeholder="pl. Cadru de schelă"
            />

            <Input
              label="🇩🇪 Német megnevezés"
              placeholder="pl. Stellrahmen"
            />
          </section>

          {/* Termékadatok */}
          <section className="space-y-4">
            <h2 className="border-b pb-2 text-lg font-bold">
              Termékadatok
            </h2>

            <Input
              label="Méret"
              placeholder="pl. 2,00 × 0,73 m"
            />

            <Input
              label="Készlet / darabszám"
              type="number"
              placeholder="0"
            />

            {(productType === "sale" || productType === "both") && (
              <Input
                label="Eladási ár"
                type="number"
                placeholder="0"
              />
            )}

            {(productType === "rental" || productType === "both") && (
              <Input
                label="Bérleti díj"
                type="number"
                placeholder="0"
              />
            )}
          </section>

          {/* Leírások */}
          <section className="space-y-4">
            <h2 className="border-b pb-2 text-lg font-bold">
              Leírás
            </h2>

            <TextArea
              label="🇭🇺 Magyar leírás"
              placeholder="Rövid magyar termékleírás..."
            />

            <TextArea
              label="🇷🇴 Román leírás"
              placeholder="Rövid román termékleírás..."
            />
          </section>

          {/* Kép */}
          <section>
            <label className="mb-2 block font-semibold">
              Termékkép
            </label>

            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
              <div className="text-4xl">📷</div>

              <div className="mt-3">
                A képfeltöltést külön kötjük be.
              </div>
            </div>
          </section>

          {/* Aktív */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50 p-4">
            <input
              type="checkbox"
              defaultChecked
              className="h-5 w-5 accent-orange-600"
            />

            <span className="font-semibold">
              A termék aktív és megjelenhet a weboldalon
            </span>
          </label>

          {/* Mentés */}
          <button
            type="button"
            className="w-full rounded-2xl bg-orange-600 px-6 py-4 text-lg font-bold text-white shadow-md transition hover:bg-orange-700"
          >
            💾 Termék mentése
          </button>

        </form>
      </div>
    </main>
  );
}

function Input({
  label,
  type = "text",
  placeholder = "",
}: {
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block font-semibold">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500"
      />
    </div>
  );
}

function TextArea({
  label,
  placeholder = "",
}: {
  label: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block font-semibold">
        {label}
      </label>

      <textarea
        rows={4}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500"
      />
    </div>
  );
}