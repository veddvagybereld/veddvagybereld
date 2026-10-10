import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Gemeinsame Firebase-Admin-Initialisierung.
const appName = "molnarrent-sitemap";

const existingApp = getApps().find(
  (app) => app.name === appName
);

const app =
  existingApp ??
  initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
      }),
    },
    appName
  );

// Firebase Authentication für serverseitige API-Routen.
export const adminAuth = getAuth(app);

// Firestore für serverseitige Kategorie- und SEO-Abfragen.
export function getAdminFirestore() {
  return getFirestore(app);
}