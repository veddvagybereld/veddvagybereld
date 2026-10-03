"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../../lib/firebase";

type ContactData = {
  name: string;
  addressHu: string;
  addressRo: string;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
};

export default function AdminKapcsolatPage() {
  const [form, setForm] = useState<ContactData>({
    name: "MolnarRent",
    addressHu: "",
    addressRo: "",
    phone: "",
    email: "",
    website: "",
    whatsapp: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadContact() {
      try {
        const contactRef = doc(
          db,
          "siteSettings",
          "contact"
        );

        const contactSnap = await getDoc(contactRef);

        if (contactSnap.exists()) {
          const data = contactSnap.data();

          setForm({
            name: data.name ?? "MolnarRent",
            addressHu: data.address?.hu ?? "",
            addressRo: data.address?.ro ?? "",
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

        setMessage(
          "A kapcsolati adatok betöltése nem sikerült."
        );

        setIsError(true);
      } finally {
        setLoading(false);
      }
    }

    loadContact();
  }, []);

  function updateField(
    field: keyof ContactData,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setMessage("");
    setIsError(false);
  }

  function copyHuToRo() {
    setForm((prev) => ({
      ...prev,
      addressRo: prev.addressHu,
    }));

    setMessage(
      "A magyar cím át lett másolva a román mezőbe."
    );

    setIsError(false);
  }

  async function saveContact() {
    if (!form.name.trim()) {
      setMessage("A név megadása kötelező.");
      setIsError(true);
      return;
    }

    if (!form.addressHu.trim()) {
      setMessage(
        "A magyar cím megadása kötelező."
      );
      setIsError(true);
      return;
    }

    if (!form.addressRo.trim()) {
      setMessage(
        "A román cím megadása kötelező."
      );
      setIsError(true);
      return;
    }

    if (!form.phone.trim()) {
      setMessage(
        "A telefonszám megadása kötelező."
      );
      setIsError(true);
      return;
    }

    setSaving(true);
    setMessage("");
    setIsError(false);

    try {
      const contactRef = doc(
        db,
        "siteSettings",
        "contact"
      );

      await setDoc(
        contactRef,
        {
          name: form.name.trim(),

          address: {
            hu: form.addressHu.trim(),
            ro: form.addressRo.trim(),
          },

          phone: form.phone.trim(),
          email: form.email.trim(),
          website: form.website.trim(),
          whatsapp: form.whatsapp.trim(),

          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setMessage(
        "Kapcsolati adatok sikeresen elmentve."
      );

      setIsError(false);
    } catch (error) {
      console.error(
        "Kapcsolati adatok mentési hiba:",
        error
      );

      setMessage(
        "A kapcsolati adatok mentése nem sikerült."
      );

      setIsError(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] px-5 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-600">
            Kapcsolati adatok betöltése...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">

        {/* Fejléc */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
              Admin
            </p>

            <h1 className="text-3xl font-bold text-[#222b31]">
              Kapcsolati adatok
            </h1>

            <p className="mt-2 text-gray-600">
              A weboldalon és a bérbeadási
              dokumentumokon megjelenő adatok.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 shadow-sm transition hover:border-orange-400 hover:text-orange-600"
          >
            ← Vissza
          </Link>

        </div>

        {/* Űrlap */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">

          <div className="space-y-7">

            {/* Név */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Név
              </label>

              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  updateField(
                    "name",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="MolnarRent"
              />
            </div>

            {/* Magyar cím */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Cím – magyar
              </label>

              <textarea
                value={form.addressHu}
                onChange={(e) =>
                  updateField(
                    "addressHu",
                    e.target.value
                  )
                }
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="Magyar nyelvű cím"
              />
            </div>

            {/* HU → RO */}
            <div>
              <button
                type="button"
                onClick={copyHuToRo}
                className="rounded-xl border border-orange-300 bg-orange-50 px-5 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
              >
                HU → RO másolás
              </button>
            </div>

            {/* Román cím */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Cím – román
              </label>

              <textarea
                value={form.addressRo}
                onChange={(e) =>
                  updateField(
                    "addressRo",
                    e.target.value
                  )
                }
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="Román nyelvű cím"
              />
            </div>

            {/* Telefon */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Telefonszám
              </label>

              <input
                type="text"
                value={form.phone}
                onChange={(e) =>
                  updateField(
                    "phone",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="+40 ..."
              />
            </div>

            {/* E-mail */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                E-mail
                <span className="ml-2 font-normal text-gray-400">
                  opcionális
                </span>
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  updateField(
                    "email",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="info@molnarrent.ro"
              />
            </div>

            {/* Weboldal */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Weboldal
                <span className="ml-2 font-normal text-gray-400">
                  opcionális
                </span>
              </label>

              <input
                type="text"
                value={form.website}
                onChange={(e) =>
                  updateField(
                    "website",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="https://molnarrent.ro"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                WhatsApp
                <span className="ml-2 font-normal text-gray-400">
                  opcionális
                </span>
              </label>

              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) =>
                  updateField(
                    "whatsapp",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="+40 ..."
              />

              <p className="mt-2 text-xs text-gray-500">
                Ha nincs külön WhatsApp elérhetőség,
                nyugodtan hagyd üresen.
              </p>
            </div>

          </div>

          {/* Üzenet */}
          {message && (
            <div
              className={`mt-7 rounded-xl px-4 py-3 text-sm ${
                isError
                  ? "border border-red-200 bg-red-50 text-red-700"
                  : "border border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Mentés */}
          <div className="mt-8 flex justify-end">

            <button
              type="button"
              onClick={saveContact}
              disabled={saving}
              className="rounded-xl bg-orange-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Mentés..."
                : "Mentés"}
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}