import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config.js'

// Coleccion donde guardamos metadatos propios que Firebase Auth no trae, como el rol.
const usersCollectionName = 'users'
// Roles validos de la app: admin gestiona catalogo, client compra.
export const userRoles = {
  admin: 'admin',
  client: 'client',
}

// Evita consultar perfiles si Firestore no fue configurado en el entorno.
function assertFirestoreReady() {
  if (!isFirebaseConfigured || !db) {
    throw new Error('El servicio de usuarios no esta disponible.')
  }
}

// Arma el objeto minimo que la UI necesita para mostrar sesion y permisos.
function buildUserProfile(authUser, role) {
  return {
    uid: authUser.uid,
    email: authUser.email,
    role,
  }
}

// Crea el perfil de cliente para todo registro publico hecho desde /login.
export async function createClientProfile(authUser) {
  assertFirestoreReady()

  // profile queda separado de timestamps para poder devolverlo inmediatamente a la UI.
  const profile = buildUserProfile(authUser, userRoles.client)

  // El documento usa uid como id para cruzar Authentication y Firestore sin consultas extra.
  await setDoc(doc(db, usersCollectionName, authUser.uid), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return profile
}

// Obtiene el perfil de rol del usuario autenticado.
export async function getUserProfile(authUser) {
  assertFirestoreReady()

  // profileSnapshot apunta al documento users/{uid} asociado a Firebase Auth.
  const profileSnapshot = await getDoc(doc(db, usersCollectionName, authUser.uid))

  if (!profileSnapshot.exists()) {
    // Compatibilidad: usuarios viejos sin perfil siguen siendo admin para no bloquear el panel.
    return buildUserProfile(authUser, userRoles.admin)
  }

  // profileData puede venir incompleto; por seguridad cualquier rol no-admin se trata como client.
  const profileData = profileSnapshot.data()
  const role =
    profileData.role === userRoles.admin ? userRoles.admin : userRoles.client

  // Se devuelve solo el formato publico que consume AuthContext.
  return {
    uid: authUser.uid,
    email: authUser.email,
    role,
  }
}
