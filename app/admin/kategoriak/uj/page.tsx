"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function UjKategoriaPage() {
  const router = useRouter();

  const [order, setOrder] = useState(1);
  const [titleHu, setTitleHu] = useState("");
  const [titleRo, setTitleRo] = useState("");
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    if (!titleHu.trim()) {
      setMessage("Add meg a kategória magyar nevét.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await addDoc(collection(db, "categories"), {
        order: Number(order),
        active,

        title: {
          hu: titleHu.trim(),
          ro: titleRo.trim(),
        },

        description: {
          hu: "",
          ro: "",
        },

        cardImageUrl: "",

        introMedia: {
          type: "",
          url: "",
        },

        documents: [],

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/admin/kategoriak");
    } catch (error) {
      console.error("Hiba a kategória mentésekor:", error);
      setMessage("Nem sikerült elmenteni a kategóriát.");
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Adminisztráció
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#222b31]">
              Új kategória
            </h1>
          </div>

          <Link
            href="/admin/kategoriak"
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 shadow-sm"
          >
            ← Vissza
          </Link>
        </div>

        <div className="space-y-7 rounded-[28px] bg-white p-6 shadow-lg sm:p-8">

          {/* Sorszám */}
          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Sorszám
            </label>

            <input
              type="number"
              min="1"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-32 rounded-xl border border-gray-300 px-4 py-3"
            />

            <p className="mt-2 text-sm text-gray-500">
              Ez határozza meg a kategória helyét a főoldalon.
            </p>
          </div>

          <hr className="border-gray-200" />

          {/* Magyar */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#222b31]">
              Magyar
            </h2>

            <label className="mb-2 block font-semibold text-gray-700">
              Kategória neve *
            </label>

            <input
              type="text"
              value={titleHu}
              onChange={(e) => setTitleHu(e.target.value)}
              placeholder="pl. Állványok bérlése"
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
          </div>

          {/* Román */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#222b31]">
              Román
            </h2>

            <label className="mb-2 block font-semibold text-gray-700">
              Kategória neve
            </label>

            <input
              type="text"
              value={titleRo}
              onChange={(e) => setTitleRo(e.target.value)}
              placeholder="Román megnevezés"
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
          </div>

          <hr className="border-gray-200" />

          {/* Aktív */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-5 w-5"
            />

            <div>
              <div className="font-semibold text-gray-700">
                Aktív kategória
              </div>

              <div className="text-sm text-gray-500">
                Az aktív kategória megjelenhet a publikus oldalon.
              </div>
            </div>
          </label>

          {message && (
            <div className="rounded-xl bg-orange-50 px-4 py-3 font-medium text-orange-800">
              {message}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-orange-600 px-7 py-3 font-bold text-white shadow-sm disabled:opacity-50"
            >
              {saving ? "Mentés..." : "Kategória mentése"}
            </button>

            <Link
              href="/admin/kategoriak"
              className="rounded-xl border border-gray-300 px-7 py-3 font-semibold text-gray-700"
            >
              Mégse
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}