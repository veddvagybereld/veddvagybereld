"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

// HELYES
import { db } from "../../../../../lib/firebase";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type PropertyItem = {
  labelHu: string;
  labelRo: string;
  valueHu: string;
  valueRo: string;
};

export default function UjTermekPage({ params }: PageProps) {
  const { id: categoryId } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState(1);
  const [active, setActive] = useState(true);
  const [rentable, setRentable] = useState(true);

  const [titleHu, setTitleHu] = useState("");
  const [titleRo, setTitleRo] = useState("");

  const [descriptionHu, setDescriptionHu] = useState("");
  const [descriptionRo, setDescriptionRo] = useState("");

  const [properties, setProperties] = useState<PropertyItem[]>([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function addProperty() {
    setProperties((current) => [
      ...current,
      {
        labelHu: "",
        labelRo: "",
        valueHu: "",
        valueRo: "",
      },
    ]);
  }

  function updateProperty(
    index: number,
    field: keyof PropertyItem,
    value: string
  ) {
    setProperties((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function removeProperty(index: number) {
    setProperties((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function copyHungarianToRomanian() {
    setTitleRo(titleHu);
    setDescriptionRo(descriptionHu);

    setProperties((current) =>
      current.map((item) => ({
        ...item,
        labelRo: item.labelHu,
        valueRo: item.valueHu,
      }))
    );

    setMessage("✓ A magyar szövegek átmásolva a román mezőkbe.");
  }

  async function handleSave() {
    if (!titleHu.trim()) {
      setMessage("A magyar terméknév megadása kötelező.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const finalProperties = properties
        .filter(
          (item) =>
            item.labelHu.trim() ||
            item.labelRo.trim() ||
            item.valueHu.trim() ||
            item.valueRo.trim()
        )
        .map((item) => ({
          label: {
            hu: item.labelHu.trim(),
            ro: item.labelRo.trim(),
          },
          value: {
            hu: item.valueHu.trim(),
            ro: item.valueRo.trim(),
          },
        }));

      await addDoc(collection(db, "products"), {
        categoryId,

        order: Number(order),
        active,
        rentable,

        title: {
          hu: titleHu.trim(),
          ro: titleRo.trim(),
        },

        description: {
          hu: descriptionHu.trim(),
          ro: descriptionRo.trim(),
        },

        properties: finalProperties,

        media: [],

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push(`/admin/kategoriak/${categoryId}`);
    } catch (error) {
      console.error("Hiba a termék mentésekor:", error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Nem sikerült elmenteni a terméket.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">

        {/* Fejléc */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Adminisztráció
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#222b31]">
              Új termék
            </h1>
          </div>

          <Link
            href={`/admin/kategoriak/${categoryId}`}
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 shadow-sm"
          >
            ← Vissza
          </Link>
        </div>

        <div className="space-y-8 rounded-[28px] bg-white p-6 shadow-lg sm:p-8">

          {/* Alapbeállítások */}
          <section>
            <h2 className="mb-5 text-xl font-bold text-[#222b31]">
              Alapbeállítások
            </h2>

            <div className="flex flex-wrap items-end gap-8">
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
              </div>

              <label className="flex cursor-pointer items-center gap-3 pb-3">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-5 w-5"
                />

                <span className="font-semibold text-gray-700">
                  Aktív termék
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 pb-3">
                <input
                  type="checkbox"
                  checked={rentable}
                  onChange={(e) => setRentable(e.target.checked)}
                  className="h-5 w-5"
                />

                <span className="font-semibold text-gray-700">
                  Bérbe adható
                </span>
              </label>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Magyar tartalom */}
          <section>
            <h2 className="mb-5 text-xl font-bold text-[#222b31]">
              🇭🇺 Magyar tartalom
            </h2>

            <label className="mb-2 block font-semibold text-gray-700">
              Termék neve *
            </label>

            <input
              type="text"
              value={titleHu}
              onChange={(e) => setTitleHu(e.target.value)}
              className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-3"
              placeholder="pl. Állvány keret"
            />

            <label className="mb-2 block font-semibold text-gray-700">
              Leírás
            </label>

            <textarea
              value={descriptionHu}
              onChange={(e) => setDescriptionHu(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
              placeholder="A termék rövid bemutatása..."
            />
          </section>

          <hr className="border-gray-200" />

          {/* Magyar → Román másolás */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={copyHungarianToRomanian}
              disabled={saving}
              className="rounded-xl bg-[#222b31] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#343f46] disabled:opacity-50"
            >
              ↓ Magyar szöveg másolása románra
            </button>

            <p className="text-sm text-gray-500">
              A termék neve, leírása és a tulajdonságok magyar mezői
              átmásolódnak a román mezőkbe.
            </p>
          </div>

          <hr className="border-gray-200" />

          {/* Román tartalom */}
          <section>
            <h2 className="mb-5 text-xl font-bold text-[#222b31]">
              🇷🇴 Román tartalom
            </h2>

            <label className="mb-2 block font-semibold text-gray-700">
              Termék neve
            </label>

            <input
              type="text"
              value={titleRo}
              onChange={(e) => setTitleRo(e.target.value)}
              className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-3"
              placeholder="Román terméknév..."
            />

            <label className="mb-2 block font-semibold text-gray-700">
              Leírás
            </label>

            <textarea
              value={descriptionRo}
              onChange={(e) => setDescriptionRo(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
              placeholder="Román leírás..."
            />
          </section>

          <hr className="border-gray-200" />

          {/* Tulajdonságok */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#222b31]">
                  Tulajdonságok
                </h2>

                <p className="mt-2 text-gray-500">
                  Tetszőleges műszaki adatok adhatók a termékhez.
                </p>
              </div>

              <button
                type="button"
                onClick={addProperty}
                disabled={saving}
                className="rounded-xl bg-[#222b31] px-5 py-3 font-bold text-white"
              >
                + Új tulajdonság
              </button>
            </div>

            {properties.length === 0 ? (
              <div className="mt-5 rounded-2xl border-2 border-dashed border-gray-200 p-7 text-center text-gray-400">
                Még nincs tulajdonság hozzáadva.
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {properties.map((property, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <p className="font-bold text-[#222b31]">
                        {index + 1}. tulajdonság
                      </p>

                      <button
                        type="button"
                        onClick={() => removeProperty(index)}
                        disabled={saving}
                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600"
                      >
                        Törlés
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-600">
                          Megnevezés HU
                        </label>

                        <input
                          type="text"
                          value={property.labelHu}
                          onChange={(e) =>
                            updateProperty(
                              index,
                              "labelHu",
                              e.target.value
                            )
                          }
                          placeholder="pl. Magasság"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-600">
                          Érték HU
                        </label>

                        <input
                          type="text"
                          value={property.valueHu}
                          onChange={(e) =>
                            updateProperty(
                              index,
                              "valueHu",
                              e.target.value
                            )
                          }
                          placeholder="pl. 2,0 m"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-600">
                          Megnevezés RO
                        </label>

                        <input
                          type="text"
                          value={property.labelRo}
                          onChange={(e) =>
                            updateProperty(
                              index,
                              "labelRo",
                              e.target.value
                            )
                          }
                          placeholder="pl. Înălțime"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-600">
                          Érték RO
                        </label>

                        <input
                          type="text"
                          value={property.valueRo}
                          onChange={(e) =>
                            updateProperty(
                              index,
                              "valueRo",
                              e.target.value
                            )
                          }
                          placeholder="pl. 2,0 m"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                        />
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Üzenet */}
          {message && (
            <div className="rounded-xl bg-orange-50 px-4 py-3 font-semibold text-orange-800">
              {message}
            </div>
          )}

          {/* Mentés */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-orange-600 px-7 py-3 font-bold text-white shadow-sm disabled:opacity-50"
            >
              {saving ? "Mentés..." : "Termék mentése"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(`/admin/kategoriak/${categoryId}`)
              }
              disabled={saving}
              className="rounded-xl border border-gray-300 px-7 py-3 font-semibold text-gray-700 disabled:opacity-50"
            >
              Mégse
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}