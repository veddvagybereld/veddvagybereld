"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* Fejléc */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            Adminisztráció
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#222b31]">
            Admin felület
          </h1>

          <p className="mt-2 text-gray-500">
            Válaszd ki, mit szeretnél szerkeszteni.
          </p>
        </div>

        {/* Admin funkciók */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Kategóriák */}
          <Link
            href="/admin/kategoriak"
            className="group rounded-[28px] bg-white p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
              📂
            </div>

            <h2 className="text-2xl font-bold text-[#222b31]">
              Kategóriák
            </h2>

            <p className="mt-2 leading-relaxed text-gray-500">
              Kategóriák és a hozzájuk tartozó termékek kezelése.
            </p>

            <div className="mt-5 font-semibold text-orange-600">
              Kategóriák kezelése →
            </div>
          </Link>

          {/* Főoldal */}
          <Link
            href="/admin/fooldal"
            className="group rounded-[28px] bg-white p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
              🏠
            </div>

            <h2 className="text-2xl font-bold text-[#222b31]">
              Főoldal szerkesztése
            </h2>

            <p className="mt-2 leading-relaxed text-gray-500">
              A főoldalon megjelenő szövegek szerkesztése.
            </p>

            <div className="mt-5 font-semibold text-orange-600">
              Főoldal szerkesztése →
            </div>
          </Link>

          {/* Kapcsolat */}
          <Link
            href="/admin/kapcsolat"
            className="group rounded-[28px] bg-white p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
              📞
            </div>

            <h2 className="text-2xl font-bold text-[#222b31]">
              Kapcsolat módosítása
            </h2>

            <p className="mt-2 leading-relaxed text-gray-500">
              Cím, telefonszám és további elérhetőségek szerkesztése.
            </p>

            <div className="mt-5 font-semibold text-orange-600">
              Kapcsolati adatok módosítása →
            </div>
          </Link>

          {/* Bérbeadás */}
          <Link
            href="/admin/berbeadasok/uj"
            className="group rounded-[28px] bg-white p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
              📄
            </div>

            <h2 className="text-2xl font-bold text-[#222b31]">
              Új bérbeadás
            </h2>

            <p className="mt-2 leading-relaxed text-gray-500">
              Bérbeadási dokumentum összeállítása és PDF készítése.
            </p>

            <div className="mt-5 font-semibold text-orange-600">
              Bérbeadás indítása →
            </div>
          </Link>

        </div>

        {/* Vissza */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="font-semibold text-gray-600 transition hover:text-orange-600"
          >
            ← Vissza a weboldalra
          </Link>
        </div>

      </div>
    </main>
  );
}