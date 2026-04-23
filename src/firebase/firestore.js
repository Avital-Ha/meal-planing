import { getFirestore } from "firebase/firestore";
import { app } from "./firebaseConfig.js";

export const db = getFirestore(app);