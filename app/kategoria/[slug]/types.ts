export type MediaType = "image" | "video" | "document";
export type MediaItem = { type: MediaType; url: string; name: string };
export type Localized = { hu: string; ro: string };
export type Category = {
  id: string;
  title: Localized;
  intro: Localized;
  media: MediaItem[];
};
export type Product = {
  id: string;
  title: Localized;
  description: Localized;
  rentable: boolean;
  properties: { label: Localized; value: Localized }[];
  media: MediaItem[];
};
