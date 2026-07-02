import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase/config.js'

// AuthContext centraliza el estado de usuario y las acciones de autenticacion.
// Todas las sesiones se validan exclusivamente contra Firebase Authentication.
const AuthContext = createContext()

// AuthProvider expone usuario, estado de carga y acciones auth a toda la app.
export function AuthProvider({ children }) {
  // user representa el usuario actual, o null si no hay sesion.
  const [user, setUser] = useState(null)
  // loading indica si todavia se esta validando/restaurando la sesion.
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return undefined
    }

    // Firebase notifica cada cambio de sesion.
    // unsubscribe permite cortar la escucha cuando el provider se desmonta.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // login inicia sesion con email/password usando Firebase Authentication.
  const login = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Authentication no esta configurado.')
    }

    // credential contiene la respuesta de Firebase Authentication.
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
  }

  // register crea una cuenta nueva con email/password usando Firebase.
  const register = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Authentication no esta configurado.')
    }

    // credential contiene la respuesta de Firebase luego del registro.
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    return credential.user
  }

  // logout cierra la sesion actual en Firebase Authentication.
  const logout = async () => {
    if (!isFirebaseConfigured || !auth) {
      setUser(null)
      return
    }

    await signOut(auth)
  }

  // value es el objeto publico que consumen los componentes con useAuth.
  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isFirebaseConfigured,
      login,
      logout,
      register,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// useAuth es el hook de acceso seguro al contexto de autenticacion.
export function useAuth() {
  // context contiene el valor publicado por AuthProvider.
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}
