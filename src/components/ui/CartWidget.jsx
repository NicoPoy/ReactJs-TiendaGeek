import { useCart } from '../../context/CartContext.jsx'

// CartWidget vive en la navbar y muestra la cantidad total de productos agregados.
function CartWidget() {
  const { totalItems } = useCart()

  return (
    <span className="cart-widget" aria-label={`Carrito con ${totalItems} items`}>
      {/* SVG propio del carrito. aria-hidden evita duplicar informacion para lectores. */}
      <svg
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h8.9a2 2 0 0 0 2-1.58L21 7H5.12" />
      </svg>
      <span>Carrito</span>
      {/* totalItems se actualiza automaticamente al cambiar el CartContext. */}
      <strong>{totalItems}</strong>
    </span>
  )
}

export default CartWidget
