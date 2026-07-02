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
import { db, isFirebaseConfigured } from '../firebase/config.js'

// Servicio unico de productos.
// Todas las operaciones de catalogo leen y escriben exclusivamente en Firestore.
const productsCollectionName = 'products'
const categoriesCollectionName = 'categories'
export const defaultProductCategories = ['Perifericos', 'Setup', 'Rol', 'Coleccion']
export const maxProductImageSize = 5 * 1024 * 1024
export const acceptedProductImageTypes = ['image/jpeg', 'image/png', 'image/webp']
const firebaseRequestTimeoutMs = 30000
const maxStoredProductImageSize = 700 * 1024
const maxProductImageDimension = 900

function withFirebaseTimeout(promise, actionName) {
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(`${actionName} tardo demasiado. Revisa tu conexion y Firebase.`))
    }, firebaseRequestTimeoutMs)
  })

  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId))
}

function getTimestampMillis(value) {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  return 0
}

// Normaliza datos que vienen de Firestore o del JSON usado para sembrar la base.
const normalizeProduct = (product) => {
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

const normalizeCategory = (category) => ({
  ...category,
  id: String(category.id),
  name: String(category.name),
})

function getCategoryKey(categoryName) {
  return String(categoryName).trim().toLowerCase()
}

async function removeDuplicateCategories(categories) {
  const seenCategories = new Set()
  const uniqueCategories = []
  const duplicatedCategories = []

  categories.forEach((category) => {
    const categoryKey = getCategoryKey(category.name)

    if (seenCategories.has(categoryKey)) {
      duplicatedCategories.push(category)
      return
    }

    seenCategories.add(categoryKey)
    uniqueCategories.push(category)
  })

  if (duplicatedCategories.length > 0) {
    await Promise.all(
      duplicatedCategories.map((category) =>
        withFirebaseTimeout(
          deleteDoc(doc(db, categoriesCollectionName, category.id)),
          'La limpieza de categorias repetidas',
        ),
      ),
    )
  }

  return uniqueCategories
}

function assertFirestoreReady() {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firestore no esta configurado.')
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('No se pudo procesar la imagen seleccionada.'))
    image.src = dataUrl
  })
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality)
  })
}

async function blobToDataUrl(blob) {
  return readFileAsDataUrl(blob)
}

async function compressImageFile(file) {
  const sourceDataUrl = await readFileAsDataUrl(file)
  const sourceImage = await loadImage(sourceDataUrl)
  const scale = Math.min(maxProductImageDimension / sourceImage.width, maxProductImageDimension / sourceImage.height, 1)
  const width = Math.max(Math.round(sourceImage.width * scale), 1)
  const height = Math.max(Math.round(sourceImage.height * scale), 1)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = width
  canvas.height = height
  context.drawImage(sourceImage, 0, 0, width, height)

  for (const quality of [0.86, 0.78, 0.68, 0.58, 0.48]) {
    const blob = await canvasToBlob(canvas, 'image/webp', quality)

    if (blob && blob.size <= maxStoredProductImageSize) {
      return blobToDataUrl(blob)
    }
  }

  throw new Error('La imagen es demasiado pesada para guardarla gratis en Firestore. Proba con una imagen mas chica o mas liviana.')
}

