// Import Firebase modules (ES6)
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBK2cJVX4WsmwIoLxuykYk2NZiMj-TiyM",
  authDomain: "w-edax-b.firebaseapp.com",
  projectId: "w-edax-b",
  storageBucket: "w-edax-b.appspot.com",
  messagingSenderId: "584318493435",
  appId: "1:584318493435:web:5c46a3b3e03cc474c2465e",
  measurementId: "G-070YVYCRS2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
