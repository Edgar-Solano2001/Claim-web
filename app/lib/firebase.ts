import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBDQiF5MYUaYsJ_cLfbyZZHvni-8euAsxg",
  authDomain: "claim-42d5d.firebaseapp.com",
  projectId: "claim-42d5d",
  appId: "1:495875265525:web:4b115d8c6506c00e5e46bc",
};


export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

