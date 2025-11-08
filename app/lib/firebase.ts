// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDQiF5MYUaYsJ_cLfbyZZHvni-8euAsxg",
  authDomain: "claim-42d5d.firebaseapp.com",
  projectId: "claim-42d5d",
  appId: "1:495875265525:web:4b115d8c6506c00e5e46bc",
};

// Initialize Firebase
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);