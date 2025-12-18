import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJY_m1BZ237BtFPTyp63i8JA4zRxwuAGI",
  authDomain: "imgp-20315.firebaseapp.com",
  projectId: "imgp-20315",
  storageBucket: "imgp-20315.firebasestorage.app",
  messagingSenderId: "181038428072",
  appId: "1:181038428072:web:61c326acd511793e57f79d",
  measurementId: "G-W7QXBY7Z45"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Get Firebase Auth instance
const auth = getAuth(app);

export { app, auth };
export default app;

