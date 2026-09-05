import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

/**
 * Firebase Client Configuration
 * 
 * Configured dynamically from environment variables with fallback to firebase-applet-config.json.
 */
const envApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const envProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: envApiKey || "AIzaSyPreviewMockKeyForInitialization0000",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "echotale.firebaseapp.com",
  projectId: envProjectId || "echotale-preview",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "echotale-preview.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:preview0000",
};

// Initialize Firebase client instance safely (singleton across hot reloads and build passes)
const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);

// Use custom db ID if defined, or appletConfig.firestoreDatabaseId ONLY if using default project
const customDbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;
const isCustomProject = !!envProjectId ;
const databaseId = customDbId || (isCustomProject ? undefined : "") || undefined;

let db: Firestore;
try {
  db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
} catch (err) {
  console.warn("Failed to initialize custom database ID, falling back to default Firestore database:", err);
  db = getFirestore(app);
}

let storage: FirebaseStorage | null = null;
try {
  storage = getStorage(app);
} catch (storageErr) {
  console.warn("Firebase Storage initialization note:", storageErr);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export { app, auth, db, storage, googleProvider };



