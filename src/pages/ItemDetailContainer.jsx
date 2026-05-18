import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

function ItemDetailContainer() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/productos.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('No se pudo cargar el producto')
        }

        return response.json()
      })
      .then((data) => {
        const selectedProduct = data.find((item) => item.id === Number(id))

        if (!selectedProduct) {
          throw new Error('El producto no existe')
        }

        setProduct(selectedProduct)
      })
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <p className="status-message">Cargando detalle...</p>
  }

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
          <button className="button" type="button" onClick={() => addToCart(product)}>
            Agregar al carrito
          </button>
          <Link className="button button-secondary" to="/productos">
            Seguir comprando
          </Link>
        </div>
      </article>
    </section>
  )
}

export default ItemDetailContainer
