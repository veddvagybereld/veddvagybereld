"use client";

import {
  ChangeEvent,
  use,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../../../../../lib/firebase";

type PageProps = {
  params: Promise<{
    id: string;
    productId: string;
  }>;
};

type PropertyItem = {
  labelHu: string;
  labelRo: string;
  valueHu: string;
  valueRo: string;
};

type ProductImage = {
  id: string;
  name: string;
  url?: string;
  previewUrl?: string;
  file?: File;
};

export default function TermekSzerkesztesPage({
  params,
}: PageProps) {
  const { id: categoryId, productId } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState(1);
  const [active, setActive] = useState(true);
  const [rentable, setRentable] = useState(true);

  const [titleHu, setTitleHu] = useState("");
  const [titleRo, setTitleRo] = useState("");

  const [descriptionHu, setDescriptionHu] = useState("");
  const [descriptionRo, setDescriptionRo] = useState("");

  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // =========================================================
  // TERMÉK BETÖLTÉSE
  // =========================================================

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setMessage("");

        const productRef = doc(db, "products", productId);
        const snapshot = await getDoc(productRef);

        if (!snapshot.exists()) {
          setMessage("A termék nem található.");
          return;
        }

        const data = snapshot.data();

        if (
          data.categoryId &&
          data.categoryId !== categoryId
        ) {
          setMessage(
            "Ez a termék nem ehhez a kategóriához tartozik."
          );
          return;
        }

        setOrder(data.order ?? 1);
        setActive(data.active ?? true);
        setRentable(data.rentable ?? true);

        setTitleHu(data.title?.hu ?? "");
        setTitleRo(data.title?.ro ?? "");

        setDescriptionHu(data.description?.hu ?? "");
        setDescriptionRo(data.description?.ro ?? "");

        const savedProperties = Array.isArray(
          data.properties
        )
          ? data.properties
          : [];

        setProperties(
          savedProperties.map((item) => ({
            labelHu: item?.label?.hu ?? "",
            labelRo: item?.label?.ro ?? "",
            valueHu: item?.value?.hu ?? "",
            valueRo: item?.value?.ro ?? "",
          }))
        );

        // Már elmentett termékképek betöltése
        const savedMedia = Array.isArray(data.media)
          ? data.media
          : [];

        const savedImages: ProductImage[] =
          savedMedia
            .filter(
              (item) =>
                item &&
                item.type === "image" &&
                item.url
            )
            .map((item, index) => ({
              id: `saved-${index}-${item.url}`,
              name:
                item.name ??
                `Termékkép ${index + 1}`,
              url: item.url,
            }));

        setImages(savedImages);
      } catch (error) {
        console.error(
          "Hiba a termék betöltésekor:",
          error
        );

        if (error instanceof Error) {
          setMessage(error.message);
        } else {
          setMessage(
            "Nem sikerült betölteni a terméket."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [categoryId, productId]);

  // =========================================================
  // TULAJDONSÁGOK
  // =========================================================

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
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  // =========================================================
  // TERMÉKKÉPEK
  // =========================================================

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    if (files.length === 0) {
      return;
    }

    const newImages: ProductImage[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setMessage(
          `Nem támogatott fájltípus: ${file.name}. Csak kép tölthető fel.`
        );
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        setMessage(
          `A fájl túl nagy: ${file.name}. Maximum 50 MB.`
        );
        continue;
      }

      newImages.push({
        id: `new-${Date.now()}-${Math.random()}`,
        name: file.name,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (newImages.length > 0) {
      setImages((current) => [
        ...current,
        ...newImages,
      ]);

      setMessage("");
    }

    // Ugyanaz a fájl később ismét
    // kiválasztható legyen.
    event.target.value = "";
  }

  function removeImage(index: number) {
    setImages((current) => {
      const image = current[index];

      if (image?.previewUrl) {
        URL.revokeObjectURL(image.previewUrl);
      }

      return current.filter(
        (_, imageIndex) => imageIndex !== index
      );
    });
  }

  function moveImageUp(index: number) {
    if (index <= 0) {
      return;
    }

    setImages((current) => {
      const copy = [...current];

      [copy[index - 1], copy[index]] = [
        copy[index],
        copy[index - 1],
      ];

      return copy;
    });
  }

  function moveImageDown(index: number) {
    setImages((current) => {
      if (index >= current.length - 1) {
        return current;
      }

      const copy = [...current];

      [copy[index], copy[index + 1]] = [
        copy[index + 1],
        copy[index],
      ];

      return copy;
    });
  }

  async function uploadFile(
    file: File
  ): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        throw new Error(
          "A feltöltéshez admin bejelentkezés szükséges."
        );
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ??
          "A kép feltöltése nem sikerült."
      );
    }

    if (!result.url) {
      throw new Error(
        "A feltöltés nem adott vissza kép URL-t."
      );
    }

    return result.url;
  }

  // =========================================================
  // MAGYAR → ROMÁN MÁSOLÁS
  // =========================================================

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

  // =========================================================
  // MENTÉS
  // =========================================================

  async function handleSave() {
    if (!titleHu.trim()) {
      setMessage(
        "A magyar terméknév megadása kötelező."
      );
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

      // Új képek feltöltése,
      // már mentett képek megtartása.
      const finalMedia = [];

      for (const image of images) {
        let finalUrl = image.url;

        if (image.file) {
          finalUrl = await uploadFile(image.file);
        }

        if (!finalUrl) {
          continue;
        }

        finalMedia.push({
          type: "image",
          name: image.name,
          url: finalUrl,
        });
      }

      const productRef = doc(
        db,
        "products",
        productId
      );

      await updateDoc(productRef, {
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

        // Az első elem lesz a fő termékkép.
        media: finalMedia,

        updatedAt: serverTimestamp(),
      });

      // Helyi object URL-ek felszabadítása
      images.forEach((image) => {
        if (image.previewUrl) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });

      router.push(
        `/admin/kategoriak/${categoryId}`
      );
    } catch (error) {
      console.error(
        "Hiba a termék mentésekor:",
        error
      );

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Nem sikerült elmenteni a terméket."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // BETÖLTÉS
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] px-5 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[28px] bg-white p-8 text-center shadow-lg">
            <p className="font-semibold text-gray-500">
              Termék betöltése...
            </p>
          </div>
        </div>
      </main>
    );
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
              Termék szerkesztése
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
                  onChange={(e) =>
                    setOrder(
                      Number(e.target.value)
                    )
                  }
                  className="w-32 rounded-xl border border-gray-300 px-4 py-3"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 pb-3">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) =>
                    setActive(e.target.checked)
                  }
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
                  onChange={(e) =>
                    setRentable(
                      e.target.checked
                    )
                  }
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
              onChange={(e) =>
                setTitleHu(e.target.value)
              }
              className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-3"
              placeholder="pl. Állvány keret"
            />

            <label className="mb-2 block font-semibold text-gray-700">
              Leírás
            </label>

            <textarea
              value={descriptionHu}
              onChange={(e) =>
                setDescriptionHu(
                  e.target.value
                )
              }
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
              onChange={(e) =>
                setTitleRo(e.target.value)
              }
              className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-3"
              placeholder="Román terméknév..."
            />

            <label className="mb-2 block font-semibold text-gray-700">
              Leírás
            </label>

            <textarea
              value={descriptionRo}
              onChange={(e) =>
                setDescriptionRo(
                  e.target.value
                )
              }
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
              placeholder="Román leírás..."
            />
          </section>

          <hr className="border-gray-200" />

          {/* Termékképek */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#222b31]">
                  Termékképek
                </h2>

                <p className="mt-2 text-gray-500">
                  Több kép is feltölthető.
                  Az első kép lesz a termék főképe.
                </p>
              </div>

              <label className="cursor-pointer rounded-xl bg-[#222b31] px-5 py-3 font-bold text-white">
                + Képek hozzáadása

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={saving}
                  className="hidden"
                />
              </label>
            </div>

            {images.length === 0 ? (
              <div className="mt-5 rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400">
                Még nincs termékkép feltöltve.
              </div>
            ) : (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {images.map(
                  (image, index) => {
                    const imageUrl =
                      image.previewUrl ||
                      image.url;

                    return (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                      >
                        <div className="relative flex h-52 items-center justify-center bg-gray-50">
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt={image.name}
                              className="h-full w-full object-cover"
                            />
                          )}

                          {index === 0 && (
                            <div className="absolute left-3 top-3 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white shadow">
                              Főkép
                            </div>
                          )}

                          {image.file && (
                            <div className="absolute right-3 top-3 rounded-full bg-[#222b31] px-3 py-1 text-xs font-bold text-white shadow">
                              Új
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <p
                            className="truncate text-sm font-semibold text-gray-700"
                            title={image.name}
                          >
                            {image.name}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                moveImageUp(
                                  index
                                )
                              }
                              disabled={
                                saving ||
                                index === 0
                              }
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600 disabled:opacity-30"
                            >
                              ←
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                moveImageDown(
                                  index
                                )
                              }
                              disabled={
                                saving ||
                                index ===
                                  images.length -
                                    1
                              }
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600 disabled:opacity-30"
                            >
                              →
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                removeImage(
                                  index
                                )
                              }
                              disabled={saving}
                              className="ml-auto rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"
                            >
                              Törlés
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
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
                  Tetszőleges műszaki adatok
                  adhatók a termékhez.
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
                {properties.map(
                  (property, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <p className="font-bold text-[#222b31]">
                          {index + 1}.
                          tulajdonság
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            removeProperty(
                              index
                            )
                          }
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
                            value={
                              property.labelHu
                            }
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
                            value={
                              property.valueHu
                            }
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
                            value={
                              property.labelRo
                            }
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
                            value={
                              property.valueRo
                            }
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
                  )
                )}
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
              {saving
                ? "Mentés..."
                : "Módosítások mentése"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/admin/kategoriak/${categoryId}`
                )
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