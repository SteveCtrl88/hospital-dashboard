import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase, Database } from 'firebase/database'
import { getAuth, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            ?? 'AIzaSyDzc3Pi7ebjleu8HcKofbm18xLXEauz0pk',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? 'hospital-db-b826d.firebaseapp.com',
  databaseURL:       process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL       ?? 'https://hospital-db-b826d-default-rtdb.europe-west1.firebasedatabase.app',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         ?? 'hospital-db-b826d',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? 'hospital-db-b826d.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '883396566712',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             ?? '1:883396566712:web:f30904bf15753b1217de4d',
}

function getFirebaseApp() {
  if (getApps().length === 0) return initializeApp(firebaseConfig)
  return getApp()
}

function getDb(): Database {
  return getDatabase(getFirebaseApp())
}

function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp())
}

export { getDb, getFirebaseAuth }
