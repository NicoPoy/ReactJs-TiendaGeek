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
// Las paginas consumen estas funciones sin saber si los datos vienen de
// Firestore, localStorage o productos.json.
// productsCollectionName representa el nombre de la coleccion usada en Firestore.
const productsCollectionName = 'products'
// localProductsKey representa la clave donde se guarda el catalogo en localStorage.
const localProductsKey = 'universo-geek-products'

// Normaliza datos que vienen de JSON, localStorage o Firestore.
const normalizeProduct = (product) => ({
  ...product,
  id: String(product.id),
  price: Number(product.price),
  stock: Number(product.stock),
})

// getLocalProducts obtiene productos desde localStorage o desde productos.json.
async function getLocalProducts() {
  // El fallback local permite probar el proyecto aunque Firebase no este listo.
  // savedProducts representa el catalogo guardado localmente, si existe.
  const savedProducts = localStorage.getItem(localProductsKey)

  if (savedProducts) {
    return JSON.parse(savedProducts).map(normalizeProduct)
  }

  // response representa la respuesta HTTP del JSON local.
  const response = await fetch('/productos.json')

  if (!response.ok) {
    throw new Error('No se pudieron cargar los productos')
  }

  // products contiene el array crudo recibido desde productos.json.
  const products = await response.json()
  // normalizedProducts contiene productos con id, precio y stock normalizados.
  const normalizedProducts = products.map(normalizeProduct)
  localStorage.setItem(localProductsKey, JSON.stringify(normalizedProducts))

  return normalizedProducts
}

// saveLocalProducts persiste productos en localStorage para el modo demo.
function saveLocalProducts(products) {
  localStorage.setItem(localProductsKey, JSON.stringify(products.map(normalizeProduct)))
}

// getProducts devuelve todos los productos disponibles para el catalogo.
export async function getProducts() {
  // Si no hay Firebase, se usa catalogo local.
  if (!isFirebaseConfigured || !db) {
    return getLocalProducts()
  }

  // productsQuery define la consulta ordenada por nombre en Firestore.
  const productsQuery = query(collection(db, productsCollectionName), orderBy('name'))
  // snapshot contiene los documentos devueltos por Firestore.
  const snapshot = await getDocs(productsQuery)

  return snapshot.docs.map((productDoc) =>
    normalizeProduct({ id: productDoc.id, ...productDoc.data() }),
  )
}

// getProductById busca un producto individual por id.
export async function getProductById(productId) {
  if (!isFirebaseConfigured || !db) {
    // products contiene el catalogo local usado para buscar el detalle.
    const products = await getLocalProducts()
    return products.find((product) => String(product.id) === String(productId)) ?? null
  }

  // productRef apunta al documento Firestore del producto solicitado.
  const productRef = doc(db, productsCollectionName, String(productId))
  // productSnapshot contiene el documento leido desde Firestore.
  const productSnapshot = await getDoc(productRef)

  if (!productSnapshot.exists()) {
    return null
  }

  return normalizeProduct({ id: productSnapshot.id, ...productSnapshot.data() })
}

// createProduct crea un producto nuevo en Firestore o en modo demo local.
export async function createProduct(productData) {
  // product representa el producto ya normalizado y con id local provisorio.
  const product = normalizeProduct({
    ...productData,
    id: crypto.randomUUID(),
  })

  if (!isFirebaseConfigured || !db) {
    // products contiene el catalogo local antes de agregar el nuevo producto.
    const products = await getLocalProducts()
    saveLocalProducts([...products, product])
    return product
  }

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

// updateProduct actualiza un producto existente por id.
export async function updateProduct(productId, productData) {
  // product representa los datos normalizados listos para guardar.
  const product = normalizeProduct({ ...productData, id: productId })

  if (!isFirebaseConfigured || !db) {
    // products contiene el catalogo local antes de reemplazar el producto editado.
    const products = await getLocalProducts()
    saveLocalProducts(
      products.map((currentProduct) =>
        String(currentProduct.id) === String(productId) ? product : currentProduct,
      ),
    )
    return product
  }

  // id se excluye de la data porque el id ya vive en la ruta del documento.
  // firestoreProduct contiene los campos editables del producto.
  const { id, ...firestoreProduct } = product
  await updateDoc(doc(db, productsCollectionName, String(productId)), {
    ...firestoreProduct,
    updatedAt: serverTimestamp(),
  })

  return product
}

// deleteProduct elimina un producto por id.
export async function deleteProduct(productId) {
  if (!isFirebaseConfigured || !db) {
    // products contiene el catalogo local antes de filtrar el producto eliminado.
    const products = await getLocalProducts()
    saveLocalProducts(
      products.filter((product) => String(product.id) !== String(productId)),
    )
    return
  }

  await deleteDoc(doc(db, productsCollectionName, String(productId)))
}

// seedProductsFromJson carga productos iniciales desde public/productos.json.
export async function seedProductsFromJson() {
  // Seed inicial para poblar Firestore desde el JSON entregado con el proyecto.
  if (!isFirebaseConfigured || !db) {
    // response representa la respuesta HTTP del JSON local.
    const response = await fetch('/productos.json')
    // products contiene el array base para guardar en modo demo.
    const products = await response.json()
    saveLocalProducts(products)
    return products.map(normalizeProduct)
  }

  // response representa la respuesta HTTP del JSON local.
  const response = await fetch('/productos.json')
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
