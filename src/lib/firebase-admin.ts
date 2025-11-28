import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  // Check if Firebase Admin is already initialized
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Check for required environment variables
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
  ];

  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase Admin environment variables: ${missingVars.join(', ')}\n` +
      `Please add these to your Vercel project settings under Environment Variables:\n` +
      missingVars.map(v => `${v}=your_value_here`).join('\n')
    );
  }

  const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  };

  return initializeApp({
    credential: cert(firebaseConfig),
    projectId: process.env.FIREBASE_PROJECT_ID!,
  });
}

// Lazy getter for Firebase Admin app
let _adminApp: ReturnType<typeof initializeApp> | null = null;
let _adminDb: ReturnType<typeof getFirestore> | null = null;

export function getAdminApp() {
  if (!_adminApp) {
    _adminApp = initializeFirebaseAdmin();
  }
  return _adminApp;
}

export function getAdminDb() {
  if (!_adminDb) {
    _adminDb = getFirestore(getAdminApp());
  }
  return _adminDb;
}

export default getAdminApp;



