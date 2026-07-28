// Import the functions you need from the SDKs you need
const cleanEnv = (value) => String(value || "").trim().replace(/^['"]/, "").replace(/['"],?$/, "");
const VITE_FIREBASE_APP_API_KEY = cleanEnv(import.meta.env.VITE_FIREBASE_APP_API_KEY);
const VITE_FIREBASE_APP_API_DOMAIN = import.meta.env
  .VITE_FIREBASE_APP_API_DOMAIN;
const VITE_FIREBASE_APP_API_PROJECT_ID = import.meta.env
  .VITE_FIREBASE_APP_API_PROJECT_ID;
const VITE_FIREBASE_APP_STORAGE_BUCKET = import.meta.env
  .VITE_FIREBASE_APP_STORAGE_BUCKET;
const VITE_FIREBASE_APP_MESSAGING_SENDER_ID = import.meta.env
  .VITE_FIREBASE_APP_MESSAGING_SENDER_ID;
const VITE_FIREBASE_APP_APP_ID = import.meta.env.VITE_FIREBASE_APP_APP_ID;

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: VITE_FIREBASE_APP_API_KEY,
  authDomain: cleanEnv(VITE_FIREBASE_APP_API_DOMAIN),
  projectId: cleanEnv(VITE_FIREBASE_APP_API_PROJECT_ID),
  storageBucket: cleanEnv(VITE_FIREBASE_APP_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(VITE_FIREBASE_APP_MESSAGING_SENDER_ID),
  appId: cleanEnv(VITE_FIREBASE_APP_APP_ID),
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
