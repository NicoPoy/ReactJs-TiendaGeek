import { Link } from 'react-router-dom'

function Item({ product }) {
  return (
    <article className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="product-card-content">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-card-footer">
          <strong>${product.price.toLocaleString('es-AR')}</strong>
          <Link className="button button-secondary" to={`/producto/${product.id}`}>
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  )
}

export default Item
