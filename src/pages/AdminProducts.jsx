import { useEffect, useMemo, useState } from 'react'
import { Alert, Form, Modal, Spinner, Table } from 'react-bootstrap'
import {
  FiDatabase,
  FiEdit3,
  FiFolderPlus,
  FiImage,
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
const maxImageSizeLabel = `${maxProductImageSize / 1024 / 1024} MB`

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
  const { isFirebaseConfigured, logout, user } = useAuth()
  const [products, setProducts] = useState([])
  const [productCategories, setProductCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [formData, setFormData] = useState(initialFormData)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageUploadError, setImageUploadError] = useState('')
  const [editingProductId, setEditingProductId] = useState(null)
  const [productToDelete, setProductToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isEditing = Boolean(editingProductId)

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  )

  const totalStock = useMemo(
    () => products.reduce((total, product) => total + product.stock, 0),
    [products],
  )

  const inventoryValue = useMemo(
    () =>
      products.reduce(
        (total, product) => total + product.price * product.stock,
        0,
      ),
    [products],
  )

  const productsByCategory = useMemo(
    () =>
      products.reduce((summary, product) => {
        summary[product.category] = (summary[product.category] ?? 0) + 1
        return summary
      }, {}),
    [products],
  )

  const categoryCount = productCategories.length

  useEffect(
    () => () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    },
    [imagePreview],
  )

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const [loadedProducts, loadedCategories] = await Promise.all([
        getProducts(),
        getProductCategories(),
      ])
      setProducts(loadedProducts)
      setProductCategories(loadedCategories)
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

  useEffect(() => {
    loadProducts()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      ...initialFormData,
      category: productCategories[0]?.name || '',
    })
    setImageFile(null)
    setImagePreview('')
    setImageUploadError('')
    setEditingProductId(null)
  }

  const handleImageChange = (event) => {
    const selectedFile = event.target.files?.[0]
    setImageUploadError('')
    setError('')

    if (!selectedFile) {
      setImageFile(null)
      setImagePreview(formData.image)
      return
    }

    if (!acceptedProductImageTypes.includes(selectedFile.type)) {
      setImageFile(null)
      setImageUploadError('La imagen debe ser JPG, PNG o WEBP.')
      event.target.value = ''
      return
    }

    if (selectedFile.size > maxProductImageSize) {
      setImageFile(null)
      setImageUploadError(`La imagen no puede superar ${maxImageSizeLabel}.`)
      event.target.value = ''
      return
    }

    setImageFile(selectedFile)
    setImagePreview(URL.createObjectURL(selectedFile))
  }

  const handleAddCategory = async (event) => {
    event.preventDefault()
    const normalizedName = newCategoryName.trim()
    setError('')
    setSuccess('')

    if (!normalizedName) {
      setError('Ingresa un nombre de categoria.')
      return
    }

    const categoryExists = productCategories.some(
      (category) => category.name.toLowerCase() === normalizedName.toLowerCase(),
    )

    if (categoryExists) {
      setError('Esa categoria ya existe.')
      return
    }

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
  }

  const handleDeleteCategory = async (category) => {
    const productsInCategory = productsByCategory[category.name] ?? 0
    setError('')
    setSuccess('')

    if (productsInCategory > 0) {
      setError(`No podes eliminar "${category.name}" porque tiene ${productsInCategory} producto(s).`)
      return
    }

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
  }

  // Validaciones minimas pedidas para evitar productos incompletos.
  const validateForm = () => {
    if (!formData.name.trim()) return 'El nombre es obligatorio.'
    if (!formData.category) return 'Agrega o selecciona una categoria.'
    if (!imageFile && !formData.image.trim()) return 'Selecciona una imagen del producto.'
    if (!formData.description.trim()) return 'La descripcion corta es obligatoria.'
    if (!formData.details.trim()) return 'El detalle del producto es obligatorio.'
    if (Number(formData.price) <= 0) return 'El precio debe ser mayor a 0.'
    if (Number(formData.stock) < 0) return 'El stock no puede ser negativo.'
    if (imageUploadError) return imageUploadError
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSaving(true)
      const imageUrl = imageFile
        ? await uploadProductImage(imageFile)
        : formData.image.trim()

      const payload = {
        ...formData,
        name: formData.name.trim(),
        image: imageUrl,
        description: formData.description.trim(),
        details: formData.details.trim(),
        price: Number(formData.price),
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
        setSuccess('Producto agregado correctamente.')
      }
      resetForm()
    } catch {
      setError('No se pudo guardar el producto. Revisa la imagen y la conexion con Firebase.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProductId(product.id)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.image,
      description: product.description,
      details: product.details,
    })
    setImageFile(null)
    setImagePreview(product.image)
    setImageUploadError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      setSaving(true)
      await deleteProduct(productToDelete.id)
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productToDelete.id),
      )
      setSuccess('Producto eliminado correctamente.')
      setProductToDelete(null)
    } catch {
      setError('No se pudo eliminar el producto.')
    } finally {
      setSaving(false)
    }
  }

  const handleSeed = async () => {
    try {
      setSaving(true)
      setError('')
      const seededProducts = await seedProductsFromJson()
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
            Administra el catalogo conectado a Firestore, controla stock y mantené
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
        <Alert variant="warning">
          Firebase no esta configurado. Este panel requiere Authentication,
          Firestore y Storage reales.
        </Alert>
      )}

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

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
            <Form.Label>Nueva categoria</Form.Label>
            <Form.Control
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
        <div className="toolbar-actions">
          <button className="button button-secondary" type="button" onClick={loadProducts}>
            <FiRefreshCw aria-hidden="true" />
            Actualizar
          </button>
          <button
            className="button button-secondary"
            disabled={saving}
            type="button"
            onClick={handleSeed}
          >
            <FiPlus aria-hidden="true" />
            Cargar JSON inicial
          </button>
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
            <Form.Label>Nombre</Form.Label>
            <Form.Control name="name" value={formData.name} onChange={handleChange} />
          </Form.Group>

          <Form.Group controlId="category">
            <Form.Label>Categoria</Form.Label>
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
            <Form.Label>Precio</Form.Label>
            <Form.Control
              min="1"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="stock">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              min="0"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
            />
          </Form.Group>
        </div>

        <Form.Group className="mt-3" controlId="product-image">
          <Form.Label>Imagen</Form.Label>
          <div className="image-upload-box">
            <label className="image-upload-drop" htmlFor="product-image-input">
              <FiImage aria-hidden="true" />
              <strong>Elegir imagen desde tu computadora</strong>
              <span>JPG, PNG o WEBP. Maximo {maxImageSizeLabel}.</span>
              {imageFile && <small>{imageFile.name}</small>}
            </label>
            <input
              accept={acceptedProductImageTypes.join(',')}
              className="image-file-input"
              id="product-image-input"
              type="file"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Vista previa del producto" />
                <span>{imageFile ? 'Vista previa' : 'Imagen actual'}</span>
              </div>
            )}
          </div>
          {imageUploadError && <p className="form-error">{imageUploadError}</p>}
        </Form.Group>

        <Form.Group className="mt-3" controlId="description">
          <Form.Label>Descripcion corta</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mt-3" controlId="details">
          <Form.Label>Detalle</Form.Label>
          <Form.Control
            as="textarea"
            name="details"
            rows={3}
            value={formData.details}
            onChange={handleChange}
          />
        </Form.Group>

        <div className="form-actions">
          <button className="button" disabled={saving} type="submit">
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
          <span className="eyebrow">Firestore</span>
          <h2>Productos publicados</h2>
        </div>
        <p>{sortedProducts.length} productos ordenados alfabeticamente</p>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <p className="status-message">Cargando productos...</p>
        ) : (
          <Table responsive bordered hover variant="dark">
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
              {sortedProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>${product.price.toLocaleString('es-AR')}</td>
                  <td>{product.stock}</td>
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
                        onClick={() => setProductToDelete(product)}
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

      <Modal
        centered
        show={Boolean(productToDelete)}
        onHide={() => setProductToDelete(null)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Eliminar producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Confirmas que queres eliminar "{productToDelete?.name}"?
        </Modal.Body>
        <Modal.Footer>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setProductToDelete(null)}
          >
            Cancelar
          </button>
          <button
            className="button button-danger"
            disabled={saving}
            type="button"
            onClick={handleDelete}
          >
            Eliminar
          </button>
        </Modal.Footer>
      </Modal>
    </section>
  )
}

export default AdminProducts
