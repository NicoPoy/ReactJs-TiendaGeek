import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Seo from '../components/seo/Seo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { getProductById } from '../services/productService.js'

// ItemDetailContainer muestra la vista individual de un producto.
// Usa el parametro :id de la ruta /producto/:id para buscar el item correcto.
// Si el usuario no esta logueado, ofrece iniciar sesion en lugar de comprar.
function ItemDetailContainer() {
  // useParams lee valores dinamicos de la URL definidos en App.jsx.
  const { id } = useParams()
  // isAuthenticated decide si se muestra comprar o iniciar sesion.
  const { isAuthenticated } = useAuth()
  // addToCart viene del contexto global del carrito.
  const { addToCart } = useCart()
  // product guarda el producto encontrado en Firestore.
  const [product, setProduct] = useState(null)
  // loading muestra un estado transitorio mientras se lee Firestore.
  const [loading, setLoading] = useState(true)
  // error guarda problemas de busqueda o productos inexistentes.
  const [error, setError] = useState('')

  // Cada vez que cambia el id, se vuelve a buscar el producto correspondiente.
  useEffect(() => {
    setLoading(true)
    getProductById(id)
      .then((selectedProduct) => {
        // selectedProduct llega null si Firestore no tiene ese id.
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
        <Seo
          title="Producto no encontrado"
          description="El producto solicitado no existe en Universo Geek."
        />
        <p className="status-message">{error}</p>
        <Link className="button button-secondary" to="/productos">
          Volver al catalogo
        </Link>
      </section>
    )
  }

  return (
    <section className="detail-layout">
      <Seo title={product.name} description={product.description} />
      {/* Imagen principal del producto seleccionado. */}
      <div className="detail-media">
        <img src={product.image} alt={product.name} />
        <img
          className="product-brand-mark detail-brand-mark"
          src="/images/universo-geek-logo.png"
          alt=""
          aria-hidden="true"
        />
      </div>
      <article className="detail-content">
        <span className="eyebrow">{product.category}</span>
        <h1>{product.name}</h1>
        <p>{product.details}</p>
        <p className="stock">Stock disponible: {product.stock}</p>
        <strong className="detail-price">
          ${product.price.toLocaleString('es-AR')}
        </strong>
        <div className="detail-actions">
          {isAuthenticated ? (
            // Al hacer click se suma el producto al carrito global.
            <button className="button" type="button" onClick={() => addToCart(product)}>
              Agregar al carrito
            </button>
          ) : (
            <Link className="button" to="/login">
              Iniciar sesion para comprar
            </Link>
          )}
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

