import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase/config.js'

// AuthContext centraliza el estado de usuario y las acciones de autenticacion.
// Si Firebase no esta configurado usa localStorage como modo demo.
const AuthContext = createContext()
// demoUserKey es la clave usada para persistir el usuario demo en localStorage.
const demoUserKey = 'universo-geek-demo-user'

// AuthProvider expone usuario, estado de carga y acciones auth a toda la app.
export function AuthProvider({ children }) {
  // user representa el usuario actual, o null si no hay sesion.
  const [user, setUser] = useState(null)
  // loading indica si todavia se esta validando/restaurando la sesion.
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Modo demo: restaura un usuario guardado localmente y evita llamar Firebase.
    if (!isFirebaseConfigured || !auth) {
      // savedUser contiene la sesion demo persistida localmente, si existe.
      const savedUser = localStorage.getItem(demoUserKey)
      setUser(savedUser ? JSON.parse(savedUser) : null)
      setLoading(false)
      return undefined
    }

    // Modo real: Firebase notifica cada cambio de sesion.
    // unsubscribe permite cortar la escucha cuando el provider se desmonta.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // login inicia sesion con email/password usando Firebase o modo demo.
  const login = async (email, password) => {
    // En modo demo cualquier email/password valido crea una sesion local.
    if (!isFirebaseConfigured || !auth) {
      // demoUser representa el usuario local simulado para probar la interfaz.
      const demoUser = { email, uid: 'demo-user' }
      localStorage.setItem(demoUserKey, JSON.stringify(demoUser))
      setUser(demoUser)
      return demoUser
    }

    // credential contiene la respuesta de Firebase Authentication.
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
  }

  // register crea una cuenta nueva con email/password usando Firebase o modo demo.
  const register = async (email, password) => {
    // En modo demo registro y login se comportan igual para poder probar la UI.
    if (!isFirebaseConfigured || !auth) {
      // demoUser representa el usuario local simulado para probar la interfaz.
      const demoUser = { email, uid: 'demo-user' }
      localStorage.setItem(demoUserKey, JSON.stringify(demoUser))
      setUser(demoUser)
      return demoUser
    }

    // credential contiene la respuesta de Firebase luego del registro.
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    return credential.user
  }

  // logout cierra la sesion actual y limpia el modo demo cuando corresponde.
  const logout = async () => {
    if (!isFirebaseConfigured || !auth) {
      localStorage.removeItem(demoUserKey)
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
