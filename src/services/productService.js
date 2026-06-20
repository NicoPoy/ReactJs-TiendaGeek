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

const productsCollectionName = 'products'
const localProductsKey = 'universo-geek-products'

const normalizeProduct = (product) => ({
  ...product,
  id: String(product.id),
  price: Number(product.price),
  stock: Number(product.stock),
})

async function getLocalProducts() {
  const savedProducts = localStorage.getItem(localProductsKey)

  if (savedProducts) {
    return JSON.parse(savedProducts).map(normalizeProduct)
  }

  const response = await fetch('/productos.json')

  if (!response.ok) {
    throw new Error('No se pudieron cargar los productos')
  }

  const products = await response.json()
  const normalizedProducts = products.map(normalizeProduct)
  localStorage.setItem(localProductsKey, JSON.stringify(normalizedProducts))

  return normalizedProducts
}

function saveLocalProducts(products) {
  localStorage.setItem(localProductsKey, JSON.stringify(products.map(normalizeProduct)))
}

export async function getProducts() {
  if (!isFirebaseConfigured || !db) {
    return getLocalProducts()
  }

  const productsQuery = query(collection(db, productsCollectionName), orderBy('name'))
  const snapshot = await getDocs(productsQuery)

  return snapshot.docs.map((productDoc) =>
    normalizeProduct({ id: productDoc.id, ...productDoc.data() }),
  )
}

export async function getProductById(productId) {
  if (!isFirebaseConfigured || !db) {
    const products = await getLocalProducts()
    return products.find((product) => String(product.id) === String(productId)) ?? null
  }

  const productRef = doc(db, productsCollectionName, String(productId))
  const productSnapshot = await getDoc(productRef)

  if (!productSnapshot.exists()) {
    return null
  }

  return normalizeProduct({ id: productSnapshot.id, ...productSnapshot.data() })
}

export async function createProduct(productData) {
  const product = normalizeProduct({
    ...productData,
    id: crypto.randomUUID(),
  })

  if (!isFirebaseConfigured || !db) {
    const products = await getLocalProducts()
    saveLocalProducts([...products, product])
    return product
  }

  const { id, ...firestoreProduct } = product
  const createdProduct = await addDoc(collection(db, productsCollectionName), {
    ...firestoreProduct,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return { ...product, id: createdProduct.id }
}

export async function updateProduct(productId, productData) {
  const product = normalizeProduct({ ...productData, id: productId })

  if (!isFirebaseConfigured || !db) {
    const products = await getLocalProducts()
    saveLocalProducts(
      products.map((currentProduct) =>
        String(currentProduct.id) === String(productId) ? product : currentProduct,
      ),
    )
    return product
  }

  const { id, ...firestoreProduct } = product
  await updateDoc(doc(db, productsCollectionName, String(productId)), {
    ...firestoreProduct,
    updatedAt: serverTimestamp(),
  })

  return product
}

export async function deleteProduct(productId) {
  if (!isFirebaseConfigured || !db) {
    const products = await getLocalProducts()
    saveLocalProducts(
      products.filter((product) => String(product.id) !== String(productId)),
    )
    return
  }

  await deleteDoc(doc(db, productsCollectionName, String(productId)))
}

export async function seedProductsFromJson() {
  if (!isFirebaseConfigured || !db) {
    const response = await fetch('/productos.json')
    const products = await response.json()
    saveLocalProducts(products)
    return products.map(normalizeProduct)
  }

  const response = await fetch('/productos.json')
  const products = await response.json()
  const createdProducts = await Promise.all(
    products.map((product) => {
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
