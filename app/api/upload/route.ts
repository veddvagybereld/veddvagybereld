import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
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
    console.error("Blob feltöltési hiba:", error);

    return NextResponse.json(
      { error: "A fájl feltöltése nem sikerült." },
      { status: 500 }
    );
  }
}