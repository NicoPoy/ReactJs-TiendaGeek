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
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, isFirebaseConfigured, storage } from '../firebase/config.js'

// Servicio unico de productos.
// Todas las operaciones de catalogo leen y escriben exclusivamente en Firestore.
const productsCollectionName = 'products'
const categoriesCollectionName = 'categories'
const productImagesPath = 'product-images'

export const defaultProductCategories = ['Perifericos', 'Setup', 'Rol', 'Coleccion']
export const maxProductImageSize = 1024 * 1024
export const acceptedProductImageTypes = ['image/jpeg', 'image/png', 'image/webp']

// Normaliza datos que vienen de Firestore o del JSON usado para sembrar la base.
const normalizeProduct = (product) => ({
  ...product,
  id: String(product.id),
  price: Number(product.price),
  stock: Number(product.stock),
})

const normalizeCategory = (category) => ({
  ...category,
  id: String(category.id),
  name: String(category.name),
})

function assertFirestoreReady() {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firestore no esta configurado.')
  }
}

function assertStorageReady() {
  if (!isFirebaseConfigured || !storage) {
    throw new Error('Firebase Storage no esta configurado.')
  }
}

function getSafeFileName(fileName) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
}

async function createCategoryDocument(name) {
  const createdCategory = await addDoc(collection(db, categoriesCollectionName), {
    name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return { id: createdCategory.id, name }
}

// uploadProductImage sube una imagen validada a Storage y devuelve su URL publica.
export async function uploadProductImage(file) {
  assertStorageReady()

  const safeFileName = getSafeFileName(file.name || 'producto')
  const imageId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`
  const imageRef = ref(storage, `${productImagesPath}/${imageId}-${safeFileName}`)

  await uploadBytes(imageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
    },
  })

  return getDownloadURL(imageRef)
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

  return snapshot.docs.map((categoryDoc) =>
    normalizeCategory({ id: categoryDoc.id, ...categoryDoc.data() }),
  )
}

// createProductCategory agrega una categoria nueva al selector del panel.
export async function createProductCategory(name) {
  assertFirestoreReady()

  return createCategoryDocument(name)
}

// deleteProductCategory elimina una categoria por id. El panel valida antes que no tenga productos.
export async function deleteProductCategory(categoryId) {
  assertFirestoreReady()

  await deleteDoc(doc(db, categoriesCollectionName, String(categoryId)))
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
  const product = normalizeProduct({
    ...productData,
    id: 'pending-firestore-id',
  })
  // id se separa porque Firestore genera el id del documento.
  // firestoreProduct contiene solo los campos que se guardan como data.
  const { id, ...firestoreProduct } = product
  // createdProduct contiene la referencia creada por Firestore.
  const createdProduct = await addDoc(collection(db, productsCollectionName), {
    ...firestoreProduct,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return { ...product, id: createdProduct.id }
}

// updateProduct actualiza un producto existente por id en Firestore.
export async function updateProduct(productId, productData) {
  assertFirestoreReady()

  // product representa los datos normalizados listos para guardar.
  const product = normalizeProduct({ ...productData, id: productId })
  // id se excluye de la data porque el id ya vive en la ruta del documento.
  // firestoreProduct contiene los campos editables del producto.
  const { id, ...firestoreProduct } = product
  await updateDoc(doc(db, productsCollectionName, String(productId)), {
    ...firestoreProduct,
    updatedAt: serverTimestamp(),
  })

  return product
}

// deleteProduct elimina un producto por id en Firestore.
export async function deleteProduct(productId) {
  assertFirestoreReady()

  await deleteDoc(doc(db, productsCollectionName, String(productId)))
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
    products.map((product) => {
      // id se descarta porque Firestore generara un id nuevo para cada documento.
      // productData contiene los datos guardables de cada producto.
      const { id, ...productData } = normalizeProduct(product)
      return addDoc(collection(db, productsCollectionName), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }),
  )

  return products.map((product, index) =>
    normalizeProduct({ ...product, id: createdProducts[index].id }),
  )
}
