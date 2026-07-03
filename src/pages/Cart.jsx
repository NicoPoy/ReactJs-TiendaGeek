import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FiCheckCircle, FiPackage, FiShield, FiShoppingBag, FiTrash2, FiTruck } from 'react-icons/fi'
import Seo from '../components/seo/Seo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

// Cart muestra los productos agregados y permite quitarlos o vaciar el carrito.
// Esta ruta esta protegida desde App.jsx para que solo accedan usuarios logueados.
function Cart() {
  // useCart trae el estado global del carrito y sus acciones de edicion.
  const { cart, clearCart, removeFromCart, totalItems, totalPrice, updateCartQuantity } =
    useCart()
  // user aporta el email que se imprime en el comprobante simulado.
  const { user } = useAuth()
  // completedOrder guarda una copia congelada del pedido luego de comprar.
  const [completedOrder, setCompletedOrder] = useState(null)
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false)

  // handleFakePurchase arma un comprobante local, limpia el carrito y muestra agradecimiento.
  const handleFakePurchase = () => {
    // orderItems copia solo los datos necesarios para el resumen de la compra.
    const orderItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))

    // completedOrder simula la orden final sin escribir en una pasarela real.
    setCompletedOrder({
      id: `UG-${Date.now().toString().slice(-6)}`,
      createdAt: new Date(),
      customerEmail: user?.email || 'cliente@universogeek.com',
      items: orderItems,
      total: totalPrice,
    })
    clearCart()
  }

  if (completedOrder) {
    return (
      <section className="page-section">
        <Seo
          title="Compra realizada"
          description="Confirmacion de compra simulada en Universo Geek."
        />
        <div className="purchase-confirmation">
          <div className="purchase-confirmation-header">
            <div className="purchase-header-text">
              <div className="purchase-status">
                <FiCheckCircle aria-hidden="true" />
                <span className="eyebrow">Pedido confirmado</span>
              </div>
              <h1>Gracias por su compra</h1>
              <p>
                Recibimos tu pedido simulado y dejamos el detalle listo para revisar.
              </p>
            </div>
            <div className="purchase-header-logo">
              <img
                src="/images/universo-geek-logo.png"
                alt="Universo Geek Logo"
              />
            </div>
          </div>

          <dl className="purchase-info">
            <div>
              <dt>Orden</dt>
              <dd>{completedOrder.id}</dd>
            </div>
            <div>
              <dt>Cliente</dt>
              <dd>{completedOrder.customerEmail}</dd>
            </div>
            <div>
              <dt>Fecha</dt>
              <dd>{completedOrder.createdAt.toLocaleString('es-AR')}</dd>
            </div>
            <div>
              <dt>Pago</dt>
              <dd>Aprobado en modo simulacion</dd>
            </div>
          </dl>

          <div className="purchase-items" aria-label="Productos comprados">
            {completedOrder.items.map((item) => (
              <div className="purchase-item" key={item.id}>
                <span>
                  {item.quantity} x {item.name}
                </span>
                <strong>${item.subtotal.toLocaleString('es-AR')}</strong>
              </div>
            ))}
          </div>

          <div className="purchase-total">
            <span>Total abonado</span>
            <strong>${completedOrder.total.toLocaleString('es-AR')}</strong>
          </div>

          <div className="form-actions">
            <Link className="button" to="/productos">
              Seguir comprando
            </Link>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setCompletedOrder(null)}
            >
              Volver al carrito
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Si no hay items, se muestra un estado vacio con acceso al catalogo.
  if (cart.length === 0) {
    return (
      <section className="page-section compact-section">
        <Seo
          title="Carrito"
          description="Carrito de compras de Universo Geek."
        />
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
    <section className="page-section cart-page">
      <Seo title="Carrito" description="Productos agregados al carrito de compras." />
      <div className="cart-hero">
        <div className="cart-hero-content">
          <div className="section-heading">
            <span className="eyebrow">Carrito</span>
            <h1>Carrito de compras</h1>
            <p>
              Revisa tus artículos de colección, ajusta cantidades y confirma una compra simulada
              para cerrar el pedido.
            </p>
          </div>
          <div className="cart-hero-logo">
            <img src="/images/universo-geek-logo.png" alt="Universo Geek Logo" />
          </div>
        </div>
      </div>

      <div className="cart-checkout-layout">
        {/* Cada item del carrito se renderiza con cantidad y subtotal. */}
        <div className="cart-list" aria-label="Productos agregados">
          {cart.map((item) => (
            <article className="cart-item" key={item.id}>
              {/* Columna 1: Imagen del producto */}
              <div className="cart-item-media">
                <img src={item.image} alt={item.name} />
              </div>
              
              {/* Columna 2: Detalles del producto y controles */}
              <div className="cart-item-details">
                <span className="cart-item-category">{item.category}</span>
                <h2>{item.name}</h2>
                <div className="cart-item-meta">
                  <div className="cart-item-price-unit">
                    <span>Precio unitario:</span>
                    <strong>${item.price.toLocaleString('es-AR')}</strong>
                  </div>
                  <div className="quantity-control-container">
                    <span>Cantidad:</span>
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
                          updateCartQuantity(item.id, parseInt(event.target.value) || 1)
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
                  </div>
                </div>
                <span className="stock-badge">Stock disponible: {item.stock}</span>
              </div>
              
              {/* Columna 3: Subtotal y Boton Quitar */}
              <div className="cart-item-pricing-action">
                <div className="subtotal-box">
                  <span>Subtotal</span>
                  <strong>${(item.price * item.quantity).toLocaleString('es-AR')}</strong>
                </div>
                <button
                  className="cart-item-remove-btn"
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  title="Eliminar del carrito"
                  aria-label={`Quitar ${item.name} del carrito`}
                >
                  <FiTrash2 aria-hidden="true" />
                  <span>Quitar</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Resumen final del carrito con total y accion para vaciarlo. */}
        <aside className="cart-summary" aria-label="Resumen del pedido">
          <div className="cart-summary-heading">
            <FiPackage aria-hidden="true" />
            <div>
              <span>Pedido Universo Geek</span>
              <strong>Listo para simular</strong>
            </div>
          </div>
          <div className="cart-summary-lines">
            <div>
              <span>Productos</span>
              <strong>{totalItems}</strong>
            </div>
            <div>
              <span>Entrega</span>
              <strong>Digital demo</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>${totalPrice.toLocaleString('es-AR')}</strong>
            </div>
          </div>
          <div className="cart-summary-note">
            <FiTruck aria-hidden="true" />
            <span>Compra ficticia para la entrega final, sin cobro real.</span>
          </div>
          <button className="button" type="button" onClick={() => setShowPurchaseConfirm(true)}>
            Comprar
          </button>
          <button className="button button-secondary" type="button" onClick={clearCart}>
            Vaciar carrito
          </button>
        </aside>
      </div>

      <Modal
        centered
        className="game-confirm-modal cart-confirm-modal"
        show={showPurchaseConfirm}
        onHide={() => setShowPurchaseConfirm(false)}
      >
        <Modal.Header closeButton>
          <div className="confirm-brand">
            <img src="/images/universo-geek-logo.png" alt="Universo Geek" />
            <div>
              <span>Confirmacion de compra</span>
              <Modal.Title>Finalizar pedido</Modal.Title>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body>
          <p>
            Vas a confirmar {totalItems} producto(s) por ${totalPrice.toLocaleString('es-AR')}.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setShowPurchaseConfirm(false)}
          >
            Cancelar
          </button>
          <button
            className="button confirm-primary"
            type="button"
            onClick={() => {
              setShowPurchaseConfirm(false)
              handleFakePurchase()
            }}
          >
            <FiCheckCircle aria-hidden="true" />
            Confirmar compra
          </button>
        </Modal.Footer>
      </Modal>
    </section>
  )
}

export default Cart



