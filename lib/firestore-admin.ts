import { initializeApp, getApps, cert, applicationDefault, type App } from "firebase-admin/app";
import { getFirestore, type Firestore, FieldValue } from "firebase-admin/firestore";

/**
 * Firebase Admin SDK & Firestore Singleton
 * Safely initializes server-side Firestore using Service Account credentials or Application Default Credentials (ADC).
 */

function getAdminApp(): App {
  const currentApps = getApps();
  if (currentApps.length > 0 && currentApps[0]) {
    return currentApps[0];
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "echotale-3bf32";

  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson);
      return initializeApp({
        credential: cert(parsed),
        projectId: parsed.project_id || projectId,
      });
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:", err);
    }
  }

  if (privateKey && clientEmail) {
    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
      projectId,
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId,
  });
}

let adminDbInstance: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (!adminDbInstance) {
    const app = getAdminApp();
    adminDbInstance = getFirestore(app);
  }
  return adminDbInstance;
}

export { FieldValue };
