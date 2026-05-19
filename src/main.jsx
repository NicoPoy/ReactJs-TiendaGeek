import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import App from './App.jsx'
import './styles/global.css'

// Punto de entrada de React: conecta la aplicacion con el div #root de index.html.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter habilita la navegacion por rutas del lado del cliente. */}
    <BrowserRouter>
      {/* CartProvider deja disponible el estado global del carrito en toda la app. */}
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
