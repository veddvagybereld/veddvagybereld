import { NextResponse } from "next/server";
import { PDFDocument, PDFFont, PDFImage, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

type Language = "hu" | "ro";

type RentalProduct = {
  categoryName: string;
  productName: string;
  quantity: number;
  imageUrl?: string;
};

type Lessor = {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  whatsapp?: string;
};

type RentalPdfRequest = {
  language: Language;
  documentNumber: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  rentalDate: string;
  note: string;
  lessor?: Lessor;
  products: RentalProduct[];
};

const texts = {
  hu: {
    title: "Bérbeadási dokumentum",
    documentNumber: "Dokumentum sorszáma",
    lessorData: "Bérbeadó",
    customerData: "Bérbevevő adatai",
    customerName: "Név / Cégnév",
    address: "Cím",
    phone: "Telefonszám",
    email: "E-mail",
    website: "Weboldal",
    whatsapp: "WhatsApp",
    rentalDate: "Kiadás dátuma",
    product: "Termék",
    quantity: "Mennyiség",
    piece: "db",
    note: "Megjegyzés",
    lessorSignature: "Bérbeadó aláírása",
    lesseeSignature: "Bérbevevő aláírása",
    page: "Oldal",
  },
  ro: {
    title: "Document de închiriere",
    documentNumber: "Numărul documentului",
    lessorData: "Locator",
    customerData: "Datele chiriașului",
    customerName: "Nume / Companie",
    address: "Adresă",
    phone: "Telefon",
    email: "E-mail",
    website: "Website",
    whatsapp: "WhatsApp",
    rentalDate: "Data predării",
    product: "Produs",
    quantity: "Cantitate",
    piece: "buc.",
    note: "Observații",
    lessorSignature: "Semnătura locatorului",
    lesseeSignature: "Semnătura chiriașului",
    page: "Pagina",
  },
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const LEFT = 48;
const RIGHT = 48;
const TOP = 42;
const CONTENT_WIDTH = PAGE_WIDTH - LEFT - RIGHT;
const CONTENT_BOTTOM = 175; // az aláírásoknak fenntartott alsó terület

const ORANGE = rgb(230 / 255, 105 / 255, 35 / 255);
const DARK = rgb(34 / 255, 43 / 255, 49 / 255);
const GRAY = rgb(105 / 255, 105 / 255, 105 / 255);
const BORDER = rgb(220 / 255, 220 / 255, 220 / 255);
const LIGHT = rgb(247 / 255, 244 / 255, 238 / 255);
const VERY_LIGHT = rgb(250 / 255, 250 / 255, 250 / 255);

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
  const paragraphs = (text || "").split(/\r?\n/);
  const result: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      result.push("");
      continue;
    }

    const words = paragraph.trim().split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width <= maxWidth || !currentLine) {
        currentLine = testLine;
      } else {
        result.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) result.push(currentLine);
  }

  return result.length ? result : [""];
}

function formatDate(value: string, language: Language) {
  if (!value) return "-";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  const [year, month, day] = parts;
  return language === "ro" ? `${day}.${month}.${year}` : `${year}.${month}.${day}.`;
}

