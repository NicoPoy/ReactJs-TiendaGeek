import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config.js'
import {
  assertFirestoreReady,
  categoriesCollectionName,
  normalizeCategory,
  withFirebaseTimeout,
} from './firebaseServiceHelpers.js'

// Categorias base que se crean automaticamente si Firestore todavia no tiene ninguna.
export const defaultProductCategories = ['Perifericos', 'Setup', 'Rol', 'Coleccion']

// Genera una clave comparable para detectar categorias repetidas aunque cambien mayusculas o espacios.
function getCategoryKey(categoryName) {
  return String(categoryName).trim().toLowerCase()
}

// Limpia duplicados de Firestore y devuelve una lista unica para el selector del panel.
async function removeDuplicateCategories(categories) {
  // seenCategories guarda claves ya encontradas para conservar solo la primera aparicion.
  const seenCategories = new Set()
  // uniqueCategories es la lista final que la UI puede mostrar sin repetidos.
  const uniqueCategories = []
  // duplicatedCategories junta documentos sobrantes para borrarlos de Firestore.
  const duplicatedCategories = []

  categories.forEach((category) => {
    // categoryKey permite comparar nombres de manera estable.
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

// Crea el documento Firestore de una categoria y devuelve el formato que consume la UI.
async function createCategoryDocument(name) {
  // createdCategory contiene la referencia generada por Firestore con id automatico.
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

// getProductCategories devuelve categorias administrables desde Firestore.
export async function getProductCategories() {
  assertFirestoreReady()

  // categoriesQuery ordena alfabeticamente para que el panel sea predecible.
  const categoriesQuery = query(collection(db, categoriesCollectionName), orderBy('name'))
  // snapshot contiene los documentos actuales de la coleccion categories.
  const snapshot = await getDocs(categoriesQuery)

  if (snapshot.empty) {
    // createdCategories inicializa el proyecto con categorias minimas de tienda geek.
    const createdCategories = await Promise.all(
      defaultProductCategories.map((categoryName) => createCategoryDocument(categoryName)),
    )
    return createdCategories.sort((a, b) => a.name.localeCompare(b.name))
  }

  // loadedCategories adapta documentos Firestore al formato simple usado por formularios.
  const loadedCategories = snapshot.docs.map((categoryDoc) =>
    normalizeCategory({ id: categoryDoc.id, ...categoryDoc.data() }),
  )

  // uniqueCategories evita mostrar/borrar categorias repetidas accidentalmente.
  const uniqueCategories = await removeDuplicateCategories(loadedCategories)
  return uniqueCategories.sort((a, b) => a.name.localeCompare(b.name))
}

// createProductCategory agrega una categoria nueva al selector del panel.
export async function createProductCategory(name) {
  assertFirestoreReady()

  // Se reutiliza el helper para mantener timestamps y formato de respuesta iguales.
  return createCategoryDocument(name)
}

// deleteProductCategory elimina una categoria por id. El panel valida antes que no tenga productos.
export async function deleteProductCategory(categoryId) {
  assertFirestoreReady()

  // categoryId se convierte a string para aceptar ids recibidos desde formularios o estado.
  await withFirebaseTimeout(
    deleteDoc(doc(db, categoriesCollectionName, String(categoryId))),
    'La eliminacion de la categoria',
  )
}
