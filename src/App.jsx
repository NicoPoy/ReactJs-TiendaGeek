import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import ItemListContainer from './pages/ItemListContainer.jsx'
import ItemDetailContainer from './pages/ItemDetailContainer.jsx'
import Cart from './pages/Cart.jsx'
import Login from './pages/Login.jsx'
import AdminProducts from './pages/AdminProducts.jsx'
import NotFound from './pages/NotFound.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

// App define el mapa principal de rutas de la aplicacion.
// Todas las rutas viven dentro de Layout para compartir Header, NavBar y Footer.
// Las rutas privadas se envuelven con ProtectedRoute para exigir login.
function App() {
  // Routes contiene todo el enrutado cliente manejado por react-router-dom.
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Pagina de bienvenida. */}
        <Route index element={<Home />} />
        {/* Catalogo general con filtros por categoria. */}
        <Route path="productos" element={<ItemListContainer />} />
        {/* Detalle de un producto usando el id recibido por URL. */}
        <Route path="producto/:id" element={<ItemDetailContainer />} />
        {/* Vista del carrito consumiendo CartContext. */}
        <Route
          path="carrito"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<Login />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        {/* Ruta comodin para cualquier URL inexistente. */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