async function embedRemoteImage(pdfDoc: PDFDocument, url?: string): Promise<PDFImage | null> {
  if (!url) return null;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;

    const bytes = new Uint8Array(await response.arrayBuffer());
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    const lowerUrl = url.toLowerCase();

    const isPng =
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47;

    const isJpeg =
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff;

    if (
      isPng ||
      contentType.includes("png") ||
      lowerUrl.includes(".png")
    ) {
      return await pdfDoc.embedPng(bytes);
    }

    if (
      isJpeg ||
      contentType.includes("jpeg") ||
      contentType.includes("jpg") ||
      lowerUrl.includes(".jpg") ||
      lowerUrl.includes(".jpeg")
    ) {
      return await pdfDoc.embedJpg(bytes);
    }

    console.warn(
      "A termékkép formátuma nem PNG/JPG, ezért nem került a PDF-be:",
      url,
      contentType
    );

    return null;
  } catch (error) {
    console.warn("Termékkép nem tölthető be:", url, error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RentalPdfRequest;
    const language: Language = body.language === "ro" ? "ro" : "hu";
    const t = texts[language];

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const regularFontPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "NotoSans-Regular.ttf"
    );

    const boldFontPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "NotoSans-Bold.ttf"
    );

    if (!fs.existsSync(regularFontPath)) {
      throw new Error(`A normál PDF betűtípus nem található: ${regularFontPath}`);
    }

    if (!fs.existsSync(boldFontPath)) {
      throw new Error(`A félkövér PDF betűtípus nem található: ${boldFontPath}`);
    }

    const font = await pdfDoc.embedFont(fs.readFileSync(regularFontPath), {
      subset: false,
    });

    const boldFont = await pdfDoc.embedFont(fs.readFileSync(boldFontPath), {
      subset: false,
    });

    // Ha később létrehozod ezt a PNG-t, automatikusan megjelenik a PDF-en.
    // Az SVG-t a pdf-lib közvetlenül nem tudja beágyazni.
    const logoPath = path.join(process.cwd(), "public", "images", "logo-mark.png");
    let logo: PDFImage | null = null;

    if (fs.existsSync(logoPath)) {
      try {
        logo = await pdfDoc.embedPng(fs.readFileSync(logoPath));
      } catch (error) {
        console.warn("A PDF logó nem tölthető be:", error);
      }
    }

    let page: PDFPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - TOP;
    let pageNumber = 1;

    const lessor: Lessor = body.lessor ?? {};
    const lessorName = lessor.name?.trim() || "MolnarRent";

    function drawFooter() {
      page.drawLine({
        start: { x: LEFT, y: 40 },
        end: { x: PAGE_WIDTH - RIGHT, y: 40 },
        thickness: 0.5,
        color: BORDER,
      });

      page.drawText(`${t.page} ${pageNumber}`, {
        x: LEFT,
        y: 24,
        size: 8,
        font,
        color: GRAY,
      });

      const width = font.widthOfTextAtSize(lessorName, 8);
      page.drawText(lessorName, {
        x: PAGE_WIDTH - RIGHT - width,
        y: 24,
        size: 8,
        font,
        color: GRAY,
      });
    }

    function newPage() {
      drawFooter();
      pageNumber += 1;
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - TOP;
    }

    function ensureSpace(requiredHeight: number) {
      if (y - requiredHeight < CONTENT_BOTTOM) newPage();
    }

    // =========================================================
    // FEJLÉC
    // =========================================================

    const headerTop = y;
    let brandX = LEFT;

    if (logo) {
      const logoSize = 48;
      const scale = Math.min(logoSize / logo.width, logoSize / logo.height);
      const width = logo.width * scale;
      const height = logo.height * scale;

      page.drawImage(logo, {
        x: LEFT,
        y: headerTop - height + 5,
        width,
        height,
      });

      brandX = LEFT + logoSize + 10;
    }

    page.drawText(lessorName, {
      x: brandX,
      y: headerTop,
      size: 23,
      font: boldFont,
      color: ORANGE,
    });

    const contactLines: string[] = [];
    if (lessor.address?.trim()) contactLines.push(lessor.address.trim());
    if (lessor.phone?.trim()) contactLines.push(`${t.phone}: ${lessor.phone.trim()}`);
    if (lessor.email?.trim()) contactLines.push(`${t.email}: ${lessor.email.trim()}`);
    if (lessor.website?.trim()) contactLines.push(lessor.website.trim());
    if (lessor.whatsapp?.trim()) contactLines.push(`${t.whatsapp}: ${lessor.whatsapp.trim()}`);

    let contactY = headerTop - 18;
    for (const line of contactLines) {
      const wrapped = wrapText(line, font, 7.8, 270);
      for (const item of wrapped) {
        page.drawText(item, {
          x: brandX,
          y: contactY,
          size: 7.8,
          font,
          color: GRAY,
        });
        contactY -= 10.5;
      }
    }

    const documentNumber = body.documentNumber || "-";
    const numberLabelWidth = font.widthOfTextAtSize(t.documentNumber, 7.5);
    const numberWidth = boldFont.widthOfTextAtSize(documentNumber, 10.5);

    page.drawText(t.documentNumber, {
      x: PAGE_WIDTH - RIGHT - numberLabelWidth,
      y: headerTop,
      size: 7.5,
      font,
      color: GRAY,
    });

    page.drawText(documentNumber, {
      x: PAGE_WIDTH - RIGHT - numberWidth,
      y: headerTop - 16,
      size: 10.5,
      font: boldFont,
      color: DARK,
    });

    y = Math.min(headerTop - 72, contactY - 8);

    page.drawLine({
      start: { x: LEFT, y },
      end: { x: PAGE_WIDTH - RIGHT, y },
      thickness: 2,
      color: ORANGE,
    });

    y -= 30;

    page.drawText(t.title.toUpperCase(), {
      x: LEFT,
      y,
      size: 17,
      font: boldFont,
      color: DARK,
    });

    y -= 34;

    // =========================================================
    // BÉRBEVEVŐ
    // =========================================================

    page.drawText(t.customerData, {
      x: LEFT,
      y,
      size: 13,
      font: boldFont,
      color: DARK,
    });

    y -= 23;

    const customerRows = [
      { label: t.customerName, value: body.customerName || "-" },
      { label: t.address, value: body.customerAddress || "-" },
      { label: t.phone, value: body.customerPhone || "-" },
      { label: t.rentalDate, value: formatDate(body.rentalDate, language) },
    ];

    const labelWidth = 130;

    for (const row of customerRows) {
      const valueLines = wrapText(
        row.value,
        font,
        9.5,
        CONTENT_WIDTH - labelWidth - 16
      );

      const rowHeight = Math.max(24, valueLines.length * 13 + 9);
      ensureSpace(rowHeight);

      page.drawRectangle({
        x: LEFT,
        y: y - rowHeight + 7,
        width: CONTENT_WIDTH,
        height: rowHeight,
        color: VERY_LIGHT,
      });

      page.drawText(row.label, {
        x: LEFT + 8,
        y,
        size: 9,
        font: boldFont,
        color: GRAY,
      });

      let valueY = y;
      for (const line of valueLines) {
        page.drawText(line || " ", {
          x: LEFT + labelWidth,
          y: valueY,
          size: 9.5,
          font,
          color: DARK,
        });
        valueY -= 13;
      }

      y -= rowHeight + 2;
    }

    y -= 22;

    // =========================================================
    // TERMÉKEK
    // =========================================================

    const products = Array.isArray(body.products) ? body.products : [];
    const groupedProducts = new Map<string, RentalProduct[]>();

    for (const product of products) {
      const categoryName = product.categoryName || "-";
      if (!groupedProducts.has(categoryName)) groupedProducts.set(categoryName, []);
      groupedProducts.get(categoryName)!.push(product);
    }

    const imageCache = new Map<string, PDFImage | null>();

    // Valódi táblázat:
    // 1. oszlop: fix képhely
    // 2. oszlop: terméknév
    // 3. oszlop: mennyiség
    const imageColumnWidth = 44;
    const quantityColumnWidth = 88;
    const productColumnWidth =
      CONTENT_WIDTH - imageColumnWidth - quantityColumnWidth;

    const tableHeaderHeight = 22;
    const minProductRowHeight = 32;
    const imageMaxSize = 26;

    for (const [categoryName, categoryProducts] of groupedProducts) {
      // Kategóriafejléc + táblázatfejléc + legalább egy terméksor.
      ensureSpace(22 + 4 + tableHeaderHeight + minProductRowHeight + 8);

      // ---------------------------------------------------------
      // Kategóriafejléc
      // ---------------------------------------------------------

      page.drawRectangle({
        x: LEFT,
        y: y - 4,
        width: CONTENT_WIDTH,
        height: 22,
        color: LIGHT,
      });

      page.drawRectangle({
        x: LEFT,
        y: y - 4,
        width: 4,
        height: 22,
        color: ORANGE,
      });

      page.drawText(categoryName, {
        x: LEFT + 12,
        y,
        size: 10,
        font: boldFont,
        color: DARK,
      });

      y -= 26;

      // ---------------------------------------------------------
      // Táblázatfejléc
      // ---------------------------------------------------------

      const tableLeft = LEFT;
      const imageColumnX = tableLeft;
      const productColumnX = tableLeft + imageColumnWidth;
      const quantityColumnX = productColumnX + productColumnWidth;
      const tableRight = PAGE_WIDTH - RIGHT;

      const headerTop = y + 5;
      const headerBottom = headerTop - tableHeaderHeight;

      page.drawRectangle({
        x: tableLeft,
        y: headerBottom,
        width: CONTENT_WIDTH,
        height: tableHeaderHeight,
        color: VERY_LIGHT,
        borderColor: BORDER,
        borderWidth: 0.7,
      });

      // Függőleges oszlopvonalak
      page.drawLine({
        start: { x: productColumnX, y: headerBottom },
        end: { x: productColumnX, y: headerTop },
        thickness: 0.7,
        color: BORDER,
      });

      page.drawLine({
        start: { x: quantityColumnX, y: headerBottom },
        end: { x: quantityColumnX, y: headerTop },
        thickness: 0.7,
        color: BORDER,
      });

      // A képoszlop fejlécét szándékosan üresen hagyjuk.
      page.drawText(t.product, {
        x: productColumnX + 9,
        y: headerBottom + 6,
        size: 8.5,
        font: boldFont,
        color: GRAY,
      });

      const quantityHeaderWidth = boldFont.widthOfTextAtSize(
        t.quantity,
        8.5
      );

      page.drawText(t.quantity, {
        x:
          quantityColumnX +
          (quantityColumnWidth - quantityHeaderWidth) / 2,
        y: headerBottom + 6,
        size: 8.5,
        font: boldFont,
        color: GRAY,
      });

      y = headerBottom;

      // ---------------------------------------------------------
      // Terméksorok
      // ---------------------------------------------------------

      for (const product of categoryProducts) {
        let productImage: PDFImage | null = null;

        if (product.imageUrl) {
          if (imageCache.has(product.imageUrl)) {
            productImage = imageCache.get(product.imageUrl) ?? null;
          } else {
            productImage = await embedRemoteImage(
              pdfDoc,
              product.imageUrl
            );

            imageCache.set(
              product.imageUrl,
              productImage
            );
          }
        }

        const productLines = wrapText(
          product.productName || "-",
          font,
          9.5,
          productColumnWidth - 18
        );

        const textBlockHeight =
          productLines.length * 13;

        const rowHeight = Math.max(
          minProductRowHeight,
          textBlockHeight + 10
        );

        // Ha nincs hely a következő sorra, új oldal + új táblázatfejléc.
        if (y - rowHeight < CONTENT_BOTTOM) {
          newPage();

          const continuedHeaderTop = y + 5;
          const continuedHeaderBottom =
            continuedHeaderTop - tableHeaderHeight;

          page.drawRectangle({
            x: tableLeft,
            y: continuedHeaderBottom,
            width: CONTENT_WIDTH,
            height: tableHeaderHeight,
            color: VERY_LIGHT,
            borderColor: BORDER,
            borderWidth: 0.7,
          });

          page.drawLine({
            start: {
              x: productColumnX,
              y: continuedHeaderBottom,
            },
            end: {
              x: productColumnX,
              y: continuedHeaderTop,
            },
            thickness: 0.7,
            color: BORDER,
          });

          page.drawLine({
            start: {
              x: quantityColumnX,
              y: continuedHeaderBottom,
            },
            end: {
              x: quantityColumnX,
              y: continuedHeaderTop,
            },
            thickness: 0.7,
            color: BORDER,
          });

          page.drawText(t.product, {
            x: productColumnX + 9,
            y: continuedHeaderBottom + 6,
            size: 8.5,
            font: boldFont,
            color: GRAY,
          });

          page.drawText(t.quantity, {
            x:
              quantityColumnX +
              (quantityColumnWidth -
                quantityHeaderWidth) /
                2,
            y: continuedHeaderBottom + 6,
            size: 8.5,
            font: boldFont,
            color: GRAY,
          });

          y = continuedHeaderBottom;
        }

        const rowTop = y;
        const rowBottom = rowTop - rowHeight;

        // Teljes sor kerete
        page.drawRectangle({
          x: tableLeft,
          y: rowBottom,
          width: CONTENT_WIDTH,
          height: rowHeight,
          borderColor: BORDER,
          borderWidth: 0.7,
        });

        // Kép | Termék elválasztó
        page.drawLine({
          start: {
            x: productColumnX,
            y: rowBottom,
          },
          end: {
            x: productColumnX,
            y: rowTop,
          },
          thickness: 0.7,
          color: BORDER,
        });

        // Termék | Mennyiség elválasztó
        page.drawLine({
          start: {
            x: quantityColumnX,
            y: rowBottom,
          },
          end: {
            x: quantityColumnX,
            y: rowTop,
          },
          thickness: 0.7,
          color: BORDER,
        });

        // -------------------------------------------------------
        // Kép - a hely mindig megmarad akkor is, ha nincs kép
        // -------------------------------------------------------

        if (productImage) {
          const scale = Math.min(
            imageMaxSize / productImage.width,
            imageMaxSize / productImage.height
          );

          const imageWidth =
            productImage.width * scale;

          const imageHeight =
            productImage.height * scale;

          page.drawImage(productImage, {
            x:
              imageColumnX +
              (imageColumnWidth - imageWidth) / 2,
            y:
              rowBottom +
              (rowHeight - imageHeight) / 2,
            width: imageWidth,
            height: imageHeight,
          });
        }

        // -------------------------------------------------------
        // Terméknév - függőlegesen középre igazítva
        // -------------------------------------------------------

        const productLineHeight = 13;
        const actualTextHeight =
          productLines.length * productLineHeight;

        let productY =
          rowBottom +
          (rowHeight + actualTextHeight) / 2 -
          productLineHeight +
          2;

        for (const line of productLines) {
          page.drawText(line, {
            x: productColumnX + 9,
            y: productY,
            size: 9.5,
            font,
            color: DARK,
          });

          productY -= productLineHeight;
        }

        // -------------------------------------------------------
        // Mennyiség - középre igazítva
        // -------------------------------------------------------

        const quantity = Math.max(
          0,
          Number(product.quantity) || 0
        );

        const quantityText =
          `${quantity} ${t.piece}`;

        const quantityTextWidth =
          boldFont.widthOfTextAtSize(
            quantityText,
            9.5
          );

        page.drawText(quantityText, {
          x:
            quantityColumnX +
            (quantityColumnWidth -
              quantityTextWidth) /
              2,
          y:
            rowBottom +
            rowHeight / 2 -
            3.5,
          size: 9.5,
          font: boldFont,
          color: DARK,
        });

        y = rowBottom;
      }

      y -= 14;
    }

    // =========================================================
    // MEGJEGYZÉS
    // =========================================================

    y -= 6;

    if (body.note?.trim()) {
      const noteLines = wrapText(body.note, font, 9.5, CONTENT_WIDTH - 16);
      const noteHeight = Math.max(38, noteLines.length * 13 + 14);
      ensureSpace(noteHeight + 22);

      page.drawText(t.note, {
        x: LEFT,
        y,
        size: 12,
        font: boldFont,
        color: DARK,
      });

      y -= 21;

      page.drawRectangle({
        x: LEFT,
        y: y - noteHeight + 8,
        width: CONTENT_WIDTH,
        height: noteHeight,
        borderColor: BORDER,
        borderWidth: 0.7,
      });

      let noteY = y - 5;
      for (const line of noteLines) {
        page.drawText(line || " ", {
          x: LEFT + 8,
          y: noteY,
          size: 9.5,
          font,
          color: DARK,
        });
        noteY -= 13;
      }

      y -= noteHeight + 10;
    }

    // =========================================================
    // ALÁÍRÁSOK – MINDIG AZ UTOLSÓ OLDAL ALJÁN
    // =========================================================

    // Ha a tartalom mégis túl közel került a fix aláírási területhez,
    // az aláírások külön utolsó oldalra kerülnek.
    if (y < CONTENT_BOTTOM) newPage();

    const signatureY = 103;
    const signatureGap = 55;
    const signatureWidth = (CONTENT_WIDTH - signatureGap) / 2;
    const rightSignatureX = LEFT + signatureWidth + signatureGap;

    page.drawLine({
      start: { x: LEFT, y: signatureY },
      end: { x: LEFT + signatureWidth, y: signatureY },
      thickness: 0.8,
      color: GRAY,
    });

    page.drawLine({
      start: { x: rightSignatureX, y: signatureY },
      end: { x: rightSignatureX + signatureWidth, y: signatureY },
      thickness: 0.8,
      color: GRAY,
    });

    const lessorWidth = font.widthOfTextAtSize(t.lessorSignature, 9);
    const lesseeWidth = font.widthOfTextAtSize(t.lesseeSignature, 9);

    page.drawText(t.lessorSignature, {
      x: LEFT + (signatureWidth - lessorWidth) / 2,
      y: signatureY - 17,
      size: 9,
      font,
      color: DARK,
    });

    page.drawText(t.lesseeSignature, {
      x: rightSignatureX + (signatureWidth - lesseeWidth) / 2,
      y: signatureY - 17,
      size: 9,
      font,
      color: DARK,
    });

    drawFooter();

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    const safeDocumentNumber = (body.documentNumber || "MolnarRent").replace(
      /[^a-zA-Z0-9-_]/g,
      "_"
    );

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeDocumentNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF generálási hiba:", error);

    const message =
      error instanceof Error ? error.message : "Ismeretlen PDF generálási hiba.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
