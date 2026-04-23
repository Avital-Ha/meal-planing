import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ai-outfit-app-453e0.firebaseapp.com",
  projectId: "ai-outfit-app-453e0",
  storageBucket: "ai-outfit-app-453e0.firebasestorage.app",
  messagingSenderId: "853100638639",
  appId: "1:853100638639:web:8b28e8640b95cb00793f5a",
  measurementId: "G-NFF464DHC1"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);