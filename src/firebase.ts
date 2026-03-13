import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC6186h4t6q5mEvp07P0cGGsmfJZ4fuLAg",
  authDomain: "craftai-connect.firebaseapp.com",
  projectId: "craftai-connect",
  storageBucket: "craftai-connect.firebasestorage.app",
  messagingSenderId: "961108955276",
  appId: "1:961108955276:web:ee0ad8dc343692b98eaba9",
  measurementId: "G-T8QR3X5S91"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account",
});