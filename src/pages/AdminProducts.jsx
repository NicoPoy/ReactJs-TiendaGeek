import { useEffect, useMemo, useState } from 'react'
import { Alert, Form, Modal, Spinner, Table } from 'react-bootstrap'
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiDatabase,
  FiEdit3,
  FiFolderPlus,
  FiImage,
  FiSearch,
  FiInfo,
  FiLogOut,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiZap,
} from 'react-icons/fi'
import styled from 'styled-components'
import Seo from '../components/seo/Seo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  acceptedProductImageTypes,
  createProduct,
  createProductCategory,
  defaultProductCategories,
  deleteProduct,
  deleteProductCategory,
  getProductCategories,
  getProducts,
  maxProductImageSize,
  seedProductsFromJson,
  updateProduct,
  uploadProductImage,
} from '../services/productService.js'

// AdminProducts es el panel privado de administracion.
// Permite listar, crear, editar, eliminar y cargar productos iniciales.
// maxImageSizeLabel formatea el limite tecnico en un texto entendible para errores.
const maxImageSizeLabel = `${maxProductImageSize / 1024 / 1024} MB`
const allProductsLabel = 'Todos'
const adminTablePageSize = 5
// productFieldLimits centraliza reglas de validacion para no repetir numeros en el formulario.
const productFieldLimits = {
  category: 40,
  name: 60,
  description: 140,
  details: 320,
  price: 9999999,
  stock: 999,
}

// normalizeCategoryName permite comparar categorias sin que importen espacios o mayusculas.
function normalizeCategoryName(categoryName) {
  return String(categoryName).trim().toLowerCase()
}

// parseCurrencyValue convierte el texto con formato argentino a numero guardable.
function parseCurrencyValue(value) {
  // normalizedValue limpia simbolos y separadores antes de llamar a Number.
  const normalizedValue = String(value)
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  // numericValue es el precio final usado para validaciones y Firestore.
  const numericValue = Number(normalizedValue)

  return Number.isFinite(numericValue) ? numericValue : 0
}

// formatCurrencyInput muestra el precio como moneda mientras se escribe o edita.
function formatCurrencyInput(value, { preserveUserCents = false } = {}) {
  if (preserveUserCents) {
    const cleanValue = String(value).replace(/[^\d,]/g, '')
    const [integerValue = '', centsValue = ''] = cleanValue.split(',')
    const integerDigits = integerValue.replace(/\D/g, '')

    if (!integerDigits) return ''

    const formattedInteger = Number(integerDigits).toLocaleString('es-AR')

    if (cleanValue.includes(',')) {
      return `$${formattedInteger},${centsValue.replace(/\D/g, '').slice(0, 2)}`
    }

    return `$${formattedInteger}`
  }

  // numericValue acepta tanto numeros de Firestore como strings del input.
  const numericValue = typeof value === 'number' ? value : parseCurrencyValue(value)

  if (!numericValue) return ''

  const showCents = !Number.isInteger(numericValue)

  return `$${numericValue.toLocaleString('es-AR', {
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })}`
}
// getProductSaveErrorMessage agrega detalle tecnico cuando Firebase o imagen devuelven Error.
function getProductSaveErrorMessage(error) {
  // fallbackMessage es el mensaje base para no exponer errores crudos sin contexto.
  const fallbackMessage = 'No se pudo guardar el producto. Revisa la imagen y la conexion.'

  if (error instanceof Error && error.message) {
    return `${fallbackMessage} Detalle: ${error.message}`
  }

  return fallbackMessage
}

// Estado inicial compartido por alta y edicion de productos.
const initialFormData = {
  name: '',
  category: defaultProductCategories[0],
  price: '',
  stock: '',
  image: '',
  description: '',
  details: '',
}

// styled-components se usa aca para cumplir la consigna sin mezclar
// estilos puntuales del toolbar con el CSS global.
const AdminToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
  margin: 28px 0 18px;
