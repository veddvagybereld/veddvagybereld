"use client";

import Image from "next/image";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1">

      {/* Magyar */}
      <button
        type="button"
        onClick={() => setLanguage("hu")}
        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
          language === "hu"
            ? "bg-orange-50 text-orange-600"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Magyar"
      >
        <Image
          src="/images/flag-hu.svg"
          alt="Magyar"
          width={24}
          height={16}
          className="rounded-[2px] shadow-sm"
        />

        <span>HU</span>
      </button>


      {/* Román */}
      <button
        type="button"
        onClick={() => setLanguage("ro")}
        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
          language === "ro"
            ? "bg-orange-50 text-orange-600"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Română"
      >
        <Image
          src="/images/flag-ro.svg"
          alt="Română"
          width={24}
          height={16}
          className="rounded-[2px] shadow-sm"
        />

        <span>RO</span>
      </button>

    </div>
  );
}