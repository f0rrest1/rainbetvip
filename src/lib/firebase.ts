import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFirebaseConfigSafe, isFirebaseConfigured } from './firebase-config';

// Lazy initialization function
function initializeFirebase() {
  const firebaseConfig = getFirebaseConfigSafe();

  if (!firebaseConfig || !isFirebaseConfigured()) {
    throw new Error('Firebase configuration is not available. Please check your environment variables.');
  }

  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  } else {
    return getApp();
  }
}

// Lazy getters for Firebase services
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getAppInstance() {
  if (!_app) {
    try {
      _app = initializeFirebase();
    } catch (error) {
      console.warn('Firebase app initialization failed:', error);
      throw error;
    }
  }
  return _app;
}

export function getAuthInstance() {
  if (!_auth) {
    try {
      _auth = getAuth(getAppInstance());
    } catch (error) {
      console.warn('Firebase auth initialization failed:', error);
      throw error;
    }
  }
  return _auth;
}

export function getDbInstance() {
  if (!_db) {
    try {
      _db = getFirestore(getAppInstance());
    } catch (error) {
      console.warn('Firebase firestore initialization failed:', error);
      throw error;
    }
  }
  return _db;
}

// Export the lazy instances
export const auth = getAuthInstance;
export const db = getDbInstance;
export default getAppInstance;