`

function AdminProducts() {
  // useAuth entrega sesion admin, estado de Firebase y accion para cerrar sesion.
  const { isFirebaseConfigured, logout, user } = useAuth()
  // products es la lista editable que alimenta tabla, estadisticas y categorias en uso.
  const [products, setProducts] = useState([])
  // productCategories contiene las categorias administrables leidas desde Firestore.
  const [productCategories, setProductCategories] = useState([])
  // newCategoryName guarda el input de alta rapida de categoria.
  const [newCategoryName, setNewCategoryName] = useState('')
  // formData contiene los campos del formulario de alta/edicion.
  const [formData, setFormData] = useState(initialFormData)
  // imageFile guarda el archivo original elegido para saber si hay una imagen nueva.
  const [imageFile, setImageFile] = useState(null)
  // preparedImage guarda la imagen comprimida lista para persistir.
  const [preparedImage, setPreparedImage] = useState('')
  // imagePreview muestra una vista previa local o remota sin guardar todavia.
  const [imagePreview, setImagePreview] = useState('')
  // imageUploadError separa errores de imagen de errores generales del producto.
  const [imageUploadError, setImageUploadError] = useState('')
  // imageProcessing bloquea el guardado mientras se valida/comprime la imagen.
  const [imageProcessing, setImageProcessing] = useState(false)
  // editingProductId indica si el formulario esta editando o creando.
  const [editingProductId, setEditingProductId] = useState(null)
  // loading cubre la carga inicial de productos/categorias.
  const [loading, setLoading] = useState(true)
  // saving cubre operaciones de escritura para deshabilitar acciones duplicadas.
  const [saving, setSaving] = useState(false)
  // error muestra problemas recuperables en el panel.
  const [error, setError] = useState('')
  // success confirma acciones completadas sin salir de la pantalla.
  const [success, setSuccess] = useState('')
  const [tableSearchTerm, setTableSearchTerm] = useState('')
  const [tableCategoryFilter, setTableCategoryFilter] = useState(allProductsLabel)
  const [tableStockFilter, setTableStockFilter] = useState('all')
  const [tablePage, setTablePage] = useState(1)
  const [confirmAction, setConfirmAction] = useState(null)

  // isEditing simplifica condicionales de titulo, boton y submit.
  const isEditing = Boolean(editingProductId)

  const closeConfirmAction = () => {
    if (!saving) setConfirmAction(null)
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return
    await confirmAction.onConfirm()
    setConfirmAction(null)
  }
  // sortedProducts ordena la tabla alfabeticamente sin mutar el estado original.
  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  )

  const filteredTableProducts = useMemo(() => {
    const normalizedSearch = tableSearchTerm.trim().toLowerCase()

    return sortedProducts.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch)
      const matchesCategory =
        tableCategoryFilter === allProductsLabel || product.category === tableCategoryFilter
      const matchesStock =
        tableStockFilter === 'all' ||
        (tableStockFilter === 'available' && product.stock > 5) ||
        (tableStockFilter === 'low' && product.stock > 0 && product.stock <= 5) ||
        (tableStockFilter === 'out' && product.stock === 0)

      return matchesSearch && matchesCategory && matchesStock
    })
  }, [sortedProducts, tableCategoryFilter, tableSearchTerm, tableStockFilter])

  const tableTotalPages = Math.max(Math.ceil(filteredTableProducts.length / adminTablePageSize), 1)
  const tableFirstProductIndex = (tablePage - 1) * adminTablePageSize
  const paginatedTableProducts = filteredTableProducts.slice(
    tableFirstProductIndex,
    tableFirstProductIndex + adminTablePageSize,
  )
  // totalStock alimenta la metrica de unidades disponibles del dashboard admin.
  const totalStock = useMemo(
    () => products.reduce((total, product) => total + product.stock, 0),
    [products],
  )

  // inventoryValue estima el valor del inventario multiplicando precio por stock.
  const inventoryValue = useMemo(
    () =>
      products.reduce(
        (total, product) => total + product.price * product.stock,
        0,
      ),
    [products],
  )

  // productsByCategory resume cuantos productos usan cada categoria para evitar borrados peligrosos.
  const productsByCategory = useMemo(
    () =>
      products.reduce((summary, product) => {
        summary[product.category] = (summary[product.category] ?? 0) + 1
        return summary
      }, {}),
    [products],
  )

  // categoryCount muestra cuantas categorias hay configuradas.
  const categoryCount = productCategories.length

  useEffect(() => {
    setTablePage(1)
  }, [tableCategoryFilter, tableSearchTerm, tableStockFilter, products.length])
  // Limpia object URLs de previews para no acumular memoria del navegador.
  useEffect(
    () => () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    },
    [imagePreview],
  )

  // loadProducts trae productos y categorias en paralelo al abrir o refrescar el panel.
  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')
      // Promise.all reduce tiempo de espera porque ambas lecturas son independientes.
      const [loadedProducts, loadedCategories] = await Promise.all([
        getProducts(),
        getProductCategories(),
      ])
      setProducts(loadedProducts)
      setProductCategories(loadedCategories)
      // Si el formulario no tiene categoria, usa la primera disponible.
      setFormData((currentData) => ({
        ...currentData,
        category: currentData.category || loadedCategories[0]?.name || '',
      }))
    } catch {
      setError('No se pudieron cargar los productos o categorias.')
    } finally {
      setLoading(false)
    }
  }

  // Carga inicial del panel admin.
  useEffect(() => {
    loadProducts()
  }, [])

  // handleChange sincroniza inputs; price se formatea como moneda.
  const handleChange = (event) => {
    // name identifica que campo del formulario se esta editando.
    const { name, value } = event.target

    if (name === 'price') {
      setFormData((currentData) => ({
        ...currentData,
        price: formatCurrencyInput(value, { preserveUserCents: true }),
      }))
      return
    }

    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  // resetForm vuelve al modo alta y limpia imagenes/errores temporales.
  const resetForm = () => {
    setFormData({
      ...initialFormData,
      category: productCategories[0]?.name || '',
    })
    setImageFile(null)
    setPreparedImage('')
    setImagePreview('')
    setImageUploadError('')
    setImageProcessing(false)
    setEditingProductId(null)
  }

  // handleImageChange valida y comprime la imagen apenas el admin la selecciona.
  const handleImageChange = async (event) => {
    // selectedFile es el archivo elegido desde el input file.
    const selectedFile = event.target.files?.[0]
    // input permite limpiar el valor si el archivo no sirve.
    const input = event.target
    setImageUploadError('')
    setPreparedImage('')
    setError('')

    if (!selectedFile) {
      setImageFile(null)
      setImagePreview(formData.image)
      setImageProcessing(false)
      return
    }

    if (!acceptedProductImageTypes.includes(selectedFile.type)) {
      setImageFile(null)
      setImageUploadError('La imagen debe ser JPG, PNG o WEBP.')
      input.value = ''
      return
    }

    if (selectedFile.size > maxProductImageSize) {
      setImageFile(null)
      setImageUploadError(`La imagen no puede superar ${maxImageSizeLabel}.`)
      input.value = ''
      return
    }

    setImageProcessing(true)

    try {
      // compressedImage es el data URL final que se guarda gratis en Firestore.
      const compressedImage = await uploadProductImage(selectedFile)
      setImageFile(selectedFile)
      setPreparedImage(compressedImage)
      setImagePreview(compressedImage)
    } catch (imageError) {
      setImageFile(null)
      setPreparedImage('')
      setImagePreview(formData.image)
      setImageUploadError(`No pudimos usar esa imagen. ${imageError instanceof Error ? imageError.message : 'Proba con otro archivo.'}`)
      input.value = ''
    } finally {
      setImageProcessing(false)
    }
  }

  // handleAddCategory crea una categoria nueva si no existe y la selecciona en el formulario.
  const handleAddCategory = async (event) => {
    event.preventDefault()
    // normalizedName es el nombre visible luego de quitar espacios extremos.
    const normalizedName = newCategoryName.trim()
    setError('')
    setSuccess('')

    if (!normalizedName) {
      setError('Ingresa un nombre de categoria.')
      return
    }

    if (normalizedName.length > productFieldLimits.category) {
      setError('La categoria no puede superar ' + productFieldLimits.category + ' caracteres.')
      return
    }

    // categoryExists evita duplicados con distinta capitalizacion.
    const categoryExists = productCategories.some(
      (category) => normalizeCategoryName(category.name) === normalizeCategoryName(normalizedName),
    )

    if (categoryExists) {
      setError('Esa categoria ya existe.')
      return
    }

    setConfirmAction({
      title: 'Agregar categoria',
      message: `Vas a sumar "${normalizedName}" como nueva categoria del catalogo.`,
      confirmLabel: 'Agregar categoria',
      tone: 'success',
      onConfirm: async () => {
        try {
          setSaving(true)
          const createdCategory = await createProductCategory(normalizedName)
          setProductCategories((currentCategories) =>
            [...currentCategories, createdCategory].sort((a, b) =>
              a.name.localeCompare(b.name),
            ),
          )
          setFormData((currentData) => ({ ...currentData, category: createdCategory.name }))
          setNewCategoryName('')
          setSuccess('Categoria agregada correctamente.')
        } catch {
          setError('No se pudo agregar la categoria.')
        } finally {
          setSaving(false)
        }
      },
    })
  }

  // handleDeleteCategory elimina categorias vacias; bloquea las que ya tienen productos.
  const handleDeleteCategory = async (category) => {
    // productsInCategory protege contra dejar productos apuntando a categorias borradas.
    const productsInCategory = productsByCategory[category.name] ?? 0
    setError('')
    setSuccess('')

    if (productsInCategory > 0) {
      setError(`No podes eliminar "${category.name}" porque tiene ${productsInCategory} producto(s).`)
      return
    }

    setConfirmAction({
      title: 'Eliminar categoria',
      message: `Vas a eliminar "${category.name}" del catalogo. Esta accion no se puede deshacer.`,
      confirmLabel: 'Eliminar categoria',
      tone: 'danger',
      onConfirm: async () => {
        try {
          setSaving(true)
          await deleteProductCategory(category.id)
          setProductCategories((currentCategories) => {
            const nextCategories = currentCategories.filter(
              (currentCategory) => currentCategory.id !== category.id,
            )
            setFormData((currentData) => ({
              ...currentData,
              category:
                currentData.category === category.name
                  ? nextCategories[0]?.name || ''
                  : currentData.category,
            }))
            return nextCategories
          })
          setSuccess('Categoria eliminada correctamente.')
        } catch {
          setError('No se pudo eliminar la categoria.')
        } finally {
          setSaving(false)
        }
      },
    })
  }

  // Validaciones minimas pedidas para evitar productos incompletos.
  const validateForm = () => {
    if (!formData.name.trim()) return 'El nombre es obligatorio.'
    if (formData.name.trim().length > productFieldLimits.name) return 'El nombre no puede superar ' + productFieldLimits.name + ' caracteres.'
    if (!formData.category) return 'Agrega o selecciona una categoria.'
    if (imageProcessing) return 'Espera a que terminemos de revisar la imagen.'
    if (!imageFile && !formData.image.trim()) return 'Selecciona una imagen del producto.'
    if (imageFile && !preparedImage) return 'Selecciona la imagen nuevamente.'
    if (!formData.description.trim()) return 'La descripcion corta es obligatoria.'
    if (formData.description.trim().length > productFieldLimits.description) return 'La descripcion corta no puede superar ' + productFieldLimits.description + ' caracteres.'
    if (!formData.details.trim()) return 'El detalle del producto es obligatorio.'
    if (formData.details.trim().length > productFieldLimits.details) return 'El detalle no puede superar ' + productFieldLimits.details + ' caracteres.'
    // priceValue convierte el input monetario a numero para validar rango real.
    const priceValue = parseCurrencyValue(formData.price)
    if (priceValue <= 0) return 'El precio debe ser mayor a 0.'
    if (priceValue > productFieldLimits.price) return 'El precio no puede superar ' + productFieldLimits.price + '.'
    if (Number(formData.stock) <= 0) return 'El stock debe ser mayor a 0.'
    if (Number(formData.stock) > productFieldLimits.stock) return 'El stock no puede superar ' + productFieldLimits.stock + ' unidades.'
    if (imageUploadError) return imageUploadError
    return ''
  }

  // handleSubmit decide entre crear o actualizar segun isEditing.
  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    // validationError contiene el primer problema encontrado para mostrarlo al admin.
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setConfirmAction({
      title: isEditing ? 'Guardar cambios' : 'Agregar producto',
      message: isEditing
        ? `Vas a actualizar "${formData.name.trim()}" en el catalogo.`
        : `Vas a publicar "${formData.name.trim()}" en el catalogo.`,
      confirmLabel: isEditing ? 'Guardar cambios' : 'Agregar producto',
      tone: 'success',
      onConfirm: async () => {
        try {
          setSaving(true)
          const imageUrl = imageFile
            ? preparedImage
            : formData.image.trim()

          const payload = {
            ...formData,
            name: formData.name.trim(),
            image: imageUrl,
            description: formData.description.trim(),
            details: formData.details.trim(),
            price: parseCurrencyValue(formData.price),
            stock: Number(formData.stock),
          }

          if (isEditing) {
            const updatedProduct = await updateProduct(editingProductId, payload)
            setProducts((currentProducts) =>
              currentProducts.map((product) =>
                product.id === editingProductId ? updatedProduct : product,
              ),
            )
            setSuccess('Producto actualizado correctamente.')
          } else {
            const createdProduct = await createProduct(payload)
            setProducts((currentProducts) => [...currentProducts, createdProduct])
            setSuccess('Ya aparece en la vitrina del catalogo.')
          }
          resetForm()
        } catch (saveError) {
          setError(getProductSaveErrorMessage(saveError))
        } finally {
          setSaving(false)
        }
      },
    })
  }

  // handleEdit carga un producto existente en el formulario para modificarlo.
  const handleEdit = (product) => {
    setEditingProductId(product.id)
    setFormData({
      name: product.name,
      category: product.category,
      price: formatCurrencyInput(product.price),
      stock: product.stock,
      image: product.image,
      description: product.description,
      details: product.details,
    })
    setImageFile(null)
    setPreparedImage('')
    setImagePreview(product.image)
    setImageUploadError('')
    setImageProcessing(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }


  // handleSeed carga el JSON inicial cuando la base esta vacia o se quiere reiniciar catalogo.
  const handleSeed = async () => {
    try {
      setSaving(true)
      setError('')
      // seededProducts devuelve los productos creados con ids reales de Firestore.
      const seededProducts = await seedProductsFromJson()
      // loadedCategories refresca categorias porque el seed tambien asegura categorias base.
      const loadedCategories = await getProductCategories()
      setProducts(seededProducts)
      setProductCategories(loadedCategories)
      setSuccess('Catalogo inicial cargado correctamente.')
    } catch {
      setError('No se pudo cargar el catalogo inicial.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-section admin-section">
      <Seo
        title="Panel de productos"
        description="Panel privado para crear, editar y eliminar productos de Universo Geek."
      />

      <div className="admin-hero">
        <div className="admin-hero-content">
          <span className="eyebrow">Panel privado</span>
          <h1>Gestion de productos</h1>
          <p>
            Administra el catalogo publicado, controla stock y mantene
            la tienda lista para vender.
          </p>
          <div className="admin-session">
            <span>Sesion activa</span>
            <strong>{user?.email}</strong>
          </div>
        </div>

        <div className="admin-hero-actions">
          <button className="button button-logout" type="button" onClick={logout}>
            <FiLogOut aria-hidden="true" />
            Cerrar sesion
          </button>
        </div>
      </div>

      <div className="admin-stats" aria-label="Resumen del catalogo">
        <article>
          <FiPackage aria-hidden="true" />
          <span>Productos</span>
          <strong>{products.length}</strong>
        </article>
        <article>
          <FiDatabase aria-hidden="true" />
          <span>Unidades en stock</span>
          <strong>{totalStock}</strong>
        </article>
        <article>
          <FiZap aria-hidden="true" />
          <span>Categorias activas</span>
          <strong>{categoryCount}</strong>
        </article>
        <article>
          <FiDatabase aria-hidden="true" />
          <span>Valor inventario</span>
          <strong>${inventoryValue.toLocaleString('es-AR')}</strong>
        </article>
      </div>

      {!isFirebaseConfigured && (
        <Alert className="admin-alert admin-alert-warning" variant="warning">
          <FiInfo aria-hidden="true" />
          <div>
            <strong>Panel temporalmente limitado</strong>
            <span>
              El panel necesita una conexion activa para guardar y consultar datos.
              Revisa la configuracion de la tienda.
            </span>
          </div>
        </Alert>
      )}

      {error && (
        <Alert className="admin-alert admin-alert-danger" variant="danger">
          <FiAlertTriangle aria-hidden="true" />
          <div>
            <strong>Quest bloqueada</strong>
            <span>{error}</span>
          </div>
        </Alert>
      )}
      {success && (
        <Alert className="admin-alert admin-alert-success" variant="success">
          <FiCheckCircle aria-hidden="true" />
          <div>
            <strong>Item agregado al inventario</strong>
            <span>{success}</span>
          </div>
        </Alert>
      )}

      <section className="category-manager" aria-labelledby="category-manager-title">
        <div className="category-manager-heading">
          <div>
            <span className="eyebrow">Categorias</span>
            <h2 id="category-manager-title">Organizacion del catalogo</h2>
          </div>
          <p>Solo podes borrar categorias sin productos asociados.</p>
        </div>

        <Form className="category-form" onSubmit={handleAddCategory}>
          <Form.Group controlId="new-category">
            <div className="field-heading">
              <Form.Label>Nueva categoria</Form.Label>
              <Form.Text>Se muestra como filtro del catalogo. Maximo {productFieldLimits.category} caracteres.</Form.Text>
            </div>
            <Form.Control
              maxLength={productFieldLimits.category}
              placeholder="Ej: Consolas, Comics, Merchandising..."
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
            />
          </Form.Group>
          <button className="button" disabled={saving} type="submit">
            <FiFolderPlus aria-hidden="true" />
            Agregar categoria
          </button>
        </Form>

        <div className="category-list" aria-label="Categorias disponibles">
          {productCategories.map((category) => {
            const productsInCategory = productsByCategory[category.name] ?? 0
            const canDeleteCategory = productsInCategory === 0

            return (
              <article className="category-pill" key={category.id}>
                <div>
                  <strong>{category.name}</strong>
                  <span>{productsInCategory} producto(s)</span>
                </div>
                <button
                  className="icon-button danger"
                  disabled={!canDeleteCategory || saving}
                  title={
                    canDeleteCategory
                      ? 'Eliminar categoria'
                      : 'No se puede eliminar una categoria con productos'
                  }
                  type="button"
                  onClick={() => handleDeleteCategory(category)}
                >
                  <FiTrash2 aria-hidden="true" />
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <AdminToolbar>
        <div className="admin-block-heading">
          <span className="eyebrow">Inventario</span>
          <h2>Alta y mantenimiento</h2>
        </div>
      </AdminToolbar>

      <Form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-heading">
          <div>
            <span>{isEditing ? 'Editando producto' : 'Nuevo producto'}</span>
            <strong>
              {isEditing
                ? 'Actualiza la ficha seleccionada'
                : 'Carga una ficha lista para publicar'}
            </strong>
          </div>
        </div>

        <div className="form-grid">
          <Form.Group controlId="name">
            <div className="field-heading">
              <Form.Label>Nombre</Form.Label>
              <Form.Text>Se muestra como titulo en catalogo y detalle. Maximo {productFieldLimits.name} caracteres.</Form.Text>
            </div>
            <Form.Control
              maxLength={productFieldLimits.name}
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="category">
            <div className="field-heading">
              <Form.Label>Categoria</Form.Label>
              <Form.Text>Se muestra como filtro y etiqueta del producto.</Form.Text>
            </div>
            <Form.Select
              disabled={productCategories.length === 0}
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {productCategories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="price">
            <div className="field-heading">
              <Form.Label>Precio</Form.Label>
              <Form.Text>Se muestra en tarjetas, detalle y carrito.</Form.Text>
            </div>
            <Form.Control
              inputMode="decimal"
              maxLength="18"
              name="price"
              placeholder="$15.000,00"
              type="text"
              value={formData.price}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="stock">
            <div className="field-heading">
              <Form.Label>Stock</Form.Label>
              <Form.Text>Se muestra en el detalle y limita compras. Maximo {productFieldLimits.stock}.</Form.Text>
            </div>
            <Form.Control
              max={productFieldLimits.stock}
              min="1"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
            />
          </Form.Group>
        </div>

        <Form.Group className="mt-3" controlId="product-image">
          <div className="field-heading">
            <Form.Label>Imagen</Form.Label>
            <Form.Text>Se muestra en catalogo, detalle y carrito.</Form.Text>
          </div>
          <div className="image-upload-box">
            <label className="image-upload-drop" htmlFor="product-image-input">
              <FiImage aria-hidden="true" />
              <strong>Elegir imagen desde tu computadora</strong>
              <span>JPG, PNG o WEBP. Maximo {maxImageSizeLabel}.</span>
              {imageProcessing && <small>Revisando imagen...</small>}
              {!imageProcessing && imageFile && <small>{imageFile.name}</small>}
            </label>
            <input
              accept={acceptedProductImageTypes.join(',')}
              className="image-file-input"
              id="product-image-input"
              type="file"
              onChange={handleImageChange}
            />
            <div className={`image-preview${!imagePreview || imageProcessing ? ' empty' : ''}`}>
              {imagePreview && !imageProcessing ? (
                <img src={imagePreview} alt="Vista previa del producto" />
              ) : (
                <div className="image-preview-placeholder">
                  <FiImage aria-hidden="true" />
                  <span>Sin imagen</span>
                </div>
              )}
              <span>{imagePreview && !imageProcessing ? (imageFile ? 'Vista previa' : 'Imagen actual') : 'Vista previa'}</span>
            </div>
          </div>
          {imageUploadError && <p className="form-error">{imageUploadError}</p>}
        </Form.Group>

        <Form.Group className="mt-3" controlId="description">
          <div className="field-heading">
            <Form.Label>Descripcion corta</Form.Label>
            <Form.Text>Se muestra en las tarjetas del catalogo. Maximo {productFieldLimits.description} caracteres.</Form.Text>
          </div>
          <Form.Control
            as="textarea"
            maxLength={productFieldLimits.description}
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mt-3" controlId="details">
          <div className="field-heading">
            <Form.Label>Detalle</Form.Label>
            <Form.Text>Se muestra en la pagina individual del producto. Maximo {productFieldLimits.details} caracteres.</Form.Text>
          </div>
          <Form.Control
            as="textarea"
            maxLength={productFieldLimits.details}
            name="details"
            rows={3}
            value={formData.details}
            onChange={handleChange}
          />
        </Form.Group>

        <div className="form-actions">
          <button className="button admin-submit-button" disabled={saving || imageProcessing} type="submit">
            {saving ? <Spinner animation="border" size="sm" /> : <FiPlus aria-hidden="true" />}
            {isEditing ? 'Guardar cambios' : 'Agregar producto'}
          </button>
          {isEditing && (
            <button className="button button-secondary" type="button" onClick={resetForm}>
              Cancelar edicion
            </button>
          )}
        </div>
      </Form>

      <div className="admin-list-heading">
        <div>
          <span className="eyebrow">Inventario</span>
          <h2>Productos publicados</h2>
        </div>
        <p>{filteredTableProducts.length} de {sortedProducts.length} productos visibles</p>
      </div>

      <section className="admin-table-panel" aria-label="Listado de productos publicados">
        <div className="admin-table-filters">
          <label className="admin-table-search" htmlFor="admin-product-search">
            <span>Buscar</span>
            <div>
              <FiSearch aria-hidden="true" />
              <input
                id="admin-product-search"
                placeholder="Nombre, categoria o descripcion"
                value={tableSearchTerm}
                onChange={(event) => setTableSearchTerm(event.target.value)}
              />
            </div>
          </label>

          <label htmlFor="admin-category-filter">
            <span>Categoria</span>
            <select
              id="admin-category-filter"
              value={tableCategoryFilter}
              onChange={(event) => setTableCategoryFilter(event.target.value)}
            >
              <option value={allProductsLabel}>{allProductsLabel}</option>
              {productCategories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="admin-stock-filter">
            <span>Stock</span>
            <select
              id="admin-stock-filter"
              value={tableStockFilter}
              onChange={(event) => setTableStockFilter(event.target.value)}
            >
              <option value="all">Todos</option>
              <option value="available">Disponible</option>
              <option value="low">Bajo stock</option>
              <option value="out">Sin stock</option>
            </select>
          </label>
        </div>

        <div className="admin-table-wrap">
          {loading ? (
            <p className="status-message">Cargando productos...</p>
          ) : filteredTableProducts.length === 0 ? (
            <p className="status-message admin-empty-table">No hay productos para esos filtros.</p>
          ) : (
            <Table responsive hover variant="dark">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoria</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTableProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        <img src={product.image} alt="" aria-hidden="true" />
                        <div>
                          <strong>{product.name}</strong>
                          <span>{product.description}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-category-tag">{product.category}</span>
                    </td>
                    <td className="admin-price-cell">${product.price.toLocaleString('es-AR')}</td>
                    <td>
                      <span className={`admin-stock-badge${product.stock <= 5 ? ' warning' : ''}${product.stock === 0 ? ' empty' : ''}`}>
                        {product.stock} unidades
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-button"
                          title="Editar producto"
                          type="button"
                          onClick={() => handleEdit(product)}
                        >
                          <FiEdit3 aria-hidden="true" />
                        </button>
                        <button
                          className="icon-button danger"
                          title="Eliminar producto"
                          type="button"
                          onClick={() =>
                            setConfirmAction({
                              title: 'Eliminar producto',
                              message: `Vas a eliminar "${product.name}" del catalogo. Esta accion no se puede deshacer.`,
                              confirmLabel: 'Eliminar producto',
                              tone: 'danger',
                              onConfirm: async () => {
                                try {
                                  setSaving(true)
                                  await deleteProduct(product.id)
                                  setProducts((currentProducts) =>
                                    currentProducts.filter((currentProduct) => currentProduct.id !== product.id),
                                  )
                                  setSuccess('Producto eliminado correctamente.')
                                } catch {
                                  setError('No se pudo eliminar el producto.')
                                } finally {
                                  setSaving(false)
                                }
                              },
                            })
                          }
                        >
                          <FiTrash2 aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>

        <div className="admin-table-pagination">
          <span>
            Pagina {tablePage} de {tableTotalPages} - {adminTablePageSize} por pagina
          </span>
          <div>
            <button
              className="button button-secondary"
              disabled={tablePage === 1 || loading}
              type="button"
              onClick={() => setTablePage((page) => Math.max(page - 1, 1))}
            >
              Anterior
            </button>
            <button
              className="button button-secondary"
              disabled={tablePage === tableTotalPages || loading}
              type="button"
              onClick={() => setTablePage((page) => Math.min(page + 1, tableTotalPages))}
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      <Modal
        centered
        className="game-confirm-modal"
        show={Boolean(confirmAction)}
        onHide={closeConfirmAction}
      >
        <Modal.Header closeButton={!saving}>
          <div className="confirm-brand">
            <img src="/images/universo-geek-logo.png" alt="Universo Geek" />
            <div>
              <span>Confirmacion requerida</span>
              <Modal.Title>{confirmAction?.title}</Modal.Title>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body>
          <p>{confirmAction?.message}</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="button button-secondary"
            disabled={saving}
            type="button"
            onClick={closeConfirmAction}
          >
            Cancelar
          </button>
          <button
            className={`button ${confirmAction?.tone === 'danger' ? 'button-danger' : 'confirm-primary'}`}
            disabled={saving}
            type="button"
            onClick={handleConfirmAction}
          >
            {saving ? <Spinner animation="border" size="sm" /> : <FiCheckCircle aria-hidden="true" />}
            {confirmAction?.confirmLabel || 'Confirmar'}
          </button>
        </Modal.Footer>
      </Modal>
    </section>
  )
}

export default AdminProducts


