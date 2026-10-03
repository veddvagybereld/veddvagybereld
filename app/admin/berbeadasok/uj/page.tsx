"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../../../lib/firebase";

type Language = "hu" | "ro";

type Category = {
  id: string;
  title: {
    hu: string;
    ro: string;
  };
  order: number;
};

type Product = {
  id: string;
  categoryId: string;
  title: {
    hu: string;
    ro: string;
  };
  rentable: boolean;
  order: number;
  media: Array<{
    type: string;
    url: string;
  }>;
};

type ContactData = {
  name: string;
  address: { hu: string; ro: string };
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
};

type SelectedProduct = {
  productId: string;
  quantity: number;
};

const texts = {
  hu: {
    rental: "Bérbeadási dokumentum",
    documentNumber: "Dokumentum sorszáma",
    rentalData: "Bérbeadás adatai",

    customerName: "Bérbevevő neve / Cégnév",
    customerNamePlaceholder: "Bérbevevő neve vagy cégnév",

    phone: "Telefonszám",

    address: "Cím",
    addressPlaceholder: "Bérbevevő címe",

    rentalDate: "Kiadás dátuma",

    products: "Bérelhető termékek",
    productsInfo:
      "Jelöld ki a kiadott termékeket, és add meg a mennyiséget.",

    product: "Termék",
    quantity: "Mennyiség",
    piece: "db",

    loading: "Betöltés...",

    noProducts:
      "Jelenleg nincs bérelhető termék.",

    loadError:
      "Nem sikerült betölteni a bérelhető termékeket.",

    note: "Megjegyzés",

    notePlaceholder:
      "A bérbeadással kapcsolatos egyéb megjegyzés...",

    lessorSignature:
      "Bérbeadó aláírása",

    lesseeSignature:
      "Bérbevevő aláírása",

    back:
      "Vissza az adminhoz",

    createPdf:
      "PDF készítése",

    creatingPdf:
      "PDF készítése...",

    selected:
      "kiválasztva",

    items:
      "termék",

    selectProduct:
      "Legalább egy terméket válassz ki.",

    invalidQuantity:
      "Minden kiválasztott terméknél legalább 1 db mennyiséget adj meg.",

    pdfError:
      "A PDF készítése nem sikerült.",
  },

  ro: {
    rental:
      "Document de închiriere",

    documentNumber:
      "Numărul documentului",

    rentalData:
      "Datele închirierii",

    customerName:
      "Numele chiriașului / Companie",

    customerNamePlaceholder:
      "Numele chiriașului sau al companiei",

    phone:
      "Telefon",

    address:
      "Adresă",

    addressPlaceholder:
      "Adresa chiriașului",

    rentalDate:
      "Data predării",

    products:
      "Produse de închiriat",

    productsInfo:
      "Selectează produsele predate și introdu cantitatea.",

    product:
      "Produs",

    quantity:
      "Cantitate",

    piece:
      "buc.",

    loading:
      "Se încarcă...",

    noProducts:
      "Momentan nu există produse disponibile pentru închiriere.",

    loadError:
      "Produsele de închiriat nu au putut fi încărcate.",

    note:
      "Observații",

    notePlaceholder:
      "Alte observații referitoare la închiriere...",

    lessorSignature:
      "Semnătura locatorului",

    lesseeSignature:
      "Semnătura chiriașului",

    back:
      "Înapoi la administrare",

    createPdf:
      "Creare PDF",

    creatingPdf:
      "Se creează PDF-ul...",

    selected:
      "selectate",

    items:
      "produse",

    selectProduct:
      "Selectează cel puțin un produs.",

    invalidQuantity:
      "Introdu cel puțin 1 bucată pentru fiecare produs selectat.",

    pdfError:
      "PDF-ul nu a putut fi creat.",
  },
};

// =========================================================
// Helyi dátum
// =========================================================

function createLocalDate() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// =========================================================
// Dokumentumsorszám
//
// Példa:
// MR-26-10-03-2214
// =========================================================

function createDocumentNumber() {
  const now = new Date();

  const year = String(
    now.getFullYear()
  ).slice(-2);

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const hour = String(
    now.getHours()
  ).padStart(2, "0");

  const minute = String(
    now.getMinutes()
  ).padStart(2, "0");

  return `MR-${year}-${month}-${day}-${hour}${minute}`;
}

