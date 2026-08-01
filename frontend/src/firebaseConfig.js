import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
if (typeof window !== 'undefined') {
  window.__FIREBASE_CONFIG__ = firebaseConfig;
  window.__FIREBASE_APP_COUNT__ = getApps().length;
  console.log('FIREBASE_CONFIG', firebaseConfig);
}
const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId ? getAnalytics(app) : null;
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => value === undefined || value === '')
  .map(([key]) => key);
if (missingConfigKeys.length > 0) {
  console.warn('Firebase config missing values:', missingConfigKeys.join(', '));
}

export { app, analytics, auth, provider };
