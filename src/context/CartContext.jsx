import { createContext, useContext, useMemo, useState } from 'react'

// Contexto global donde se guarda el carrito y sus acciones.
const CartContext = createContext()

// CartProvider envuelve la app y comparte el carrito con todos los componentes hijos.
export function CartProvider({ children }) {
  // Cada item del carrito guarda los datos del producto y una cantidad.
  const [cart, setCart] = useState([])

  // Agrega un producto. Si ya existe, suma cantidad en lugar de duplicar la card.
  const addToCart = (product, quantity = 1) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find((item) => item.id === product.id)

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }

      return [...currentCart, { ...product, quantity }]
    })
  }

  // Quita un producto completo del carrito usando su id.
  const removeFromCart = (productId) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId))
  }

  // Vacia el carrito y vuelve al estado inicial.
  const clearCart = () => {
    setCart([])
  }

  // totalItems alimenta el indicador numerico del CartWidget.
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  // totalPrice calcula el importe final de todos los productos agregados.
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )

  // useMemo evita recrear el objeto del contexto salvo cuando cambian sus datos.
  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      totalItems,
      totalPrice,
    }),
    [cart, totalItems, totalPrice],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Hook propio para consumir el carrito sin repetir useContext en cada componente.
export function useCart() {
  const context = useContext(CartContext)

  // Ayuda a detectar errores si algun componente usa el carrito fuera del Provider.
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }

  return context
}
