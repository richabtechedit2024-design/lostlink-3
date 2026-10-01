import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
// @ts-ignore - no official types for this subpath
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// 1. Go to https://console.firebase.google.com
// 2. Create a project called "LostLink"
// 3. Project settings -> General -> Add app -> Web app
// 4. Copy the config values below and paste your own here
const firebaseConfig = {
  apiKey: "AIzaSyADXDss9FmX5zescX1eTkPUsDMCmwV-cY4",
  authDomain: "lost-link-6078e.firebaseapp.com",
  projectId: "lost-link-6078e",
  storageBucket: "lost-link-6078e.firebasestorage.app",
  messagingSenderId: "941762016254",
  appId: "1:941762016254:web:da971bfb0463b6e7a0c6af",
  measurementId: "G-HB1DKHESXZ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth with persistence so users stay logged in between app restarts
export const auth =
  getApps().length === 0
    ? initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      })
    : getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
