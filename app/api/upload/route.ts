import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { adminAuth } from "../../lib/firebase-admin";

export const runtime = "nodejs";

const ADMIN_EMAIL = "veddvagybereld@gmail.com";

export async function POST(request: Request) {
  try {
    // Firebase ID token kiolvasása
    const authorization =
      request.headers.get("authorization");

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        { error: "Nincs bejelentkezve." },
        { status: 401 }
      );
    }

    const idToken = authorization.substring(7);

    // Token ellenőrzése a Firebase szerveren
    const decodedToken =
      await adminAuth.verifyIdToken(idToken);

    const email =
      decodedToken.email?.toLowerCase() ?? "";

    if (
      !decodedToken.email_verified ||
      email !== ADMIN_EMAIL
    ) {
      return NextResponse.json(
        { error: "Nincs jogosultság a feltöltéshez." },
        { status: 403 }
      );
    }

    // Fájl feldolgozása
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Nincs kiválasztott fájl." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "A fájl üres." },
        { status: 400 }
      );
    }

    // Feltöltés Vercel Blobba
    const blob = await put(
      `uploads/${Date.now()}-${file.name}`,
      file,
      {
        access: "public",
        addRandomSuffix: true,
      }
    );

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error(
      "Védett Blob feltöltési hiba:",
      error
    );

    return NextResponse.json(
      {
        error:
          "A fájl feltöltése vagy a jogosultság ellenőrzése nem sikerült.",
      },
      { status: 500 }
    );
  }
}