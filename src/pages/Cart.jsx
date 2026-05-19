import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

// Cart muestra los productos agregados y permite quitarlos o vaciar el carrito.
function Cart() {
  const { cart, clearCart, removeFromCart, totalPrice, updateCartQuantity } =
    useCart()

  // Si no hay items, se muestra un estado vacio con acceso al catalogo.
  if (cart.length === 0) {
    return (
      <section className="page-section compact-section">
        <div className="section-heading">
          <span className="eyebrow">Carrito</span>
          <h1>Tu carrito esta vacio</h1>
          <p>Agrega algun producto desde el catalogo para verlo aca.</p>
        </div>
        <Link className="button" to="/productos">
          Ir al catalogo
        </Link>
      </section>
    )
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <span className="eyebrow">Carrito</span>
        <h1>Productos agregados</h1>
      </div>

      {/* Cada item del carrito se renderiza con cantidad y subtotal. */}
      <div className="cart-list">
        {cart.map((item) => (
          <article className="cart-item" key={item.id}>
            <img src={item.image} alt={item.name} />
            <div className="cart-item-info">
              <h2>{item.name}</h2>
              {/* Controles para modificar cantidad sin superar el stock disponible. */}
              <div className="quantity-control" aria-label={`Cantidad de ${item.name}`}>
                <button
                  type="button"
                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <input
                  min="1"
                  max={item.stock}
                  type="number"
                  value={item.quantity}
                  onChange={(event) =>
                    updateCartQuantity(item.id, event.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                >
                  +
                </button>
              </div>
              <p>Stock disponible: {item.stock}</p>
              <strong>
                ${(item.price * item.quantity).toLocaleString('es-AR')}
              </strong>
            </div>
            {/* Quita este producto completo del carrito. */}
            <button
              className="button button-secondary"
              type="button"
              onClick={() => removeFromCart(item.id)}
            >
              Quitar
            </button>
          </article>
        ))}
      </div>

      {/* Resumen final del carrito con total y accion para vaciarlo. */}
      <div className="cart-summary">
        <strong>Total: ${totalPrice.toLocaleString('es-AR')}</strong>
        <button className="button button-secondary" type="button" onClick={clearCart}>
          Vaciar carrito
        </button>
      </div>
    </section>
  )
}

export default Cart
