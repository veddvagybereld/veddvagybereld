"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";

import LanguageSelector from "../components/LanguageSelector";
import { useLanguage } from "../context/LanguageContext";
import { auth, googleProvider } from "../lib/firebase";

const ADMIN_EMAIL = "veddvagybereld@gmail.com";

export default function AdminPage() {
  const { language, t } = useLanguage();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Firebase bejelentkezési állapot figyelése
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (
        firebaseUser &&
        firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      ) {
        setUser(firebaseUser);
      } else {
        if (firebaseUser) {
          await signOut(auth);
        }

        setUser(null);
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Google bejelentkezés
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      if (
        firebaseUser.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()
      ) {
        await signOut(auth);

        setError(
          language === "hu"
            ? "Ez a Google-fiók nem jogosult az adminisztrációs felület használatára."
            : "Acest cont Google nu este autorizat să utilizeze panoul de administrare."
        );

        return;
      }

      setUser(firebaseUser);
    } catch (err) {
      console.error("Google login error:", err);

      setError(
        language === "hu"
          ? "A Google-bejelentkezés nem sikerült."
          : "Autentificarea Google nu a reușit."
      );
    } finally {
      setLoading(false);
    }
  };

  // Kijelentkezés
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Firebase ellenőrzése alatt
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ee]">
        <div className="text-center">
          <Image
            src="/images/logo-mark.svg"
            alt="Logo"
            width={64}
            height={64}
            className="mx-auto mb-5"
          />

          <p className="font-semibold text-gray-600">
            {language === "hu"
              ? "Bejelentkezés ellenőrzése..."
              : "Verificarea autentificării..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-cover bg-center bg-no-repeat text-[#222b31]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(247,244,238,0.72), rgba(247,244,238,0.85)), url('/images/hero-bg.jpg')",
      }}
    >
      {/* FEJLÉC */}
      <header className="border-b border-black/5 bg-white/95 shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo-mark.svg"
              alt="Logo"
              width={54}
              height={54}
              priority
              className="h-12 w-12 sm:h-14 sm:w-14"
            />

            <div>
              <div className="text-xl font-bold sm:text-2xl">
                <span className="text-orange-600">{t.heroTitle1}</span>
                <span> {t.heroTitle2} </span>
                <span className="text-orange-600">{t.heroTitle3}</span>
              </div>

              <div className="hidden text-xs text-gray-500 sm:block">
                {t.siteSubtitle}
              </div>
            </div>
          </Link>

          <LanguageSelector />
        </div>
      </header>

      {/* ===================================================== */}
      {/* NINCS BEJELENTKEZVE                                   */}
      {/* ===================================================== */}

      {!user && (
        <main className="flex flex-1 items-center justify-center px-5 py-12">
          <div className="w-full max-w-md rounded-[32px] border border-white/70 bg-white/95 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
            <div className="mb-7 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 shadow-sm">
                <Image
                  src="/images/logo-mark.svg"
                  alt="Logo"
                  width={58}
                  height={58}
                />
              </div>
            </div>

            <div className="text-center">
              <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-orange-600">
                {language === "hu"
                  ? "ADMINISZTRÁCIÓ"
                  : "ADMINISTRARE"}
              </p>

              <h1 className="text-3xl font-bold">
                {language === "hu"
                  ? "Admin bejelentkezés"
                  : "Autentificare administrator"}
              </h1>

              <p className="mx-auto mt-4 max-w-sm leading-relaxed text-gray-600">
                {language === "hu"
                  ? "Az adminisztrációs felület használatához jelentkezzen be az engedélyezett Google-fiókkal."
                  : "Pentru utilizarea panoului de administrare, autentificați-vă cu contul Google autorizat."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white px-5 py-4 font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.509h3.227c1.889-1.739 2.986-4.3 2.986-7.35Z"
                />
                <path
                  fill="#34A853"
                  d="M12 22c2.7 0 4.964-.895 6.614-2.423l-3.227-2.509c-.895.6-2.041.955-3.387.955-2.605 0-4.809-1.759-5.595-4.123H3.068v2.591A9.997 9.997 0 0 0 12 22Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.405 13.9A6.018 6.018 0 0 1 6.091 12c0-.659.114-1.3.314-1.9V7.509H3.068A10.001 10.001 0 0 0 2 12c0 1.614.386 3.141 1.068 4.491L6.405 13.9Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.977c1.468 0 2.786.505 3.823 1.495l2.864-2.864C16.959 2.995 14.695 2 12 2a9.997 9.997 0 0 0-8.932 5.509L6.405 10.1C7.191 7.736 9.395 5.977 12 5.977Z"
                />
              </svg>

              <span>
                {loading
                  ? language === "hu"
                    ? "Bejelentkezés..."
                    : "Autentificare..."
                  : language === "hu"
                    ? "Bejelentkezés Google-fiókkal"
                    : "Autentificare cu Google"}
              </span>
            </button>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 rounded-2xl bg-gray-50 px-4 py-4 text-center text-sm leading-relaxed text-gray-500">
              🔒{" "}
              {language === "hu"
                ? "Az adminisztráció kizárólag engedélyezett felhasználók számára érhető el."
                : "Administrarea este disponibilă exclusiv utilizatorilor autorizați."}
            </div>
          </div>
        </main>
      )}

      {/* ===================================================== */}
      {/* ADMIN KEZDŐOLDAL                                      */}
      {/* ===================================================== */}

      {user && (
        <main className="flex-1 px-5 py-10 sm:px-6">
          <div className="mx-auto w-full max-w-5xl">
            {/* Üdvözlés */}
            <div className="mb-8 rounded-[28px] bg-white/95 p-6 shadow-lg sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
                    {language === "hu"
                      ? "Adminisztráció"
                      : "Administrare"}
                  </p>

                  <h1 className="mt-1 text-3xl font-bold">
                    {language === "hu"
                      ? "Vezérlőpult"
                      : "Panou de control"}
                  </h1>

                  <p className="mt-2 text-sm text-gray-500">
                    {user.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-2xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  🚪{" "}
                  {language === "hu"
                    ? "Kijelentkezés"
                    : "Deconectare"}
                </button>
              </div>
            </div>

            {/* Admin funkciók */}
            <div className="grid gap-6 md:grid-cols-2">

              {/* Termékek */}
              <button
                type="button"
                className="group rounded-[28px] bg-white/95 p-8 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
                  📦
                </div>

                <h2 className="text-2xl font-bold">
                  {language === "hu" ? "Termékek" : "Produse"}
                </h2>

                <p className="mt-2 leading-relaxed text-gray-500">
                  {language === "hu"
                    ? "A meglévő termékek megtekintése és módosítása."
                    : "Vizualizarea și modificarea produselor existente."}
                </p>

                <div className="mt-5 font-semibold text-orange-600">
                  {language === "hu" ? "Terméklista →" : "Lista produselor →"}
                </div>
              </button>

              {/* Új termék */}
              <Link
                href="/admin/uj-termek"
                className="group rounded-[28px] bg-white/95 p-8 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
                  ➕
                </div>

                <h2 className="text-2xl font-bold">
                  {language === "hu" ? "Új termék" : "Produs nou"}
                </h2>

                <p className="mt-2 leading-relaxed text-gray-500">
                  {language === "hu"
                    ? "Új bérelhető vagy eladó termék felvitele."
                    : "Adăugarea unui produs nou pentru închiriere sau vânzare."}
                </p>

                <div className="mt-5 font-semibold text-orange-600">
                  {language === "hu" ? "Új termék felvitele →" : "Adaugă produs →"}
                </div>
              </Link>

            </div>

            {/* Vissza a weboldalra */}
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="font-semibold text-gray-600 transition hover:text-orange-600"
              >
                ←{" "}
                {language === "hu"
                  ? "Vissza a weboldalra"
                  : "Înapoi la site"}
              </Link>
            </div>
          </div>
        </main>
      )}

      {/* LÁBLÉC */}
      <footer className="bg-[#222b31] px-6 py-5 text-center text-xs text-gray-400">
        {t.copyright}
      </footer>
    </div>
  );
}