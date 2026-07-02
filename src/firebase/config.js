import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Configuracion centralizada de Firebase.
// Vite expone variables de entorno con el prefijo VITE_.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// requiredKeys enumera las credenciales minimas necesarias para iniciar Firebase.
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId']

// Indica si estan cargadas las credenciales minimas de Firebase.
export const isFirebaseConfigured = requiredKeys.every((key) => {
  // value representa el valor de cada credencial revisada.
  const value = firebaseConfig[key]
  return typeof value === 'string' && value.trim() !== ''
})

// app guarda la instancia de Firebase cuando hay configuracion valida.
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null

// Auth, Firestore y Storage se exportan como null si falta configuracion.
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const storage = app ? getStorage(app) : null
