"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type MediaType = "image" | "video" | "document";

type SavedMediaItem = {
  type: MediaType;
  url: string;
  name: string;
};

type MediaItem = {
  id: string;
  type: MediaType;
  name: string;
  url?: string;
  file?: File;
  previewUrl?: string;
};

type Product = {
  id: string;
  nameHu: string;
  nameRo?: string;
  active?: boolean;
  rentable?: boolean;
  order?: number;
};

export default function KategoriaSzerkesztesPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState(1);
  const [slug, setSlug] = useState("");
  const [active, setActive] = useState(true);

  const [titleHu, setTitleHu] = useState("");
  const [titleRo, setTitleRo] = useState("");

  const [cardDescriptionHu, setCardDescriptionHu] = useState("");
  const [cardDescriptionRo, setCardDescriptionRo] = useState("");

  const [introHu, setIntroHu] = useState("");
  const [introRo, setIntroRo] = useState("");

  // Főoldali kategóriakép
  const [cardImageUrl, setCardImageUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Kategóriaoldal médiagalériája
  const [media, setMedia] = useState<MediaItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadCategory() {
      try {
        const ref = doc(db, "categories", id);
        const snapshot = await getDoc(ref);

        if (!snapshot.exists()) {
          setMessage("A kategória nem található.");
          setLoading(false);
          return;
        }

        const data = snapshot.data();

        setOrder(data.order ?? 1);
        setSlug(data.slug ?? "");
        setTitleHu(data.title?.hu ?? "");
        setTitleRo(data.title?.ro ?? "");

        setCardDescriptionHu(
          data.cardDescription?.hu ??
            data.description?.hu ??
            ""
        );

        setCardDescriptionRo(
          data.cardDescription?.ro ??
            data.description?.ro ??
            ""
        );

        setIntroHu(data.intro?.hu ?? "");
        setIntroRo(data.intro?.ro ?? "");

        setCardImageUrl(data.cardImageUrl ?? "");

        // Már elmentett médiák betöltése
        const savedMedia: SavedMediaItem[] = Array.isArray(data.media)
          ? data.media
          : [];

        setMedia(
          savedMedia.map((item, index) => ({
            id: `saved-${index}-${item.url}`,
            type: item.type,
            name: item.name ?? `Média ${index + 1}`,
            url: item.url,
          }))
        );
      } catch (error) {
        console.error("Hiba a kategória betöltésekor:", error);
        setMessage("Nem sikerült betölteni a kategóriát.");
      } finally {
        setLoading(false);
      }
    }

    loadCategory();
  }, [id]);

  
  // A főoldali kategóriakép helyi előnézete
  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage]);

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Kérlek képfájlt válassz.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("A kép mérete legfeljebb 10 MB lehet.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setMessage("");
  }

    useEffect(() => {
    async function loadProducts() {
      try {
        const productsRef = collection(db, "products");

        const q = query(
          productsRef,
          where("categoryId", "==", id)
        );

        const snapshot = await getDocs(q);

        const loadedProducts: Product[] = snapshot.docs.map((docItem) => {
          const data = docItem.data();

          return {
            id: docItem.id,
            nameHu: data.title?.hu ?? "",
            nameRo: data.title?.ro ?? "",
            active: data.active ?? true,
            rentable: data.rentable ?? false,
            order: data.order ?? 0,
          };
        });

        loadedProducts.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        setProducts(loadedProducts);
      } catch (error) {
        console.error("Hiba a termékek betöltésekor:", error);
      }
    }

    loadProducts();
  }, [id]);

  async function handleDeleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Biztosan törölni szeretnéd ezt a terméket?\n\n${
        product.nameHu || "Névtelen termék"
      }`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(doc(db, "products", product.id));

      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );

      setMessage(
        `✓ A(z) „${product.nameHu || "Névtelen termék"}” termék törölve.`
      );
    } catch (error) {
      console.error("Hiba a termék törlésekor:", error);
      setMessage("Nem sikerült törölni a terméket.");
    }
  }

  async function handleDuplicateProduct(product: Product) {
    try {
      setMessage("");

      const sourceSnapshot = await getDoc(
        doc(db, "products", product.id)
      );

      if (!sourceSnapshot.exists()) {
        setMessage("A másolandó termék nem található.");
        return;
      }

      const sourceData = sourceSnapshot.data();

      const nextOrder =
        products.length > 0
          ? Math.max(...products.map((item) => item.order ?? 0)) + 1
          : 1;

      const newProductRef = await addDoc(
        collection(db, "products"),
        {
          ...sourceData,
          categoryId: id,
          order: nextOrder,
          title: {
            hu: `${sourceData.title?.hu ?? "Névtelen termék"} - másolat`,
            ro: sourceData.title?.ro ?? "",
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      setProducts((current) => [
        ...current,
        {
          id: newProductRef.id,
          nameHu: `${sourceData.title?.hu ?? "Névtelen termék"} - másolat`,
          nameRo: sourceData.title?.ro ?? "",
          active: sourceData.active ?? true,
          rentable: sourceData.rentable ?? false,
          order: nextOrder,
        },
      ]);

      setMessage(
        `✓ A(z) „${product.nameHu || "Névtelen termék"}” termék másolata elkészült.`
      );
    } catch (error) {
      console.error("Hiba a termék másolásakor:", error);
      setMessage("Nem sikerült lemásolni a terméket.");
    }
  }

  async function moveProduct(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= products.length) {
      return;
    }

    const reordered = [...products];

    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];

    const normalized = reordered.map((item, itemIndex) => ({
      ...item,
      order: itemIndex + 1,
    }));

    setProducts(normalized);

    try {
      await Promise.all(
        normalized.map((item) =>
          updateDoc(doc(db, "products", item.id), {
            order: item.order,
            updatedAt: serverTimestamp(),
          })
        )
      );
    } catch (error) {
      console.error("Hiba a terméksorrend mentésekor:", error);
      setMessage("Nem sikerült elmenteni a termékek új sorrendjét.");
    }
  }

  function getMediaType(file: File): MediaType | null {
    if (file.type.startsWith("image/")) {
      return "image";
    }

    if (file.type.startsWith("video/")) {
      return "video";
    }

    if (
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")
    ) {
      return "document";
    }

    return null;
  }

  function handleMediaChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const newItems: MediaItem[] = [];

    for (const file of files) {
      const type = getMediaType(file);

      if (!type) {
        setMessage(
          `Nem támogatott fájltípus: ${file.name}. Kép, GIF, videó vagy PDF tölthető fel.`
        );
        continue;
      }

      // Általános felső korlát egy fájlra.
      // Ha később nagy videók kellenek, ezt külön kezeljük.
      if (file.size > 50 * 1024 * 1024) {
        setMessage(
          `A fájl túl nagy: ${file.name}. Maximum 50 MB.`
        );
        continue;
      }

      let localPreviewUrl: string | undefined;

      if (type === "image" || type === "video") {
        localPreviewUrl = URL.createObjectURL(file);
      }

      newItems.push({
        id: `new-${Date.now()}-${Math.random()}`,
        type,
        name: file.name,
        file,
        previewUrl: localPreviewUrl,
      });
    }

    if (newItems.length > 0) {
      setMedia((current) => [...current, ...newItems]);
      setMessage("");
    }

    // Ugyanaz a fájl később ismét kiválasztható legyen
    event.target.value = "";
  }

  function removeMedia(index: number) {
    setMedia((current) => {
      const item = current[index];

      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function moveMediaUp(index: number) {
    if (index <= 0) {
      return;
    }

    setMedia((current) => {
      const copy = [...current];

      [copy[index - 1], copy[index]] = [
        copy[index],
        copy[index - 1],
      ];

      return copy;
    });
  }

  function moveMediaDown(index: number) {
    setMedia((current) => {
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

  async function uploadFile(file: File): Promise<string> {
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
        result.error ?? "A fájl feltöltése nem sikerült."
      );
    }

    if (!result.url) {
      throw new Error(
        "A feltöltés nem adott vissza fájl URL-t."
      );
    }

    return result.url;
  }

  function copyHungarianToRomanian() {
    setTitleRo(titleHu);
    setCardDescriptionRo(cardDescriptionHu);
    setIntroRo(introHu);

    setMessage("✓ A magyar szövegek átmásolva a román mezőkbe.");
  }

  async function handleSave() {
    if (!titleHu.trim()) {
      setMessage("A magyar kategórianév megadása kötelező.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      let finalCardImageUrl = cardImageUrl;

      // Főoldali kategóriakép
      if (selectedImage) {
        setUploading(true);

        finalCardImageUrl = await uploadFile(selectedImage);

        setCardImageUrl(finalCardImageUrl);
        setSelectedImage(null);
      }

      // Kategóriaoldal médiái
      const finalMedia: SavedMediaItem[] = [];

      for (const item of media) {
        if (item.file) {
          setUploading(true);

          const uploadedUrl = await uploadFile(item.file);

          finalMedia.push({
            type: item.type,
            name: item.name,
            url: uploadedUrl,
          });
        } else if (item.url) {
          finalMedia.push({
            type: item.type,
            name: item.name,
            url: item.url,
          });
        }
      }

      const ref = doc(db, "categories", id);

      await updateDoc(ref, {
        order: Number(order),
        active,

        title: {
          hu: titleHu.trim(),
          ro: titleRo.trim(),
        },

        cardDescription: {
          hu: cardDescriptionHu.trim(),
          ro: cardDescriptionRo.trim(),
        },

        intro: {
          hu: introHu.trim(),
          ro: introRo.trim(),
        },

        cardImageUrl: finalCardImageUrl,

        media: finalMedia,

        updatedAt: serverTimestamp(),
      });

      // Mentés után a feltöltött médiák már URL-lel
      // rendelkező mentett elemek legyenek.
      setMedia(
        finalMedia.map((item, index) => ({
          id: `saved-${index}-${item.url}`,
          type: item.type,
          name: item.name,
          url: item.url,
        }))
      );

      setMessage("✓ A kategória adatai elmentve.");
    } catch (error) {
      console.error("Hiba mentés közben:", error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Nem sikerült elmenteni a kategóriát.");
      }
    } finally {
      setUploading(false);
      setSaving(false);
    }
  }

  function mediaIcon(type: MediaType) {
    if (type === "image") {
      return "🖼️";
    }

    if (type === "video") {
      return "🎬";
    }

    return "📄";
  }

  function mediaTypeName(type: MediaType) {
    if (type === "image") {
      return "Kép";
    }

    if (type === "video") {
      return "Videó";
    }

    return "PDF dokumentum";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] p-8">
        <p>Betöltés...</p>
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
              Kategória szerkesztése
            </h1>
          </div>

          <Link
            href="/admin/kategoriak"
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
                  Aktív kategória
                </span>
              </label>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Magyar */}
          <section>
            <h2 className="mb-5 text-xl font-bold text-[#222b31]">
              🇭🇺 Magyar tartalom
            </h2>

            <label className="mb-2 block font-semibold text-gray-700">
              Kategória neve *
            </label>

            <input
              type="text"
              value={titleHu}
              onChange={(e) => setTitleHu(e.target.value)}
              className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-3"
            />

            <label className="mb-2 block font-semibold text-gray-700">
              Rövid leírás a főoldali kártyán
            </label>

            <textarea
              value={cardDescriptionHu}
              onChange={(e) => setCardDescriptionHu(e.target.value)}
              rows={3}
              className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-3"
              placeholder="Rövid, 1-2 mondatos bemutatkozás..."
            />

            <label className="mb-2 block font-semibold text-gray-700">
              Bevezető szöveg a kategóriaoldalon
            </label>

            <textarea
              value={introHu}
              onChange={(e) => setIntroHu(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
              placeholder="A kategóriaoldal tetején megjelenő részletesebb szöveg..."
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
              A kategória neve, a rövid leírás és a bevezető szöveg
              átmásolódik a román mezőkbe.
            </p>
          </div>

          <hr className="border-gray-200" />

          {/* Román */}
          <section>
            <h2 className="mb-5 text-xl font-bold text-[#222b31]">
              🇷🇴 Román tartalom
            </h2>

            <label className="mb-2 block font-semibold text-gray-700">
              Kategória neve
            </label>

            <input
              type="text"
              value={titleRo}
              onChange={(e) => setTitleRo(e.target.value)}
              className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-3"
            />

            <label className="mb-2 block font-semibold text-gray-700">
              Rövid leírás a főoldali kártyán
            </label>

            <textarea
              value={cardDescriptionRo}
              onChange={(e) => setCardDescriptionRo(e.target.value)}
              rows={3}
              className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-3"
              placeholder="Román rövid leírás..."
            />

            <label className="mb-2 block font-semibold text-gray-700">
              Bevezető szöveg a kategóriaoldalon
            </label>

            <textarea
              value={introRo}
              onChange={(e) => setIntroRo(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
              placeholder="Román bevezető szöveg..."
            />
          </section>

          <hr className="border-gray-200" />

          {/* Főoldali kategóriakép */}
          <section>
            <h2 className="text-xl font-bold text-[#222b31]">
              Főoldali kategóriakép
            </h2>

            <p className="mt-2 text-gray-500">
              Ez a kép jelenik majd meg a kategória főoldali
              kártyáján.
            </p>

            <div className="mt-5 grid gap-6 md:grid-cols-2">

              <div>
                <p className="mb-2 font-semibold text-gray-700">
                  Kategóriakép
                </p>

                <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                  {previewUrl || cardImageUrl ? (
                    <img
                      src={previewUrl || cardImageUrl}
                      alt="Kategóriakép előnézet"
                      className="h-64 w-full object-cover"
                    />
                  ) : (
                    <div className="px-6 text-center text-gray-400">
                      Még nincs kép feltöltve
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <label className="mb-2 block font-semibold text-gray-700">
                  Új kép kiválasztása
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={saving}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700"
                />

                {selectedImage && (
                  <div className="mt-4 rounded-xl bg-orange-50 p-4">
                    <p className="font-semibold text-orange-800">
                      Új kép kiválasztva
                    </p>

                    <p className="mt-1 break-all text-sm text-orange-700">
                      {selectedImage.name}
                    </p>

                    <p className="mt-2 text-sm text-orange-700">
                      A kép a „Változtatások mentése” gombbal
                      kerül feltöltésre.
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      disabled={saving}
                      className="mt-3 rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm font-semibold text-orange-700"
                    >
                      Kiválasztás visszavonása
                    </button>
                  </div>
                )}

                {!selectedImage && cardImageUrl && (
                  <p className="mt-4 text-sm text-green-700">
                    ✓ Ehhez a kategóriához már tartozik kép.
                  </p>
                )}

                <p className="mt-4 text-sm text-gray-500">
                  JPG, PNG, WEBP, GIF vagy más böngészőben
                  használható képformátum. Maximum 10 MB.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Kategóriaoldal média */}
          <section>
            <h2 className="text-xl font-bold text-[#222b31]">
              Kategóriaoldal médiája
            </h2>

            <p className="mt-2 text-gray-500">
              Ezek az elemek jelennek majd meg a kategóriaoldal
              jobb oldalán lapozható galériában.
            </p>

            {/* Média lista */}
            {media.length > 0 && (
              <div className="mt-5 space-y-3">
                {media.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-3"
                  >
                    {/* Előnézet */}
                    <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                      {item.type === "image" ? (
                        <img
                          src={item.previewUrl || item.url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : item.type === "video" ? (
                        <video
                          src={item.previewUrl || item.url}
                          className="h-full w-full object-cover"
                          muted
                        />
                      ) : (
                        <span className="text-4xl">📄</span>
                      )}
                    </div>

                    {/* Fájladatok */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span>{mediaIcon(item.type)}</span>

                        <span className="text-sm font-semibold text-gray-500">
                          {mediaTypeName(item.type)}
                        </span>
                      </div>

                      <p className="mt-1 break-all font-semibold text-[#222b31]">
                        {item.name}
                      </p>

                      {item.file && (
                        <p className="mt-1 text-xs font-semibold text-orange-600">
                          Új – mentéskor kerül feltöltésre
                        </p>
                      )}
                    </div>

                    {/* Gombok */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveMediaUp(index)}
                        disabled={saving || index === 0}
                        title="Mozgatás felfelé"
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 font-bold text-gray-700 disabled:opacity-30"
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        onClick={() => moveMediaDown(index)}
                        disabled={
                          saving || index === media.length - 1
                        }
                        title="Mozgatás lefelé"
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 font-bold text-gray-700 disabled:opacity-30"
                      >
                        ↓
                      </button>

                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        disabled={saving}
                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                      >
                        Törlés
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {media.length === 0 && (
              <div className="mt-5 rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center text-gray-400">
                Még nincs média hozzáadva ehhez a kategóriához.
              </div>
            )}

            {/* Fájl hozzáadása */}
            <div className="mt-5">
              <label className="inline-flex cursor-pointer items-center rounded-xl bg-[#222b31] px-5 py-3 font-bold text-white shadow-sm">
                + Fájl hozzáadása

                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,application/pdf"
                  onChange={handleMediaChange}
                  disabled={saving}
                  className="hidden"
                />
              </label>

              <p className="mt-3 text-sm text-gray-500">
                Kép, GIF, videó vagy PDF. Egyszerre több fájlt is
                kiválaszthatsz.
              </p>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Termékek */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#222b31]">
                  Termékek
                </h2>

                <p className="mt-2 text-gray-500">
                  Az ehhez a kategóriához tartozó termékek kezelése.
                </p>
              </div>

              <Link
                href={`/admin/kategoriak/${id}/termekek/uj`}
                className="rounded-xl bg-[#222b31] px-5 py-3 font-bold text-white shadow-sm"
              >
                + Új termék
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="mt-5 rounded-2xl border-2 border-dashed border-gray-200 p-7 text-center">
                <p className="font-semibold text-gray-500">
                  Még nincs termék ebben a kategóriában.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-4">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-[#222b31]">
                          {product.nameHu || "Névtelen termék"}
                        </h3>

                        {product.active ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            Aktív
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                            Inaktív
                          </span>
                        )}

                        {product.rentable && (
                          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                            Bérelhető
                          </span>
                        )}
                      </div>

                      {product.nameRo && (
                        <p className="mt-1 text-sm text-gray-500">
                          {product.nameRo}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="mr-2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveProduct(index, -1)}
                          disabled={index === 0}
                          title="Mozgatás felfelé"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-lg font-bold text-[#222b31] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() => moveProduct(index, 1)}
                          disabled={index === products.length - 1}
                          title="Mozgatás lefelé"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-lg font-bold text-[#222b31] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDuplicateProduct(product)}
                        className="rounded-xl border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
                      >
                        Másolás
                      </button>

                      <Link
                        href={`/admin/kategoriak/${id}/termekek/${product.id}`}
                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-[#222b31] transition hover:bg-gray-50"
                      >
                        Szerkesztés
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product)}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                      >
                        Törlés
                      </button>
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
              {uploading
                ? "Fájlok feltöltése..."
                : saving
                  ? "Mentés..."
                  : "Változtatások mentése"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/kategoriak")}
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