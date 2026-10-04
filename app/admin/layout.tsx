"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";

import { auth, googleProvider } from "../lib/firebase";

const ADMIN_EMAILS = [
  "it.zsolt.benedek@gmail.com",
  "veddvagybereld@gmail.com",
];

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        const email =
          currentUser?.email?.toLowerCase() ?? "";

        if (
          currentUser &&
          ADMIN_EMAILS.includes(email)
        ) {
          setUser(currentUser);
        } else {
          setUser(null);

          if (currentUser) {
            await signOut(auth);
          }
        }

        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  async function handleLogin() {
    setLoginError("");

    try {
      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const email =
        result.user.email?.toLowerCase() ?? "";

      if (!ADMIN_EMAILS.includes(email)) {
        await signOut(auth);

        setLoginError(
          "Ezzel a Google-fiókkal nincs jogosultság az admin felülethez."
        );

        return;
      }

      setUser(result.user);
    } catch (error) {
      console.error(
        "Google bejelentkezési hiba:",
        error
      );

      setLoginError(
        "A Google bejelentkezés nem sikerült."
      );
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setUser(null);

    window.location.href = "/";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ee]">
        <p className="text-gray-500">
          Jogosultság ellenőrzése...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ee] px-5">
        <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-xl">

          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            MolnarRent
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#222b31]">
            Admin bejelentkezés
          </h1>

          <p className="mt-3 text-gray-500">
            Az adminisztrációs felület
            használatához jelentkezz be az
            engedélyezett Google-fiókkal.
          </p>

          <button
            type="button"
            onClick={handleLogin}
            className="mt-7 w-full rounded-2xl bg-[#222b31] px-5 py-4 font-semibold text-white transition hover:bg-orange-600"
          >
            Bejelentkezés Google-fiókkal
          </button>

          {loginError && (
            <p className="mt-4 text-sm font-medium text-red-600">
              {loginError}
            </p>
          )}

          <a
            href="/"
            className="mt-5 inline-block text-sm font-semibold text-gray-500 transition hover:text-orange-600"
          >
            ← Vissza a weboldalra
          </a>

        </div>
      </main>
    );
  }

  return (
    <>
      <div className="bg-[#222b31] px-5 py-3 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">

          <div className="min-w-0 text-sm">
            <span className="text-gray-300">
              Bejelentkezve:{" "}
            </span>

            <span className="font-semibold">
              {user.email}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            Kijelentkezés
          </button>

        </div>
      </div>

      {children}
    </>
  );
}