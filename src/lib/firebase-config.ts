// Firebase configuration using environment variables only
let _firebaseConfig: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
} | null = null;

const getFirebaseConfig = () => {
  if (_firebaseConfig) {
    return _firebaseConfig;
  }

  // Add some debugging to understand what's happening
  console.log('🔧 Attempting to load Firebase config...');

  const envVars = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  console.log('🔧 Environment variables status:', {
    hasApiKey: !!envVars.apiKey,
    hasAuthDomain: !!envVars.authDomain,
    hasProjectId: !!envVars.projectId,
    hasStorageBucket: !!envVars.storageBucket,
    hasMessagingSenderId: !!envVars.messagingSenderId,
    hasAppId: !!envVars.appId
  });

  // Check for missing environment variables
  const missingVars = Object.entries(envVars)
    .filter(([, value]) => !value)
    .map(([key]) => `NEXT_PUBLIC_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);

  if (missingVars.length > 0) {
    console.warn(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
    return null;
  }

  _firebaseConfig = {
    apiKey: envVars.apiKey!,
    authDomain: envVars.authDomain!,
    projectId: envVars.projectId!,
    storageBucket: envVars.storageBucket!,
    messagingSenderId: envVars.messagingSenderId!,
    appId: envVars.appId!
  };

  console.log('✅ Firebase config loaded successfully');
  return _firebaseConfig;
};

export const getFirebaseConfigSafe = () => {
  return getFirebaseConfig();
};

export const isFirebaseConfigured = () => {
  try {
    const config = getFirebaseConfig();
    return !!(config && config.apiKey && config.projectId);
  } catch {
    return false;
  }
};