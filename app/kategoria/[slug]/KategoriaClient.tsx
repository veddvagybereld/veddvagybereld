"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import Link from "next/link";

import type { Category, Product, MediaItem } from "./types";

import LanguageSelector from "../../components/LanguageSelector";

import { useLanguage } from "../../context/LanguageContext";

export default function KategoriaClient({ category, products, backgroundImageUrl }: { category: Category; products: Product[]; backgroundImageUrl: string }) {

  const { t, language } = useLanguage();

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const [productImageIndexes, setProductImageIndexes] = useState<Record<string, number>>({});

  const [lightbox, setLightbox] = useState<{

    productId: string;

    productTitle: string;

    images: MediaItem[];

    index: number;

  } | null>(null);

  function changeProductImage(productId: string, imageCount: number, direction: -1 | 1) {

    setProductImageIndexes((current) => {

      const currentIndex = current[productId] ?? 0;

      const nextIndex = (currentIndex + direction + imageCount) % imageCount;

      return {

        ...current,

        [productId]: nextIndex,

      };

    });

  }

  function openProductLightbox(

    productId: string,

    productTitle: string,

    images: MediaItem[],

    index: number

  ) {

    setLightbox({

      productId,

      productTitle,

      images,

      index,

    });

  }

  function changeLightboxImage(direction: -1 | 1) {

    setLightbox((current) => {

      if (!current || current.images.length === 0) {

        return current;

      }

      const nextIndex =

        (current.index + direction + current.images.length) %

        current.images.length;

      return {

        ...current,

        index: nextIndex,

      };

    });

  }

  useEffect(() => {

    if (!lightbox) {

      return;

    }

    function handleKeyDown(event: KeyboardEvent) {

      if (event.key === "Escape") {

        setLightbox(null);

      }

      if (event.key === "ArrowLeft") {

        changeLightboxImage(-1);

      }

      if (event.key === "ArrowRight") {

        changeLightboxImage(1);

      }

    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {

      window.removeEventListener("keydown", handleKeyDown);

    };

  }, [lightbox]);

  function previousMedia() {

    if (!category || category.media.length === 0) {

      return;

    }

    setCurrentMediaIndex((current) =>

      current === 0 ? category.media.length - 1 : current - 1

    );

  }

  function nextMedia() {

    if (!category || category.media.length === 0) {

      return;

    }

    setCurrentMediaIndex((current) =>

      current === category.media.length - 1 ? 0 : current + 1

    );

  }

  const isRomanian = language === "ro";

  const title =

    (isRomanian ? category.title.ro : category.title.hu) ||

    category.title.hu;

  const intro =

    (isRomanian ? category.intro.ro : category.intro.hu) ||

    category.intro.hu;

  const currentMedia = category.media[currentMediaIndex];

  return (

    <div className="min-h-screen bg-[#f4f1eb] text-[#222b31]">

      {/* Fejléc */}

      <header className="relative z-20 border-b border-black/5 bg-white/95 shadow-sm">

        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">

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

                <span className="text-orange-600">

                  {t.heroTitle1}

                </span>

                <span className="text-[#222b31]">

                  {" "}

                  {t.heroTitle2}{" "}

                </span>

                <span className="text-orange-600">

                  {t.heroTitle3}

                </span>

              </div>

              <div className="hidden text-xs tracking-wide text-gray-500 sm:block">

                {t.siteSubtitle}

              </div>

            </div>

          </Link>

          <div className="flex items-center gap-2 sm:gap-4">

            <Link

              href="/kapcsolat"

              className="hidden text-sm font-medium text-gray-700 transition hover:text-orange-600 sm:block"

            >

              {t.contact}

            </Link>

            <LanguageSelector />

          </div>

        </div>

      </header>

      {/* Háttér */}

        <div

          className="min-h-[calc(100vh-86px)] bg-[#f4f1eb] bg-cover bg-center bg-fixed bg-no-repeat"

          style={

            backgroundImageUrl

              ? {

                  backgroundImage: `linear-gradient(

                    rgba(247,244,238,0.76),

                    rgba(247,244,238,0.88)

                  ), url("${backgroundImageUrl}")`,

                }

              : undefined

          }

        >

        {/* Kategória fejléc */}

        <main className="mx-auto max-w-6xl px-6 pb-16 pt-14">

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">

            {title}

          </h1>

          {/* 75 / 25 rész */}

          <section className="mt-10 grid items-start gap-12 lg:grid-cols-[2fr_1fr]">

            {/* Bal oldal: szöveg közvetlenül a háttéren */}

            <div>

              {intro ? (

                <p className="max-w-3xl whitespace-pre-line text-lg leading-8 text-gray-700">

                  {intro}

                </p>

              ) : (

                <p className="italic text-gray-500">

                  Ehhez a kategóriához még nincs bevezető szöveg.

                </p>

              )}

            </div>

            {/* Jobb oldal: nagyobb média, beljebb húzva a lap szélétől */}

            <div className="lg:mr-8">

              {currentMedia ? (

                <>

                  <div className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-lg">

                    {/* Kép */}

                    {currentMedia.type === "image" && (

                      <button

                        type="button"

                        onClick={() =>

                          window.open(currentMedia.url, "_blank")

                        }

                        className="block w-full cursor-zoom-in"

                        title="Kép megnyitása"

                      >

                        <img

                          src={currentMedia.url}

                          alt={currentMedia.name}

                          className="aspect-square w-full object-cover"

                        />

                      </button>

                    )}

                    {/* Videó */}

                    {currentMedia.type === "video" && (

                      <video

                        src={currentMedia.url}

                        controls

                        className="aspect-square w-full bg-black object-contain"

                      >

                        A böngésző nem támogatja a videólejátszást.

                      </video>

                    )}

                    {/* Dokumentum */}

                    {currentMedia.type === "document" && (

                      <div className="flex aspect-square flex-col items-center justify-center p-6 text-center">

                        <div className="text-6xl">

                          📄

                        </div>

                        <p className="mt-4 break-all font-bold">

                          {currentMedia.name}

                        </p>

                        <a

                          href={currentMedia.url}

                          target="_blank"

                          rel="noreferrer"

                          className="mt-5 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white"

                        >

                          PDF megnyitása

                        </a>

                      </div>

                    )}

                  </div>

                  {/* Lapozás */}

                  {category.media.length > 1 && (

                    <div className="mt-4 flex items-center justify-between">

                      <button

                        type="button"

                        onClick={previousMedia}

                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-xl font-bold shadow-sm transition hover:bg-gray-50"

                        aria-label="Előző média"

                      >

                        ‹

                      </button>

                      <div className="flex items-center gap-2">

                        {category.media.map((_, index) => (

                          <button

                            key={index}

                            type="button"

                            onClick={() => setCurrentMediaIndex(index)}

                            aria-label={`${index + 1}. média`}

                            className={`h-2.5 w-2.5 rounded-full ${

                              index === currentMediaIndex

                                ? "bg-orange-600"

                                : "bg-gray-300"

                            }`}

                          />

                        ))}

                      </div>

                      <button

                        type="button"

                        onClick={nextMedia}

                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-xl font-bold shadow-sm transition hover:bg-gray-50"

                        aria-label="Következő média"

                      >

                        ›

                      </button>

                    </div>

                  )}

                  <p className="mt-2 text-center text-xs text-gray-500">

                    {currentMediaIndex + 1} / {category.media.length}

                  </p>

                </>

              ) : (

                <div className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white/40 p-6 text-center text-gray-500">

                  Ehhez a kategóriához még nincs média feltöltve.

                </div>

              )}

            </div>

          </section>

          {/* Termékek */}

          <section className="mt-16 border-t border-black/10 pt-10">

            <h2 className="text-2xl font-bold text-[#222b31] sm:text-3xl">

              {isRomanian ? "Produse" : "Termékek"}

            </h2>

            {products.length === 0 ? (

              <p className="mt-5 text-gray-500">

                {isRomanian

                  ? "În această categorie nu există încă produse active."

                  : "Ebben a kategóriában még nincs aktív termék."}

              </p>

            ) : (

              <div className="mt-7 grid gap-6 md:grid-cols-2">

                {products.map((product) => {

                  const productTitle =

                    (isRomanian ? product.title.ro : product.title.hu) ||

                    product.title.hu;

                  const productDescription =

                    (isRomanian

                      ? product.description.ro

                      : product.description.hu) ||

                    product.description.hu;

                  const productImages = product.media.filter(

                    (item) => item.type === "image"

                  );

                  const imageIndex = Math.min(

                    productImageIndexes[product.id] ?? 0,

                    Math.max(productImages.length - 1, 0)

                  );

                  const currentProductImage = productImages[imageIndex];

                  const visibleProperties = product.properties

                    .map((property) => ({

                      label:

                        (isRomanian ? property.label.ro : property.label.hu) ||

                        property.label.hu,

                      value:

                        (isRomanian ? property.value.ro : property.value.hu) ||

                        property.value.hu,

                    }))

                    .filter((property) => property.label || property.value);

                  return (

                    <article

                      key={product.id}

                      className="min-h-[280px] overflow-hidden rounded-[24px] border border-orange-300 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:border-orange-500 hover:shadow-xl"

                    >

                      <div className="flex min-h-[280px]">

                        {/* Bal oldal: lapozható képgaléria - 40% */}

                        <div className="relative m-3 mr-0 w-[40%] shrink-0 overflow-hidden rounded-2xl border border-gray-300 bg-gray-100 shadow-sm">

                          {currentProductImage ? (

                            <button

                              type="button"

                              onClick={() =>

                                openProductLightbox(

                                  product.id,

                                  productTitle,

                                  productImages,

                                  imageIndex

                                )

                              }

                              className="block h-full w-full cursor-zoom-in"

                              title={

                                isRomanian

                                  ? "Mărește imaginea"

                                  : "Kép nagyítása"

                              }

                            >

                              <img

                                src={currentProductImage.url}

                                alt={productTitle}

                                className="h-full w-full object-cover"

                              />

                            </button>

                          ) : (

                            <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-gray-400">

                              {isRomanian

                                ? "Nu există imagine"

                                : "Nincs feltöltött kép"}

                            </div>

                          )}

                          {productImages.length > 1 && (

                            <>

                              <button

                                type="button"

                                onClick={() =>

                                  changeProductImage(

                                    product.id,

                                    productImages.length,

                                    -1

                                  )

                                }

                                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-[#222b31] shadow transition hover:bg-white"

                                aria-label={

                                  isRomanian ? "Imaginea anterioară" : "Előző kép"

                                }

                              >

                                ‹

                              </button>

                              <button

                                type="button"

                                onClick={() =>

                                  changeProductImage(

                                    product.id,

                                    productImages.length,

                                    1

                                  )

                                }

                                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-[#222b31] shadow transition hover:bg-white"

                                aria-label={

                                  isRomanian ? "Imaginea următoare" : "Következő kép"

                                }

                              >

                                ›

                              </button>

                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">

                                {imageIndex + 1} / {productImages.length}

                              </div>

                            </>

                          )}

                        </div>

                        {/* Jobb oldal: minden publikus termékadat - 60% */}

                        <div className="flex min-w-0 flex-1 flex-col p-5">

                          <div className="flex items-start justify-between gap-3">

                            <h3 className="text-xl font-bold leading-tight text-[#222b31]">

                              {productTitle}

                            </h3>

                            {product.rentable && (

                              <span className="shrink-0 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">

                                {isRomanian ? "De închiriat" : "Bérelhető"}

                              </span>

                            )}

                          </div>

                          {productDescription && (

                            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">

                              {productDescription}

                            </p>

                          )}

                          {visibleProperties.length > 0 && (

                            <div className="mt-4 border-t border-gray-200 pt-3">

                              <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-x-4 gap-y-1.5 text-sm">

                                {visibleProperties.map((property, index) => (

                                  <div key={index} className="contents">

                                    <div className="font-semibold text-gray-500">

                                      {property.label}

                                    </div>

                                    <div className="font-medium text-[#222b31]">

                                      {property.value}

                                    </div>

                                  </div>

                                ))}

                              </div>

                            </div>

                          )}

                        </div>

                      </div>

                    </article>

                  );

                })}

              </div>

            )}

          </section>

          <div className="mt-12">

            <Link

              href="/"

              className="inline-flex items-center gap-3 rounded-xl bg-[#222b31] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#354149]"

            >

              <span className="text-xl">←</span>

              <span>{t.backToHome}</span>

            </Link>

          </div>

        </main>

      </div>

      {/* Termékkép nagyított nézete */}

      {lightbox && lightbox.images[lightbox.index] && (

        <div

          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 sm:p-8"

          onClick={() => setLightbox(null)}

        >

          <div

            className="relative w-full max-w-4xl overflow-hidden rounded-[24px] bg-white p-3 shadow-2xl sm:p-4"

            onClick={(event) => event.stopPropagation()}

          >

            <button

              type="button"

              onClick={() => setLightbox(null)}

              className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-2xl font-bold text-[#222b31] shadow-md transition hover:bg-white"

              aria-label={isRomanian ? "Închide" : "Bezárás"}

            >

              ×

            </button>

            <div className="relative flex h-[min(62vh,620px)] items-center justify-center overflow-hidden rounded-2xl bg-gray-100">

              <img

                src={lightbox.images[lightbox.index].url}

                alt={`${lightbox.productTitle} ${lightbox.index + 1}`}

                className="h-full w-full object-contain"

              />

              {lightbox.images.length > 1 && (

                <>

                  <button

                    type="button"

                    onClick={() => changeLightboxImage(-1)}

                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl font-bold text-[#222b31] shadow-md transition hover:bg-white"

                    aria-label={

                      isRomanian ? "Imaginea anterioară" : "Előző kép"

                    }

                  >

                    ‹

                  </button>

                  <button

                    type="button"

                    onClick={() => changeLightboxImage(1)}

                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl font-bold text-[#222b31] shadow-md transition hover:bg-white"

                    aria-label={

                      isRomanian ? "Imaginea următoare" : "Következő kép"

                    }

                  >

                    ›

                  </button>

                </>

              )}

            </div>

            <div className="flex items-center justify-between gap-4 px-1 pb-1 pt-3">

              <p className="min-w-0 truncate font-semibold text-[#222b31]">

                {lightbox.productTitle}

              </p>

              <p className="shrink-0 text-sm font-semibold text-gray-500">

                {lightbox.index + 1} / {lightbox.images.length}

              </p>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}