export default function UjBerbeadasPage() {
  const [language, setLanguage] =
    useState<Language>("hu");

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [contact, setContact] =
    useState<ContactData>({
      name: "MolnarRent",
      address: { hu: "", ro: "" },
      phone: "",
      email: "",
      website: "",
      whatsapp: "",
    });

  const [
    selectedProducts,
    setSelectedProducts,
  ] = useState<
    Record<string, SelectedProduct>
  >({});

  const [
    customerName,
    setCustomerName,
  ] = useState("");

  const [
    customerAddress,
    setCustomerAddress,
  ] = useState("");

  const [
    customerPhone,
    setCustomerPhone,
  ] = useState("");

  const [
    rentalDate,
    setRentalDate,
  ] = useState("");

  const [
    documentNumber,
    setDocumentNumber,
  ] = useState("");

  const [
    note,
    setNote,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    pdfError,
    setPdfError,
  ] = useState("");

  const [
    creatingPdf,
    setCreatingPdf,
  ] = useState(false);

  const t = texts[language];

  // =========================================================
  // Kezdőértékek
  // =========================================================

  useEffect(() => {
    setRentalDate(
      createLocalDate()
    );

    setDocumentNumber(
      createDocumentNumber()
    );
  }, []);

  // =========================================================
  // Firestore adatok betöltése
  // =========================================================

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        // -----------------------------------------------------
        // Kategóriák
        // -----------------------------------------------------

        const categoriesSnapshot =
          await getDocs(
            query(
              collection(
                db,
                "categories"
              ),
              orderBy(
                "order",
                "asc"
              )
            )
          );

        const loadedCategories: Category[] =
          categoriesSnapshot.docs.map(
            (document) => {
              const data =
                document.data();

              return {
                id: document.id,

                title: {
                  hu:
                    data.title?.hu ??
                    data.title?.ro ??
                    "Névtelen kategória",

                  ro:
                    data.title?.ro ??
                    data.title?.hu ??
                    "Categorie fără nume",
                },

                order:
                  data.order ?? 0,
              };
            }
          );

        setCategories(
          loadedCategories
        );

        // -----------------------------------------------------
        // Termékek
        // -----------------------------------------------------

        const productsSnapshot =
          await getDocs(
            query(
              collection(
                db,
                "products"
              ),
              orderBy(
                "order",
                "asc"
              )
            )
          );

        const loadedProducts: Product[] =
          productsSnapshot.docs
            .map((document) => {
              const data =
                document.data();

              return {
                id: document.id,

                categoryId:
                  data.categoryId ??
                  "",

                title: {
                  hu:
                    data.title?.hu ??
                    data.title?.ro ??
                    "Névtelen termék",

                  ro:
                    data.title?.ro ??
                    data.title?.hu ??
                    "Produs fără nume",
                },

                rentable:
                  data.rentable ===
                  true,

                order:
                  data.order ?? 0,

                media:
                  Array.isArray(data.media)
                    ? data.media
                        .map((item) => {
                          const url =
                            typeof item?.url === "string"
                              ? item.url
                              : typeof item?.imageUrl === "string"
                                ? item.imageUrl
                                : typeof item?.src === "string"
                                  ? item.src
                                  : "";

                          return {
                            type: item?.type ?? "image",
                            url,
                          };
                        })
                        .filter((item) => Boolean(item.url))
                    : [],
              };
            })
            .filter(
              (product) =>
                product.rentable
            );

        setProducts(
          loadedProducts
        );

        // Kapcsolati adatok
        const contactSnap = await getDoc(
          doc(db, "siteSettings", "contact")
        );

        if (contactSnap.exists()) {
          const data = contactSnap.data();

          setContact({
            name: data.name ?? "MolnarRent",
            address: {
              hu: data.address?.hu ?? "",
              ro: data.address?.ro ?? "",
            },
            phone: data.phone ?? "",
            email: data.email ?? "",
            website: data.website ?? "",
            whatsapp: data.whatsapp ?? "",
          });
        }
      } catch (err) {
        console.error(
          "Hiba a bérelhető termékek betöltésekor:",
          err
        );

        setError(
          texts.hu.loadError
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // =========================================================
  // Csak olyan kategória, amelyben van bérelhető termék
  // =========================================================

  const rentableCategories =
    useMemo(() => {
      return categories.filter(
        (category) =>
          products.some(
            (product) =>
              product.categoryId ===
              category.id
          )
      );
    }, [
      categories,
      products,
    ]);

  // =========================================================
  // Kijelölt termékek száma
  // =========================================================

  const selectedCount =
    Object.keys(
      selectedProducts
    ).length;

  // =========================================================
  // Termék kijelölése
  // =========================================================

  function toggleProduct(
    productId: string
  ) {
    setPdfError("");

    setSelectedProducts(
      (current) => {
        const next = {
          ...current,
        };

        if (next[productId]) {
          delete next[
            productId
          ];
        } else {
          next[productId] = {
            productId,
            quantity: 1,
          };
        }

        return next;
      }
    );
  }

  // =========================================================
  // Teljes kategória kijelölése
  // =========================================================

  function toggleCategory(
    categoryId: string
  ) {
    setPdfError("");

    const categoryProducts =
      products.filter(
        (product) =>
          product.categoryId ===
          categoryId
      );

    const allSelected =
      categoryProducts.length >
        0 &&
      categoryProducts.every(
        (product) =>
          Boolean(
            selectedProducts[
              product.id
            ]
          )
      );

    setSelectedProducts(
      (current) => {
        const next = {
          ...current,
        };

        if (allSelected) {
          categoryProducts.forEach(
            (product) => {
              delete next[
                product.id
              ];
            }
          );
        } else {
          categoryProducts.forEach(
            (product) => {
              if (
                !next[
                  product.id
                ]
              ) {
                next[
                  product.id
                ] = {
                  productId:
                    product.id,

                  quantity: 1,
                };
              }
            }
          );
        }

        return next;
      }
    );
  }

  // =========================================================
  // Mennyiség
  // =========================================================

  function changeQuantity(
    productId: string,
    value: string
  ) {
    setPdfError("");

    const quantity =
      Number(value);

    setSelectedProducts(
      (current) => {
        if (
          !current[
            productId
          ]
        ) {
          return current;
        }

        return {
          ...current,

          [productId]: {
            ...current[
              productId
            ],

            quantity:
              Number.isFinite(
                quantity
              ) &&
              quantity >= 0
                ? quantity
                : 0,
          },
        };
      }
    );
  }

  // =========================================================
  // Termék neve
  // =========================================================

  function getProductTitle(
    product: Product
  ) {
    if (
      language === "ro"
    ) {
      return (
        product.title.ro ||
        product.title.hu
      );
    }

    return (
      product.title.hu ||
      product.title.ro
    );
  }

  // =========================================================
  // Kategória neve
  // =========================================================

  function getCategoryTitle(
    category: Category
  ) {
    if (
      language === "ro"
    ) {
      return (
        category.title.ro ||
        category.title.hu
      );
    }

    return (
      category.title.hu ||
      category.title.ro
    );
  }

  // =========================================================
  // PDF generálás
  // =========================================================

  async function handleCreatePdf() {
    try {
      setPdfError("");

      // -------------------------------------------------------
      // Legalább egy termék
      // -------------------------------------------------------

      const selectedProductIds =
        Object.keys(
          selectedProducts
        );

      if (
        selectedProductIds.length ===
        0
      ) {
        setPdfError(
          t.selectProduct
        );

        return;
      }

      // -------------------------------------------------------
      // Mennyiségek ellenőrzése
      // -------------------------------------------------------

      const hasInvalidQuantity =
        selectedProductIds.some(
          (productId) => {
            const quantity =
              selectedProducts[
                productId
              ]?.quantity;

            return (
              !Number.isFinite(
                quantity
              ) ||
              quantity < 1
            );
          }
        );

      if (
        hasInvalidQuantity
      ) {
        setPdfError(
          t.invalidQuantity
        );

        return;
      }

      setCreatingPdf(true);

      // -------------------------------------------------------
      // Kapcsolati adatok friss betöltése közvetlenül PDF előtt
      // -------------------------------------------------------

      let pdfContact = contact;

      try {
        const contactSnap = await getDoc(
          doc(db, "siteSettings", "contact")
        );

        if (contactSnap.exists()) {
          const data = contactSnap.data();

          pdfContact = {
            name: data.name ?? "MolnarRent",
            address: {
              hu: data.address?.hu ?? "",
              ro: data.address?.ro ?? "",
            },
            phone: data.phone ?? "",
            email: data.email ?? "",
            website: data.website ?? "",
            whatsapp: data.whatsapp ?? "",
          };

          setContact(pdfContact);
        }
      } catch (contactError) {
        console.warn(
          "A kapcsolati adatok frissítése nem sikerült, a betöltött adatokat használjuk:",
          contactError
        );
      }

      // -------------------------------------------------------
      // PDF terméklista
      // -------------------------------------------------------

      const pdfProducts =
        products
          .filter(
            (product) =>
              Boolean(
                selectedProducts[
                  product.id
                ]
              )
          )
          .map(
            (product) => {
              const category =
                categories.find(
                  (item) =>
                    item.id ===
                    product.categoryId
                );

              return {
                categoryName:
                  category
                    ? getCategoryTitle(
                        category
                      )
                    : "-",

                productName:
                  getProductTitle(
                    product
                  ),

                quantity:
                  selectedProducts[
                    product.id
                  ].quantity,

                imageUrl:
                  product.media.find(
                    (item) => Boolean(item.url)
                  )?.url ?? "",
              };
            }
          );

      // -------------------------------------------------------
      // API hívás
      // -------------------------------------------------------

      const response =
        await fetch(
          "/api/rentals/pdf",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              {
                language,

                documentNumber,

                customerName:
                  customerName.trim(),

                customerAddress:
                  customerAddress.trim(),

                customerPhone:
                  customerPhone.trim(),

                rentalDate,

                note:
                  note.trim(),

                lessor: {
                  name: pdfContact.name || "MolnarRent",
                  address:
                    language === "ro"
                      ? pdfContact.address.ro || pdfContact.address.hu
                      : pdfContact.address.hu || pdfContact.address.ro,
                  phone: pdfContact.phone,
                  email: pdfContact.email,
                  website: pdfContact.website,
                  whatsapp: pdfContact.whatsapp,
                },

                products:
                  pdfProducts,
              }
            ),
          }
        );

      // -------------------------------------------------------
      // API hiba
      // -------------------------------------------------------

      if (!response.ok) {
        let message =
          t.pdfError;

        try {
          const errorData =
            await response.json();

          if (
            errorData?.error
          ) {
            message =
              errorData.error;
          }
        } catch {
          // Ha nem JSON érkezik,
          // marad az alap hibaüzenet.
        }

        throw new Error(
          message
        );
      }

      // -------------------------------------------------------
      // PDF Blob
      // -------------------------------------------------------

      const blob =
        await response.blob();

      const pdfUrl =
        URL.createObjectURL(
          blob
        );

      // -------------------------------------------------------
      // Letöltés
      // -------------------------------------------------------

      const link =
        document.createElement(
          "a"
        );

      link.href =
        pdfUrl;

      link.download =
        `${documentNumber}.pdf`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      // -------------------------------------------------------
      // Blob URL felszabadítása
      // -------------------------------------------------------

      setTimeout(() => {
        URL.revokeObjectURL(
          pdfUrl
        );
      }, 1000);
    } catch (err) {
      console.error(
        "PDF készítési hiba:",
        err
      );

      if (
        err instanceof Error
      ) {
        setPdfError(
          err.message ||
            t.pdfError
        );
      } else {
        setPdfError(
          t.pdfError
        );
      }
    } finally {
      setCreatingPdf(false);
    }
  }

  // =========================================================
  // OLDAL
  // =========================================================

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">

        {/* ===================================================
            FEJLÉC
        =================================================== */}

        <section className="mb-8 rounded-[24px] bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

            {/* Logó */}

            <div className="flex items-center gap-5">

              <Image
                src="/images/logo-mark.svg"
                alt="MolnarRent"
                width={72}
                height={72}
                priority
                className="h-[72px] w-[72px]"
              />

              <div>

                <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
                  MolnarRent
                </p>

                <h1 className="mt-1 text-3xl font-bold text-[#222b31]">
                  {t.rental}
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  {t.documentNumber}:{" "}

                  <span className="font-bold text-[#222b31]">
                    {documentNumber ||
                      "—"}
                  </span>
                </p>

              </div>

            </div>

            {/* Nyelvválasztó */}

            <div className="flex items-center gap-2 rounded-xl bg-[#f4f1eb] p-1">

              <button
                type="button"
                onClick={() =>
                  setLanguage(
                    "hu"
                  )
                }
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  language ===
                  "hu"
                    ? "bg-orange-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                HU
              </button>

              <button
                type="button"
                onClick={() =>
                  setLanguage(
                    "ro"
                  )
                }
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  language ===
                  "ro"
                    ? "bg-orange-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                RO
              </button>

            </div>

          </div>

        </section>

        {/* ===================================================
            BÉRBEADÁS ADATAI
        =================================================== */}

        <section className="mb-8 rounded-[24px] bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-xl font-bold text-[#222b31]">
            {t.rentalData}
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            {/* Név */}

            <label className="block">

              <span className="mb-2 block text-sm font-semibold text-gray-700">
                {t.customerName}
              </span>

              <input
                type="text"
                value={
                  customerName
                }
                onChange={(
                  event
                ) =>
                  setCustomerName(
                    event.target
                      .value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500"
                placeholder={
                  t.customerNamePlaceholder
                }
              />

            </label>

            {/* Telefon */}

            <label className="block">

              <span className="mb-2 block text-sm font-semibold text-gray-700">
                {t.phone}
              </span>

              <input
                type="text"
                value={
                  customerPhone
                }
                onChange={(
                  event
                ) =>
                  setCustomerPhone(
                    event.target
                      .value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500"
                placeholder="+36..."
              />

            </label>

            {/* Cím */}

            <label className="block">

              <span className="mb-2 block text-sm font-semibold text-gray-700">
                {t.address}
              </span>

              <input
                type="text"
                value={
                  customerAddress
                }
                onChange={(
                  event
                ) =>
                  setCustomerAddress(
                    event.target
                      .value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500"
                placeholder={
                  t.addressPlaceholder
                }
              />

            </label>

            {/* Dátum */}

            <label className="block">

              <span className="mb-2 block text-sm font-semibold text-gray-700">
                {t.rentalDate}
              </span>

              <input
                type="date"
                value={
                  rentalDate
                }
                onChange={(
                  event
                ) =>
                  setRentalDate(
                    event.target
                      .value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500"
              />

            </label>

          </div>

        </section>

        {/* ===================================================
            BÉRELHETŐ TERMÉKEK
        =================================================== */}

        <section className="mb-8 rounded-[24px] bg-white p-6 shadow-sm">

          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">

            <div>

              <h2 className="text-xl font-bold text-[#222b31]">
                {t.products}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {t.productsInfo}
              </p>

            </div>

            <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
              {selectedCount}{" "}
              {t.selected}
            </div>

          </div>

          {loading ? (

            <div className="py-10 text-center text-gray-500">
              {t.loading}
            </div>

          ) : error ? (

            <div className="rounded-xl bg-red-50 p-4 text-red-700">
              {language ===
              "hu"
                ? error
                : texts.ro
                    .loadError}
            </div>

          ) : rentableCategories.length ===
            0 ? (

            <div className="py-10 text-center text-gray-500">
              {t.noProducts}
            </div>

          ) : (

            <div className="space-y-6">

              {rentableCategories.map(
                (category) => {

                  const categoryProducts =
                    products.filter(
                      (product) =>
                        product.categoryId ===
                        category.id
                    );

                  const allSelected =
                    categoryProducts.length >
                      0 &&
                    categoryProducts.every(
                      (product) =>
                        Boolean(
                          selectedProducts[
                            product.id
                          ]
                        )
                    );

                  return (
                    <div
                      key={
                        category.id
                      }
                      className="overflow-hidden rounded-2xl border border-gray-200"
                    >

                      {/* Kategória */}

                      <div className="flex items-center gap-3 bg-[#f4f1eb] px-5 py-4">

                        <input
                          type="checkbox"
                          checked={
                            allSelected
                          }
                          onChange={() =>
                            toggleCategory(
                              category.id
                            )
                          }
                          className="h-5 w-5 cursor-pointer accent-orange-600"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            toggleCategory(
                              category.id
                            )
                          }
                          className="text-left text-lg font-bold text-[#222b31]"
                        >
                          {getCategoryTitle(
                            category
                          )}
                        </button>

                        <span className="ml-auto text-sm text-gray-500">
                          {
                            categoryProducts.length
                          }{" "}
                          {t.items}
                        </span>

                      </div>

                      {/* Oszlopfejléc */}

                      <div className="grid grid-cols-[44px_56px_minmax(0,1fr)_150px] items-center border-t border-gray-200 bg-gray-50 px-5 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">

                        <div />

                        <div aria-hidden="true" />

                        <div>
                          {t.product}
                        </div>

                        <div className="text-center">
                          {t.quantity}
                        </div>

                      </div>

                      {/* Termékek */}

                      <div className="divide-y divide-gray-100">

                        {categoryProducts.map(
                          (product) => {

                            const selected =
                              Boolean(
                                selectedProducts[
                                  product.id
                                ]
                              );

                            return (
                              <div
                                key={
                                  product.id
                                }
                                className={`grid grid-cols-[44px_56px_minmax(0,1fr)_150px] items-center px-5 py-3 transition ${
                                  selected
                                    ? "bg-orange-50/50"
                                    : "hover:bg-gray-50"
                                }`}
                              >

                                {/* Checkbox */}

                                <div>

                                  <input
                                    type="checkbox"
                                    checked={
                                      selected
                                    }
                                    onChange={() =>
                                      toggleProduct(
                                        product.id
                                      )
                                    }
                                    className="h-5 w-5 cursor-pointer accent-orange-600"
                                  />

                                </div>

                                {/* Termékkép */}

                                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                                  {(() => {
                                    const imageUrl =
                                      product.media.find(
                                        (item) =>
                                          item.type === "image" &&
                                          Boolean(item.url)
                                      )?.url ?? "";

                                    return imageUrl ? (
                                      <img
                                        src={imageUrl}
                                        alt={getProductTitle(product)}
                                        className="h-full w-full object-contain p-1"
                                      />
                                    ) : (
                                      <span className="text-[10px] text-gray-300">
                                        —
                                      </span>
                                    );
                                  })()}
                                </div>

                                {/* Terméknév */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleProduct(
                                      product.id
                                    )
                                  }
                                  className="pr-4 text-left font-medium text-gray-800"
                                >
                                  {getProductTitle(
                                    product
                                  )}
                                </button>

                                {/* Mennyiség */}

                                <div className="flex items-center justify-end gap-2">

                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    disabled={
                                      !selected
                                    }
                                    value={
                                      selected
                                        ? selectedProducts[
                                            product.id
                                          ]
                                            ?.quantity ??
                                          1
                                        : ""
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      changeQuantity(
                                        product.id,
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                    className={`w-20 rounded-lg border px-3 py-2 text-center font-bold outline-none transition ${
                                      selected
                                        ? "border-gray-300 bg-white focus:border-orange-500"
                                        : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-300"
                                    }`}
                                    placeholder="—"
                                  />

                                  <span
                                    className={`w-10 text-sm font-medium ${
                                      selected
                                        ? "text-gray-600"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    {t.piece}
                                  </span>

                                </div>

                              </div>
                            );
                          }
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* ===================================================
            MEGJEGYZÉS
        =================================================== */}

        <section className="mb-8 rounded-[24px] bg-white p-6 shadow-sm">

          <label className="block">

            <span className="mb-3 block text-xl font-bold text-[#222b31]">
              {t.note}
            </span>

            <textarea
              value={note}
              onChange={(
                event
              ) => {
                setNote(
                  event.target
                    .value
                );

                setPdfError("");
              }}
              rows={6}
              className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 leading-relaxed outline-none transition focus:border-orange-500"
              placeholder={
                t.notePlaceholder
              }
            />

          </label>

        </section>

        {/* ===================================================
            ALÁÍRÁSOK
        =================================================== */}

        <section className="mb-8 rounded-[24px] bg-white px-6 pb-8 pt-10 shadow-sm">

          <div className="grid gap-16 sm:grid-cols-2">

            <div className="pt-12">

              <div className="border-t border-gray-500 pt-3 text-center font-semibold text-[#222b31]">
                {
                  t.lessorSignature
                }
              </div>

            </div>

            <div className="pt-12">

              <div className="border-t border-gray-500 pt-3 text-center font-semibold text-[#222b31]">
                {
                  t.lesseeSignature
                }
              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            PDF HIBA
        =================================================== */}

        {pdfError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-medium text-red-700">
            {pdfError}
          </div>
        )}

        {/* ===================================================
            ALSÓ GOMBOK
        =================================================== */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href="/admin"
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            ← {t.back}
          </Link>

          <button
            type="button"
            onClick={
              handleCreatePdf
            }
            disabled={
              creatingPdf
            }
            className={`rounded-xl px-7 py-3 font-bold text-white shadow-sm transition ${
              creatingPdf
                ? "cursor-wait bg-orange-400"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {creatingPdf
              ? t.creatingPdf
              : t.createPdf}
          </button>

        </div>

      </div>
    </main>
  );
}