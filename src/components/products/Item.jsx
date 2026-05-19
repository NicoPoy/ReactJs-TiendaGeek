import { Link } from 'react-router-dom'

// Item representa una card individual del catalogo.
// Recibe todos los datos desde props para poder reutilizarse con cualquier producto.
function Item({ product }) {
  return (
    <article className="product-card">
      {/* Imagen local del producto, definida en public/productos.json. */}
      <img src={product.image} alt={product.name} />
      <div className="product-card-content">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-card-footer">
          {/* toLocaleString formatea el precio con separador usado en Argentina. */}
          <strong>${product.price.toLocaleString('es-AR')}</strong>
          {/* Link a la ruta dinamica de detalle del producto. */}
          <Link className="button button-secondary" to={`/producto/${product.id}`}>
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  )
}

export default Item
