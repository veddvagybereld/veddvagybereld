"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";

// A magyar kategórianévből webcímben használható azonosítót készít.
function createSlug(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function UjKategoriaPage() {
  const router = useRouter();
  const [order, setOrder] = useState(1);
  const [titleHu, setTitleHu] = useState("");
  const [titleRo, setTitleRo] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function handleTitleChange(value: string) {
    setTitleHu(value);
    if (!slugEdited) setSlug(createSlug(value));
  }

  async function handleSave() {
    if (saving) return;
    if (!titleHu.trim()) {
      setMessage("Add meg a kategória magyar nevét.");
      return;
    }
    const finalSlug = slug.trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(finalSlug)) {
      setMessage("A kategória azonosítója kötelező. Csak kisbetű, szám és kötőjel használható.");
      return;
    }
    if (!Number.isInteger(order) || order < 1) {
      setMessage("A sorszám legalább 1 legyen.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      // Ellenőrzi, hogy az azonosítót használja-e már másik kategória.
      const existing = await getDocs(query(collection(db, "categories"), where("slug", "==", finalSlug)));
      if (!existing.empty) {
        setMessage("Ez a kategóriaazonosító már foglalt. Válassz másikat.");
        return;
      }
      await addDoc(collection(db, "categories"), {
        order: Number(order), active, slug: finalSlug,
        title: { hu: titleHu.trim(), ro: titleRo.trim() },
        description: { hu: "", ro: "" },
        cardDescription: { hu: "", ro: "" },
        intro: { hu: "", ro: "" },
        cardImageUrl: "", media: [],
        introMedia: { type: "", url: "" }, documents: [],
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      router.push("/admin/kategoriak");
    } catch (error) {
      console.error("Fehler beim Speichern der Kategorie:", error);
      setMessage("Nem sikerült elmenteni a kategóriát.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">Adminisztráció</p>
            <h1 className="mt-1 text-3xl font-bold text-[#222b31]">Új kategória</h1>
          </div>
          <Link href="/admin/kategoriak" className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 shadow-sm">← Vissza</Link>
        </div>
        <div className="space-y-7 rounded-[28px] bg-white p-6 shadow-lg sm:p-8">
          <div>
            <label className="mb-2 block font-semibold text-gray-700">Sorszám</label>
            <input type="number" min="1" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-32 rounded-xl border border-gray-300 px-4 py-3" />
            <p className="mt-2 text-sm text-gray-500">Ez határozza meg a kategória helyét a főoldalon.</p>
          </div>
          <hr className="border-gray-200" />
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#222b31]">Magyar</h2>
            <label className="mb-2 block font-semibold text-gray-700">Kategória neve *</label>
            <input type="text" value={titleHu} onChange={(e) => handleTitleChange(e.target.value)} placeholder="pl. Állványok bérlése" className="w-full rounded-xl border border-gray-300 px-4 py-3" />
          </div>
          <div>
            <label className="mb-2 block font-semibold text-gray-700">Kategória azonosítója (webcím) *</label>
            <input type="text" required value={slug} onChange={(e) => { setSlug(e.target.value.toLowerCase()); setSlugEdited(true); }} placeholder="pl. allvanyok-berlese" className="w-full rounded-xl border border-gray-300 px-4 py-3" />
            <p className="mt-2 text-sm text-gray-500">A névből automatikusan kitöltjük, de módosítható. Csak kisbetűk, számok és kötőjelek használhatók. Kötelező és egyedi.</p>
            <p className="mt-1 break-all text-sm text-orange-600">/kategoria/{slug || "..."}</p>
          </div>
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#222b31]">Román</h2>
            <label className="mb-2 block font-semibold text-gray-700">Kategória neve</label>
            <input type="text" value={titleRo} onChange={(e) => setTitleRo(e.target.value)} placeholder="Román megnevezés" className="w-full rounded-xl border border-gray-300 px-4 py-3" />
          </div>
          <hr className="border-gray-200" />
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-5 w-5" />
            <div>
              <div className="font-semibold text-gray-700">Aktív kategória</div>
              <div className="text-sm text-gray-500">Az aktív kategória megjelenhet a publikus oldalon.</div>
            </div>
          </label>
          {message && <div className="rounded-xl bg-orange-50 px-4 py-3 font-medium text-orange-800">{message}</div>}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleSave} disabled={saving} className="rounded-xl bg-orange-600 px-7 py-3 font-bold text-white shadow-sm disabled:opacity-50">{saving ? "Mentés..." : "Kategória mentése"}</button>
            <Link href="/admin/kategoriak" className="rounded-xl border border-gray-300 px-7 py-3 font-semibold text-gray-700">Mégse</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
