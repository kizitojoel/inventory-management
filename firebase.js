// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDyYmqg7d4ihkjp-oMaWEIg9WXLY6pd4Bg",
  authDomain: "inventory-management-ab9cb.firebaseapp.com",
  projectId: "inventory-management-ab9cb",
  storageBucket: "inventory-management-ab9cb.appspot.com",
  messagingSenderId: "905584853316",
  appId: "1:905584853316:web:1f8502f7c50452b75d9711",
  measurementId: "G-Z4P19KT08S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };
