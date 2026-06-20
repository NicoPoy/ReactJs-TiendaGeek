import { useEffect, useMemo, useState } from 'react'
import { Alert, Form, Modal, Spinner, Table } from 'react-bootstrap'
import { FiEdit3, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import styled from 'styled-components'
import Seo from '../components/seo/Seo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  createProduct,
  deleteProduct,
  getProducts,
  seedProductsFromJson,
  updateProduct,
} from '../services/productService.js'

const categories = ['Perifericos', 'Setup', 'Rol', 'Coleccion']

const initialFormData = {
  name: '',
  category: 'Perifericos',
  price: '',
  stock: '',
  image: '',
  description: '',
  details: '',
}

const AdminToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 20px;
`

function AdminProducts() {
  const { isFirebaseConfigured, logout, user } = useAuth()
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState(initialFormData)
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

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const loadedProducts = await getProducts()
      setProducts(loadedProducts)
    } catch {
      setError('No se pudieron cargar los productos.')
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
    setFormData(initialFormData)
    setEditingProductId(null)
  }

  const validateForm = () => {
    if (!formData.name.trim()) return 'El nombre es obligatorio.'
    if (!formData.image.trim()) return 'La URL o ruta de imagen es obligatoria.'
    if (!formData.description.trim()) return 'La descripción corta es obligatoria.'
    if (!formData.details.trim()) return 'El detalle del producto es obligatorio.'
    if (Number(formData.price) <= 0) return 'El precio debe ser mayor a 0.'
    if (Number(formData.stock) < 0) return 'El stock no puede ser negativo.'
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

    const payload = {
      ...formData,
      name: formData.name.trim(),
      image: formData.image.trim(),
      description: formData.description.trim(),
      details: formData.details.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
    }

    try {
      setSaving(true)
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
      setError('No se pudo guardar el producto.')
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
      setProducts(seededProducts)
      setSuccess('Catálogo inicial cargado correctamente.')
    } catch {
      setError('No se pudo cargar el catálogo inicial.')
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
      <div className="section-heading">
        <span className="eyebrow">Panel privado</span>
        <h1>Gestión de productos</h1>
        <p>Sesión activa: {user?.email}</p>
      </div>

      {!isFirebaseConfigured && (
        <Alert variant="warning">
          Modo demo local activo. Cuando configures Firebase, este panel usará
          Authentication y Firestore.
        </Alert>
      )}

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <AdminToolbar>
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
        <button className="button button-secondary" type="button" onClick={logout}>
          Cerrar sesión
        </button>
      </AdminToolbar>

      <Form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <Form.Group controlId="name">
            <Form.Label>Nombre</Form.Label>
            <Form.Control name="name" value={formData.name} onChange={handleChange} />
          </Form.Group>

          <Form.Group controlId="category">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
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

        <Form.Group className="mt-3" controlId="image">
          <Form.Label>Imagen</Form.Label>
          <Form.Control
            name="image"
            placeholder="/images/producto.jpg"
            value={formData.image}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mt-3" controlId="description">
          <Form.Label>Descripción corta</Form.Label>
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
              Cancelar edición
            </button>
          )}
        </div>
      </Form>

      <div className="admin-table-wrap">
        {loading ? (
          <p className="status-message">Cargando productos...</p>
        ) : (
          <Table responsive bordered hover variant="dark">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
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
          ¿Confirmás que querés eliminar "{productToDelete?.name}"?
        </Modal.Body>
        <Modal.Footer>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setProductToDelete(null)}
          >
            Cancelar
          </button>
          <button className="button button-danger" disabled={saving} type="button" onClick={handleDelete}>
            Eliminar
          </button>
        </Modal.Footer>
      </Modal>
    </section>
  )
}

export default AdminProducts
