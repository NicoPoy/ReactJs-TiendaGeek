import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

// ItemDetailContainer muestra la vista individual de un producto.
// Usa el parametro :id de la ruta /producto/:id para buscar el item correcto.
function ItemDetailContainer() {
  // useParams lee valores dinamicos de la URL definidos en App.jsx.
  const { id } = useParams()
  // addToCart viene del contexto global del carrito.
  const { addToCart } = useCart()
  // product guarda el producto encontrado en productos.json.
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Cada vez que cambia el id, se vuelve a buscar el producto correspondiente.
  useEffect(() => {
    fetch('/productos.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('No se pudo cargar el producto')
        }

        return response.json()
      })
      .then((data) => {
        // Los ids del JSON son numericos, por eso se convierte el parametro de URL.
        const selectedProduct = data.find((item) => item.id === Number(id))

        if (!selectedProduct) {
          throw new Error('El producto no existe')
        }

        setProduct(selectedProduct)
      })
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false))
  }, [id])

  // Estado visual mientras se carga el detalle.
  if (loading) {
    return <p className="status-message">Cargando detalle...</p>
  }

  // Si el producto no existe o falla la carga, se permite volver al catalogo.
  if (error) {
    return (
      <section className="page-section compact-section">
        <p className="status-message">{error}</p>
        <Link className="button button-secondary" to="/productos">
          Volver al catalogo
        </Link>
      </section>
    )
  }

  return (
    <section className="detail-layout">
      {/* Imagen principal del producto seleccionado. */}
      <img src={product.image} alt={product.name} />
      <article className="detail-content">
        <span className="eyebrow">{product.category}</span>
        <h1>{product.name}</h1>
        <p>{product.details}</p>
        <p className="stock">Stock disponible: {product.stock}</p>
        <strong className="detail-price">
          ${product.price.toLocaleString('es-AR')}
        </strong>
        <div className="detail-actions">
          {/* Al hacer click se suma el producto al carrito global. */}
          <button className="button" type="button" onClick={() => addToCart(product)}>
            Agregar al carrito
          </button>
          {/* Navegacion de regreso sin recarga completa de pagina. */}
          <Link className="button button-secondary" to="/productos">
            Seguir comprando
          </Link>
        </div>
      </article>
    </section>
  )
}

export default ItemDetailContainer
