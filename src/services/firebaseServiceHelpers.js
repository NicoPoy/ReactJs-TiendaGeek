import { db, isFirebaseConfigured } from '../firebase/config.js'

// Tiempo maximo que dejamos esperar una operacion de Firebase antes de avisar al usuario.
const firebaseRequestTimeoutMs = 30000

// Nombres reales de colecciones. Centralizarlos evita escribir strings distintos en cada servicio.
export const productsCollectionName = 'products'
export const categoriesCollectionName = 'categories'

// Envuelve una promesa de Firebase con timeout para no dejar formularios cargando sin fin.
export function withFirebaseTimeout(promise, actionName) {
  // timeoutId permite limpiar el timer cuando Firebase responde antes del limite.
  let timeoutId
  // timeout rechaza con un mensaje contextual segun la accion que estaba haciendo el usuario.
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(`${actionName} tardo demasiado. Revisa tu conexion e intenta nuevamente.`))
    }, firebaseRequestTimeoutMs)
  })

  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId))
}

// Verifica que Firestore exista antes de leer o escribir datos del catalogo.
export function assertFirestoreReady() {
  if (!isFirebaseConfigured || !db) {
    throw new Error('El servicio de catalogo no esta disponible.')
  }
}

// Convierte fechas de Firestore, Date o numeros a milisegundos para ordenar productos.
export function getTimestampMillis(value) {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  return 0
}

// Normaliza productos para que la UI trabaje siempre con tipos consistentes.
export const normalizeProduct = (product) => {
  // createdAtTime y updatedAtTime se usan para ordenar y comparar fechas sin depender del tipo original.
  const createdAtTime = getTimestampMillis(product.createdAt)
  const updatedAtTime = getTimestampMillis(product.updatedAt)

  return {
    ...product,
    id: String(product.id),
    price: Number(product.price),
    stock: Number(product.stock),
    createdAtTime,
    updatedAtTime,
  }
}

// Normaliza categorias para que id y nombre siempre sean strings renderizables.
export const normalizeCategory = (category) => ({
  ...category,
  id: String(category.id),
  name: String(category.name),
})
