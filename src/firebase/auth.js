import { getAuth } from "firebase/auth";
import { app } from "./firebaseConfig.js";

export const auth = getAuth(app);