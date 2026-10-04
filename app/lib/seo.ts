export const seoKeywords = {
  hu: {
    primary: [
      "állványbérlés",
      "állvány bérlés",
      "építési állvány bérlés",
      "homlokzati állvány bérlés",
      "állvány kölcsönzés",
    ],

    local: [
      "állványbérlés Nyárádszereda",
      "állvány bérlés Nyárádszereda",
      "építési állvány Nyárádszereda",
      "állványbérlés Maros megye",
      "állvány bérlés Maros megye",
      "építési állvány Maros megye",
      "homlokzati állvány Maros megye",
    ],

    important: [
      "építési állvány",
      "homlokzati állvány",
      "állványrendszer",
      "állványrendszer bérlés",
      "Layher állvány",
      "Layher állvány bérlés",
      "használt állvány",
      "használt építési állvány",
      "állvány eladó",
      "állvány tartozékok",
    ],

    additional: [
      "használt termékek",
      "használt építőipari eszközök",
      "építőipari eszközök",
      "építkezési eszközök",
      "állvány elemek",
      "állvány alkatrészek",
    ],
  },

  ro: {
    primary: [
      "închiriere schele",
      "schele de închiriat",
      "închiriere schele construcții",
      "închiriere schele fațadă",
    ],

    local: [
      "închiriere schele Miercurea Nirajului",
      "schele de închiriat Miercurea Nirajului",
      "schele construcții Miercurea Nirajului",
      "închiriere schele Mureș",
      "schele de închiriat Mureș",
      "închiriere schele județul Mureș",
      "schele construcții județul Mureș",
      "schele fațadă Mureș",
    ],

    important: [
      "schele pentru construcții",
      "schele de fațadă",
      "sisteme de schele",
      "închiriere sisteme de schele",
      "schele Layher",
      "închiriere schele Layher",
      "schele second hand",
      "schele de vânzare",
      "accesorii schele",
    ],

    additional: [
      "produse second hand",
      "echipamente pentru construcții",
      "echipamente second hand",
      "elemente schelă",
      "piese pentru schele",
    ],
  },
};

export const allSeoKeywords = [
  ...seoKeywords.hu.primary,
  ...seoKeywords.hu.local,
  ...seoKeywords.hu.important,
  ...seoKeywords.hu.additional,

  ...seoKeywords.ro.primary,
  ...seoKeywords.ro.local,
  ...seoKeywords.ro.important,
  ...seoKeywords.ro.additional,
];