"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

type Category = {
  id: string;
  order: number;
  title: {
    hu: string;
  };
  cardImageUrl: string;
};

export default function KategoriakPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const categoriesRef = collection(db, "categories");

      const categoriesQuery = query(
        categoriesRef,
        orderBy("order", "asc")
      );

      const snapshot = await getDocs(categoriesQuery);

      const result: Category[] = snapshot.docs.map((document) => {
        const data = document.data();

        return {
          id: document.id,
          order: data.order ?? 0,
          title: {
            hu: data.title?.hu ?? "",
          },
          cardImageUrl: data.cardImageUrl ?? "",
        };
      });

      setCategories(result);
    } catch (err) {
      console.error("Hiba a kategóriák betöltésekor:", err);
      setError("Nem sikerült betölteni a kategóriákat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-7 sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* Fejléc */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Adminisztráció
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#222b31]">
              Kategóriák
            </h1>

            <p className="mt-2 text-gray-600">
              A főoldalon megjelenő kategóriakártyák kezelése.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 shadow-sm"
          >
            ← Vissza
          </Link>
        </div>

        {/* Új kategória */}
        <div className="mb-6">
          <Link
            href="/admin/kategoriak/uj"
            className="inline-block rounded-xl bg-orange-600 px-6 py-3 font-bold text-white shadow-sm"
          >
            + Új kategória
          </Link>
        </div>

        {/* Betöltés */}
        {loading && (
          <div className="rounded-2xl bg-white p-8 shadow">
            <p className="text-gray-600">
              Kategóriák betöltése...
            </p>
          </div>
        )}

        {/* Hiba */}
        {error && (
          <div className="rounded-2xl bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {/* Üres lista */}
        {!loading && !error && categories.length === 0 && (
          <div className="rounded-[24px] bg-white p-8 text-center shadow-lg">
            <div className="mb-3 text-5xl">📁</div>

            <h2 className="text-xl font-bold text-[#222b31]">
              Még nincs kategória
            </h2>

            <p className="mt-2 text-gray-600">
              Az első kategóriát az „+ Új kategória” gombbal
              hozhatod létre.
            </p>
          </div>
        )}

        {/* Kategóriakártyák */}
        {!loading && !error && categories.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex h-[155px] overflow-hidden rounded-[20px] bg-white shadow-md"
              >
                {/* Bal oldal: kisebb kép keretben */}
                <div className="flex w-[135px] shrink-0 items-center justify-center p-3 sm:w-[150px]">
                  <div className="h-[115px] w-[115px] overflow-hidden rounded-xl bg-gray-100 sm:h-[125px] sm:w-[125px]">
                    {category.cardImageUrl ? (
                      <img
                        src={category.cardImageUrl}
                        alt={category.title.hu || "Kategóriakép"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-xs text-gray-400">
                        Nincs kép
                      </div>
                    )}
                  </div>
                </div>

                {/* Jobb oldal */}
                <div className="flex min-w-0 flex-1 flex-col justify-center p-4">
                  <div className="mb-1 text-sm font-bold text-orange-600">
                    {category.order}.
                  </div>

                  <h2 className="line-clamp-2 text-lg font-bold leading-tight text-[#222b31]">
                    {category.title.hu || "Névtelen kategória"}
                  </h2>

                  <div className="mt-4">
                    <Link
                      href={`/admin/kategoriak/${category.id}`}
                      className="inline-block rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Szerkesztés
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}