async function createCategoryDocument(name) {
  const createdCategory = await withFirebaseTimeout(
    addDoc(collection(db, categoriesCollectionName), {
      name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    'La creacion de la categoria',
  )

  return { id: createdCategory.id, name }
}

// uploadProductImage prepara una imagen para guardarla gratis dentro del producto en Firestore.
export async function uploadProductImage(file) {
  if (!acceptedProductImageTypes.includes(file.type)) {
    throw new Error('La imagen debe ser JPG, PNG o WEBP.')
  }

  if (file.size > maxProductImageSize) {
    throw new Error('La imagen no puede superar 5 MB.')
  }

  return compressImageFile(file)
}

// getProductCategories devuelve categorias administrables desde Firestore.
export async function getProductCategories() {
  assertFirestoreReady()

  const categoriesQuery = query(collection(db, categoriesCollectionName), orderBy('name'))
  const snapshot = await getDocs(categoriesQuery)

  if (snapshot.empty) {
    const createdCategories = await Promise.all(
      defaultProductCategories.map((categoryName) => createCategoryDocument(categoryName)),
    )
    return createdCategories.sort((a, b) => a.name.localeCompare(b.name))
  }

  const loadedCategories = snapshot.docs.map((categoryDoc) =>
    normalizeCategory({ id: categoryDoc.id, ...categoryDoc.data() }),
  )

  const uniqueCategories = await removeDuplicateCategories(loadedCategories)
  return uniqueCategories.sort((a, b) => a.name.localeCompare(b.name))
}

// createProductCategory agrega una categoria nueva al selector del panel.
export async function createProductCategory(name) {
  assertFirestoreReady()

  return createCategoryDocument(name)
}

// deleteProductCategory elimina una categoria por id. El panel valida antes que no tenga productos.
export async function deleteProductCategory(categoryId) {
  assertFirestoreReady()

  await withFirebaseTimeout(
    deleteDoc(doc(db, categoriesCollectionName, String(categoryId))),
    'La eliminacion de la categoria',
  )
}

// getProducts devuelve todos los productos disponibles desde Firestore.
export async function getProducts() {
  assertFirestoreReady()

  // productsQuery define la consulta ordenada por nombre en Firestore.
  const productsQuery = query(collection(db, productsCollectionName), orderBy('name'))
  // snapshot contiene los documentos devueltos por Firestore.
  const snapshot = await getDocs(productsQuery)

  return snapshot.docs.map((productDoc) =>
    normalizeProduct({ id: productDoc.id, ...productDoc.data() }),
  )
}

// getProductById busca un producto individual por id en Firestore.
export async function getProductById(productId) {
  assertFirestoreReady()

  // productRef apunta al documento Firestore del producto solicitado.
  const productRef = doc(db, productsCollectionName, String(productId))
  // productSnapshot contiene el documento leido desde Firestore.
  const productSnapshot = await getDoc(productRef)

  if (!productSnapshot.exists()) {
    return null
  }

  return normalizeProduct({ id: productSnapshot.id, ...productSnapshot.data() })
}

// createProduct crea un producto nuevo en Firestore.
export async function createProduct(productData) {
  assertFirestoreReady()

  // product representa los datos normalizados antes de guardarse.
  const now = Date.now()
  const product = normalizeProduct({
    ...productData,
    id: 'pending-firestore-id',
    createdAt: now,
    updatedAt: now,
  })
  // id se separa porque Firestore genera el id del documento.
  // firestoreProduct contiene solo los campos que se guardan como data.
  const { id, createdAtTime, updatedAtTime, ...firestoreProduct } = product
  // createdProduct contiene la referencia creada por Firestore.
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

  // product representa los datos normalizados listos para guardar.
  const product = normalizeProduct({ ...productData, id: productId, updatedAt: Date.now() })
  // id se excluye de la data porque el id ya vive en la ruta del documento.
  // firestoreProduct contiene los campos editables del producto.
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

  await withFirebaseTimeout(
    deleteDoc(doc(db, productsCollectionName, String(productId))),
    'La eliminacion del producto',
  )
}

// seedProductsFromJson carga productos iniciales desde public/productos.json a Firestore.
export async function seedProductsFromJson() {
  assertFirestoreReady()
  await getProductCategories()

  // response representa la respuesta HTTP del JSON local incluido con el proyecto.
  const response = await fetch('/productos.json')

  if (!response.ok) {
    throw new Error('No se pudo leer el catalogo inicial.')
  }

  // products contiene el array base que se va a subir a Firestore.
  const products = await response.json()
  // createdProducts contiene las referencias creadas en Firestore.
  const createdProducts = await Promise.all(
    products.map((product, index) => {
      // id se descarta porque Firestore generara un id nuevo para cada documento.
      // productData contiene los datos guardables de cada producto.
      const createdAt = Date.now() + index
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
