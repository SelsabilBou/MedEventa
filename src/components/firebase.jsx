import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAlbzwoPehS-kkZI_il1B3remdnC7PsVCg",
  authDomain: "medevent-afff2.firebaseapp.com",
  projectId: "medevent-afff2",
  storageBucket: "medevent-afff2.firebasestorage.app",
  messagingSenderId: "918493885434",
  appId: "1:918493885434:web:fdd4c99d1a80bead2faa43",
  measurementId: "G-GDVC87663C",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
