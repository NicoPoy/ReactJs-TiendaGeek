import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase/config.js'
import {
  assertFirestoreReady,
  normalizeProduct,
  productsCollectionName,
  withFirebaseTimeout,
} from './firebaseServiceHelpers.js'
import { getProductCategories } from './categoryService.js'

export {
  createProductCategory,
  defaultProductCategories,
  deleteProductCategory,
  getProductCategories,
} from './categoryService.js'
export {
  acceptedProductImageTypes,
  maxProductImageSize,
  uploadProductImage,
} from './imageService.js'

// Este archivo queda como fachada publica: las pantallas siguen importando desde aca.

// getProducts devuelve todos los productos disponibles desde Firestore.
export async function getProducts() {
  assertFirestoreReady()

  // productsQuery ordena por nombre para que catalogo y admin reciban una lista estable.
  const productsQuery = query(collection(db, productsCollectionName), orderBy('name'))
  // snapshot contiene los documentos actuales de la coleccion products.
  const snapshot = await getDocs(productsQuery)

  // Cada documento se normaliza para que precio, stock, id y fechas tengan tipos consistentes.
  return snapshot.docs.map((productDoc) =>
    normalizeProduct({ id: productDoc.id, ...productDoc.data() }),
  )
}

// getProductById busca un producto individual por id en Firestore.
export async function getProductById(productId) {
  assertFirestoreReady()

  // productRef apunta al documento solicitado por la ruta /producto/:id.
  const productRef = doc(db, productsCollectionName, String(productId))
  // productSnapshot permite saber si existe y leer sus datos.
  const productSnapshot = await getDoc(productRef)

  if (!productSnapshot.exists()) {
    return null
  }

  return normalizeProduct({ id: productSnapshot.id, ...productSnapshot.data() })
}

// createProduct crea un producto nuevo en Firestore.
export async function createProduct(productData) {
  assertFirestoreReady()

  // now da timestamps provisorios hasta que Firestore escriba serverTimestamp.
  const now = Date.now()
  // product normaliza lo recibido desde el formulario antes de guardarlo.
  const product = normalizeProduct({
    ...productData,
    id: 'pending-firestore-id',
    createdAt: now,
    updatedAt: now,
  })
  // id y tiempos calculados no se guardan como campos editables del documento.
  const { id, createdAtTime, updatedAtTime, ...firestoreProduct } = product
  // createdProduct contiene el id automatico generado por Firestore.
  const createdProduct = await withFirebaseTimeout(
    addDoc(collection(db, productsCollectionName), {
      ...firestoreProduct,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    'El guardado del producto',
  )

  return { ...product, id: createdProduct.id }
}

// updateProduct actualiza un producto existente por id en Firestore.
export async function updateProduct(productId, productData) {
  assertFirestoreReady()

  // product conserva el id actual y normaliza numeros antes de actualizar.
  const product = normalizeProduct({ ...productData, id: productId, updatedAt: Date.now() })
  // firestoreProduct contiene solo datos persistibles, sin campos derivados de UI.
  const { id, createdAtTime, updatedAtTime, ...firestoreProduct } = product
  await withFirebaseTimeout(
    updateDoc(doc(db, productsCollectionName, String(productId)), {
      ...firestoreProduct,
      updatedAt: serverTimestamp(),
    }),
    'La actualizacion del producto',
  )

  return product
}

// deleteProduct elimina un producto por id en Firestore.
export async function deleteProduct(productId) {
  assertFirestoreReady()

  // productId se castea a string porque los ids de Firestore siempre son texto.
  await withFirebaseTimeout(
    deleteDoc(doc(db, productsCollectionName, String(productId))),
    'La eliminacion del producto',
  )
}

// seedProductsFromJson carga productos iniciales desde public/productos.json a Firestore.
export async function seedProductsFromJson() {
  assertFirestoreReady()
  // Asegura que las categorias base existan antes de cargar productos iniciales.
  await getProductCategories()

  // response lee el JSON local incluido en public para sembrar la base.
  const response = await fetch('/productos.json')

  if (!response.ok) {
    throw new Error('No se pudo leer el catalogo inicial.')
  }

  // products es el catalogo base que se transforma en documentos Firestore.
  const products = await response.json()
  // createdProducts guarda las referencias creadas para devolver ids reales al panel.
  const createdProducts = await Promise.all(
    products.map((product, index) => {
      // createdAt escalonado conserva un orden estable entre productos sembrados juntos.
      const createdAt = Date.now() + index
      // productData descarta campos derivados y deja solo data persistible.
      const { id, createdAtTime, updatedAtTime, ...productData } = normalizeProduct({
        ...product,
        createdAt,
        updatedAt: createdAt,
      })
      return withFirebaseTimeout(
        addDoc(collection(db, productsCollectionName), {
          ...productData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
        'La carga del catalogo inicial',
      )
    }),
  )

  // Devuelve los productos normalizados con ids reales para refrescar la UI sin otra consulta.
  return products.map((product, index) => {
    const createdAt = Date.now() + index
    return normalizeProduct({
      ...product,
      id: createdProducts[index].id,
      createdAt,
      updatedAt: createdAt,
    })
  })
}
