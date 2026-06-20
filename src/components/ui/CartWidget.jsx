import { FiShoppingCart } from 'react-icons/fi'
import { useCart } from '../../context/CartContext.jsx'

// CartWidget vive en la navbar y muestra la cantidad total de productos agregados.
function CartWidget() {
  const { totalItems } = useCart()

  return (
    <span className="cart-widget" aria-label={`Carrito con ${totalItems} items`}>
      <FiShoppingCart aria-hidden="true" />
      <span>Carrito</span>
      {/* totalItems se actualiza automaticamente al cambiar el CartContext. */}
      <strong>{totalItems}</strong>
    </span>
  )
}

export default CartWidget
