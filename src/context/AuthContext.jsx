import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase/config.js'
import { createClientProfile, getUserProfile, userRoles } from '../services/userService.js'

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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // currentUser es null cuando no hay sesion activa o se acaba de cerrar.
      if (!currentUser) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        // profile agrega el rol de Firestore al usuario autenticado de Firebase.
        const profile = await getUserProfile(currentUser)
        setUser(profile)
      } catch {
        // Si falla el perfil, se evita dejar una sesion a medias con permisos ambiguos.
        setUser(null)
      }

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
    // profile decide si la cuenta entra como admin o cliente.
    const profile = await getUserProfile(credential.user)
    setUser(profile)
    return profile
  }

  // register crea una cuenta cliente con email/password usando Firebase.
  const register = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Authentication no esta configurado.')
    }

    // credential contiene la respuesta de Firebase luego del registro.
    const credential = await createUserWithEmailAndPassword(auth, email, password)

    try {
      // Todo registro publico se identifica como cliente; no hay alta de admins desde UI.
      const profile = await createClientProfile(credential.user)
      setUser(profile)
      return profile
    } catch (error) {
      // Si no se pudo crear el perfil, borramos el usuario Auth para no dejar cuentas sin rol.
      await deleteUser(credential.user)
      throw error
    }
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
      // isAuthenticated resume si existe un perfil cargado y usable.
      isAuthenticated: Boolean(user),
      // role expone el rol crudo para rutas que necesitan comparar permisos.
      role: user?.role || null,
      // isAdmin habilita panel y acciones de gestion.
      isAdmin: user?.role === userRoles.admin,
      // isClient identifica compradores creados desde el registro publico.
      isClient: user?.role === userRoles.client,
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
