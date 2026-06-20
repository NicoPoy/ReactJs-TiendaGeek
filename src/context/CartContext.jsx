import { createContext, useContext, useMemo, useState } from 'react'

// CartContext centraliza el carrito para que detalle, navbar y carrito
// compartan la misma informacion sin pasar props manualmente.
// Contexto global donde se guarda el carrito y sus acciones.
const CartContext = createContext()

// CartProvider envuelve la app y comparte el carrito con todos los componentes hijos.
export function CartProvider({ children }) {
  // Cada item del carrito guarda los datos del producto y una cantidad.
  const [cart, setCart] = useState([])

  // Normaliza cantidades para evitar decimales, negativos o valores mayores al stock.
  const getSafeQuantity = (quantity, stock) => {
    // numericQuantity es la cantidad recibida convertida a numero.
    const numericQuantity = Number(quantity)
    // numericStock es el stock recibido convertido a numero.
    const numericStock = Number(stock)

    if (!Number.isFinite(numericQuantity) || !Number.isFinite(numericStock)) {
      return 1
    }

    // wholeQuantity evita decimales dentro del carrito.
    const wholeQuantity = Math.trunc(numericQuantity)
    // availableStock asegura que el stock nunca sea negativo.
    const availableStock = Math.max(Math.trunc(numericStock), 0)

    return Math.min(Math.max(wholeQuantity, 1), availableStock)
  }

  // Agrega un producto. Si ya existe, suma cantidad en lugar de duplicar la card.
  const addToCart = (product, quantity = 1) => {
    setCart((currentCart) => {
      // availableStock representa el stock disponible del producto a agregar.
      const availableStock = Number(product.stock)

      if (!Number.isFinite(availableStock) || availableStock <= 0) {
        return currentCart
      }

      // existingProduct indica si el producto ya esta dentro del carrito.
      const existingProduct = currentCart.find((item) => item.id === product.id)

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: getSafeQuantity(item.quantity + quantity, item.stock),
              }
            : item,
        )
      }

      return [...currentCart, { ...product, quantity: getSafeQuantity(quantity, product.stock) }]
    })
  }

  // Modifica la cantidad de un item existente respetando siempre el stock disponible.
  const updateCartQuantity = (productId, quantity) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: getSafeQuantity(quantity, item.stock) }
          : item,
      ),
    )
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
      updateCartQuantity,
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
  // context contiene el estado y acciones publicadas por CartProvider.
  const context = useContext(CartContext)

  // Ayuda a detectar errores si algun componente usa el carrito fuera del Provider.
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }

  return context
}
