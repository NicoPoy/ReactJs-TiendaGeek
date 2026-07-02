// Peso maximo aceptado desde el formulario antes de intentar comprimir la imagen.
export const maxProductImageSize = 5 * 1024 * 1024
// Tipos permitidos para evitar formatos que el navegador o Firestore manejen mal.
export const acceptedProductImageTypes = ['image/jpeg', 'image/png', 'image/webp']

// Peso objetivo del data URL final para no exceder limites practicos de Firestore.
const maxStoredProductImageSize = 700 * 1024
// Dimension maxima usada al redimensionar para balancear calidad y peso.
const maxProductImageDimension = 900

// Lee un File del input y lo transforma en data URL para poder cargarlo en un canvas.
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    // reader encapsula la API nativa de archivos del navegador.
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'))
    reader.readAsDataURL(file)
  })
}

// Carga el data URL en un elemento Image para conocer dimensiones y dibujarlo.
function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    // image es un objeto temporal, no se renderiza; solo sirve para procesamiento.
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('No se pudo procesar la imagen seleccionada.'))
    image.src = dataUrl
  })
}

// Convierte el contenido del canvas a Blob con tipo/calidad elegidos.
function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality)
  })
}

// Vuelve a data URL porque el producto guarda la imagen comprimida dentro de Firestore.
async function blobToDataUrl(blob) {
  return readFileAsDataUrl(blob)
}

// Redimensiona y comprime la imagen hasta que entre en el peso objetivo.
async function compressImageFile(file) {
  // sourceDataUrl es la version original legible por el navegador.
  const sourceDataUrl = await readFileAsDataUrl(file)
  // sourceImage permite obtener ancho/alto reales del archivo.
  const sourceImage = await loadImage(sourceDataUrl)
  // scale limita la imagen sin agrandarla si ya es chica.
  const scale = Math.min(
    maxProductImageDimension / sourceImage.width,
    maxProductImageDimension / sourceImage.height,
    1,
  )
  // width y height son las dimensiones finales del canvas.
  const width = Math.max(Math.round(sourceImage.width * scale), 1)
  const height = Math.max(Math.round(sourceImage.height * scale), 1)
  // canvas funciona como superficie de redimensionado antes de generar WEBP.
  const canvas = document.createElement('canvas')
  // context dibuja la imagen redimensionada dentro del canvas.
  const context = canvas.getContext('2d')

  canvas.width = width
  canvas.height = height
  context.drawImage(sourceImage, 0, 0, width, height)

  // quality intenta de mayor a menor para conservar la mejor imagen que entre en Firestore.
  for (const quality of [0.86, 0.78, 0.68, 0.58, 0.48]) {
    // blob es el archivo comprimido resultante de cada intento.
    const blob = await canvasToBlob(canvas, 'image/webp', quality)

    if (blob && blob.size <= maxStoredProductImageSize) {
      return blobToDataUrl(blob)
    }
  }

  throw new Error('La imagen es demasiado pesada para guardarla gratis en Firestore. Proba con una imagen mas chica o mas liviana.')
}

// uploadProductImage prepara una imagen para guardarla gratis dentro del producto en Firestore.
export async function uploadProductImage(file) {
  // acceptedProductImageTypes bloquea formatos no previstos antes de gastar procesamiento.
  if (!acceptedProductImageTypes.includes(file.type)) {
    throw new Error('La imagen debe ser JPG, PNG o WEBP.')
  }

  // maxProductImageSize evita intentar procesar archivos demasiado pesados para el navegador.
  if (file.size > maxProductImageSize) {
    throw new Error('La imagen no puede superar 5 MB.')
  }

  // compressImageFile devuelve el data URL final listo para guardarse en el producto.
  return compressImageFile(file)
}
