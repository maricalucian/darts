import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC15N4vf_LoMo5fKxvoxa03hkWrmCG28Rs",
  authDomain: "darts-29a45.firebaseapp.com",
  projectId: "darts-29a45",
  storageBucket: "darts-29a45.appspot.com",
  messagingSenderId: "707243652818",
  appId: "1:707243652818:web:458804fa670b22388c9f0b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);