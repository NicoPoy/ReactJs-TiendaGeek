import { Outlet } from 'react-router-dom'
import Footer from './Footer.jsx'
import Header from './Header.jsx'

// Layout define la estructura comun de todas las paginas.
// El contenido variable entra en Outlet segun la ruta activa.
// Esto evita repetir Header/Footer en cada page.
function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        {/* Outlet renderiza Home, catalogo, detalle, carrito o 404. */}
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
