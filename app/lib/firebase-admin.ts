import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import { getAuth } from "firebase-admin/auth";

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID;

const clientEmail =
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

const privateKey =
  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Hiányzó Firebase Admin környezeti változó."
  );
}

const firebaseAdminApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    : getApps()[0];

export const adminAuth = getAuth(firebaseAdminApp);