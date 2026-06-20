import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase/config.js'

const AuthContext = createContext()
const demoUserKey = 'universo-geek-demo-user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      const savedUser = localStorage.getItem(demoUserKey)
      setUser(savedUser ? JSON.parse(savedUser) : null)
      setLoading(false)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      const demoUser = { email, uid: 'demo-user' }
      localStorage.setItem(demoUserKey, JSON.stringify(demoUser))
      setUser(demoUser)
      return demoUser
    }

    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
  }

  const register = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      const demoUser = { email, uid: 'demo-user' }
      localStorage.setItem(demoUserKey, JSON.stringify(demoUser))
      setUser(demoUser)
      return demoUser
    }

    const credential = await createUserWithEmailAndPassword(auth, email, password)
    return credential.user
  }

  const logout = async () => {
    if (!isFirebaseConfigured || !auth) {
      localStorage.removeItem(demoUserKey)
      setUser(null)
      return
    }

    await signOut(auth)
  }

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

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}
