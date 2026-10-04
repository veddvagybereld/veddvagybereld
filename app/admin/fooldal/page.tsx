"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function FooldalSzerkesztesPage() {
  const [titleHu, setTitleHu] = useState("");
  const [titleRo, setTitleRo] = useState("");
  const [descriptionHu, setDescriptionHu] = useState("");
  const [descriptionRo, setDescriptionRo] = useState("");

  // Közös weboldal-háttérkép
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [selectedBackgroundImage, setSelectedBackgroundImage] =
    useState<File | null>(null);
  const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // =========================================================
  // FŐOLDAL BEÁLLÍTÁSAINAK BETÖLTÉSE
  // =========================================================

  useEffect(() => {
    async function loadHomeSettings() {
      try {
        const ref = doc(db, "siteSettings", "home");
        const snapshot = await getDoc(ref);

        if (snapshot.exists()) {
          const data = snapshot.data();

          setTitleHu(data.title?.hu ?? "");
          setTitleRo(data.title?.ro ?? "");

          setDescriptionHu(data.description?.hu ?? "");
          setDescriptionRo(data.description?.ro ?? "");

          setBackgroundImageUrl(
            data.backgroundImageUrl ?? ""
          );
        }
      } catch (error) {
        console.error(
          "Hiba a főoldal adatainak betöltésekor:",
          error
        );

        setMessage(
          "Hiba történt az adatok betöltésekor."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHomeSettings();
  }, []);

  // =========================================================
  // HÁTTÉRKÉP HELYI ELŐNÉZETE
  // =========================================================

  useEffect(() => {
    if (!selectedBackgroundImage) {
      setBackgroundPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(
      selectedBackgroundImage
    );

    setBackgroundPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedBackgroundImage]);

  // =========================================================
  // MAGYAR → ROMÁN
  // =========================================================

  function copyHungarianToRomanian() {
    setTitleRo(titleHu);
    setDescriptionRo(descriptionHu);

    setMessage(
      "✓ A magyar szöveg átmásolva a román mezőkbe."
    );
  }

  // =========================================================
  // HÁTTÉRKÉP KIVÁLASZTÁSA
  // =========================================================

  function handleBackgroundImageChange(
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
      setMessage(
        "A háttérkép mérete legfeljebb 10 MB lehet."
      );

      event.target.value = "";
      return;
    }

    setSelectedBackgroundImage(file);
    setMessage("");
  }

  // =========================================================
  // FÁJL FELTÖLTÉSE
  // =========================================================

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
          "A fájl feltöltése nem sikerült."
      );
    }

    if (!result.url) {
      throw new Error(
        "A feltöltés nem adott vissza fájl URL-t."
      );
    }

    return result.url;
  }

  // =========================================================
  // MENTÉS
  // =========================================================

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      let finalBackgroundImageUrl =
        backgroundImageUrl;

      // Új háttérkép feltöltése, ha választottunk
      if (selectedBackgroundImage) {
        setUploading(true);

        finalBackgroundImageUrl =
          await uploadFile(
            selectedBackgroundImage
          );

        setBackgroundImageUrl(
          finalBackgroundImageUrl
        );

        setSelectedBackgroundImage(null);
      }

      const ref = doc(
        db,
        "siteSettings",
        "home"
      );

      await setDoc(
        ref,
        {
          title: {
            hu: titleHu,
            ro: titleRo,
          },

          description: {
            hu: descriptionHu,
            ro: descriptionRo,
          },

          backgroundImageUrl:
            finalBackgroundImageUrl,

          updatedAt: new Date(),
        },
        {
          merge: true,
        }
      );

      setMessage(
        "✓ A főoldal adatai és a weboldal beállításai elmentve."
      );
    } catch (error) {
      console.error(
        "Hiba mentés közben:",
        error
      );

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Nem sikerült elmenteni az adatokat."
        );
      }
    } finally {
      setUploading(false);
      setSaving(false);
    }
  }

  // =========================================================
  // BETÖLTÉS
  // =========================================================

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

        {/* =================================================
            FEJLÉC
        ================================================= */}

        <div className="mb-8 flex items-center justify-between gap-4">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Adminisztráció
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#222b31]">
              Főoldal szerkesztése
            </h1>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 shadow-sm"
          >
            ← Vissza
          </Link>

        </div>

        <div className="space-y-8 rounded-[28px] bg-white p-6 shadow-lg sm:p-8">

          {/* =================================================
              MAGYAR
          ================================================= */}

          <section>

            <h2 className="mb-4 text-xl font-bold text-[#222b31]">
              Magyar tartalom
            </h2>

            <label className="mb-2 block font-semibold text-gray-700">
              Főcím
            </label>

            <input
              type="text"
              value={titleHu}
              onChange={(e) =>
                setTitleHu(e.target.value)
              }
              className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-3"
              placeholder="pl. Vedd vagy Béreld"
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
              rows={5}
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
              placeholder="A főoldalon megjelenő bemutatkozó szöveg..."
            />

          </section>

          {/* =================================================
              MAGYAR → ROMÁN
          ================================================= */}

          <div className="border-y border-gray-200 py-5">

            <div className="flex flex-wrap items-center gap-4">

              <button
                type="button"
                onClick={
                  copyHungarianToRomanian
                }
                disabled={saving}
                className="rounded-xl bg-[#222b31] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#343f46] disabled:opacity-50"
              >
                ↓ Magyar szöveg másolása románra
              </button>

              <p className="text-sm text-gray-500">
                A román mezőkbe kerülő
                magyar szöveget ezután
                DeepL-lel lefordíthatod.
              </p>

            </div>

          </div>

          {/* =================================================
              ROMÁN
          ================================================= */}

          <section>

            <h2 className="mb-4 text-xl font-bold text-[#222b31]">
              Román tartalom
            </h2>

            <label className="mb-2 block font-semibold text-gray-700">
              Főcím
            </label>

            <input
              type="text"
              value={titleRo}
              onChange={(e) =>
                setTitleRo(e.target.value)
              }
              className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-3"
              placeholder="Román főcím"
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
              rows={5}
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
              placeholder="Román bemutatkozó szöveg..."
            />

          </section>

          <hr className="border-gray-200" />

          {/* =================================================
              KÖZÖS WEBOLDAL-HÁTTÉRKÉP
          ================================================= */}

          <section>

            <h2 className="text-xl font-bold text-[#222b31]">
              Weboldal háttérképe
            </h2>

            <p className="mt-2 text-gray-500">
              Ez a kép lesz a publikus weboldal közös háttere.
              A kezdőoldal és a kategóriaoldalak ugyanazt a
              háttérképet használják.
            </p>

            <div className="mt-5 grid gap-6 md:grid-cols-2">

              {/* Előnézet */}

              <div>

                <p className="mb-2 font-semibold text-gray-700">
                  Háttérkép előnézete
                </p>

                <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">

                  {backgroundPreviewUrl ||
                  backgroundImageUrl ? (

                    <img
                      src={
                        backgroundPreviewUrl ||
                        backgroundImageUrl
                      }
                      alt="Weboldal háttérkép előnézet"
                      className="h-64 w-full object-cover"
                    />

                  ) : (

                    <div className="px-6 text-center text-gray-400">
                      Még nincs háttérkép feltöltve
                    </div>

                  )}

                </div>

              </div>

              {/* Feltöltés */}

              <div className="flex flex-col justify-center">

                <label className="mb-2 block font-semibold text-gray-700">
                  Új háttérkép kiválasztása
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleBackgroundImageChange
                  }
                  disabled={saving}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700"
                />

                {selectedBackgroundImage && (

                  <div className="mt-4 rounded-xl bg-orange-50 p-4">

                    <p className="font-semibold text-orange-800">
                      Új háttérkép kiválasztva
                    </p>

                    <p className="mt-1 break-all text-sm text-orange-700">
                      {
                        selectedBackgroundImage.name
                      }
                    </p>

                    <p className="mt-2 text-sm text-orange-700">
                      A kép az alsó Mentés gombbal
                      kerül feltöltésre.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedBackgroundImage(
                          null
                        )
                      }
                      disabled={saving}
                      className="mt-3 rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm font-semibold text-orange-700"
                    >
                      Kiválasztás visszavonása
                    </button>

                  </div>

                )}

                {!selectedBackgroundImage &&
                  backgroundImageUrl && (

                    <p className="mt-4 text-sm font-medium text-green-700">
                      ✓ A weboldalhoz már tartozik háttérkép.
                    </p>

                  )}

                <p className="mt-4 text-sm text-gray-500">
                  JPG, PNG, WEBP vagy más böngészőben
                  használható képformátum. Maximum 10 MB.
                </p>

              </div>

            </div>

          </section>

          <hr className="border-gray-200" />

          {/* =================================================
              MENTÉS
          ================================================= */}

          <div className="flex flex-wrap items-center gap-4">

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-orange-600 px-7 py-3 font-bold text-white shadow-sm transition hover:bg-orange-700 disabled:opacity-50"
            >
              {uploading
                ? "Háttérkép feltöltése..."
                : saving
                  ? "Mentés..."
                  : "Mentés"}
            </button>

            {message && (
              <span className="font-medium text-gray-700">
                {message}
              </span>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}