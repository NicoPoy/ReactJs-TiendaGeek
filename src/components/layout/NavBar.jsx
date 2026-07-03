import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FiLock, FiLogIn, FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'
import CartWidget from '../ui/CartWidget.jsx'

// NavBar permite moverse entre las rutas principales sin recargar la pagina.
// Los links cambian segun el estado de autenticacion del usuario.
function NavBar() {
  // isAdmin decide si se muestra el panel; isAuthenticated alterna acceso/carrito/salida.
  const { isAdmin, isAuthenticated, logout } = useAuth()
  // isMenuOpen controla el menu hamburguesa en pantallas chicas.
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // closeMenu se reutiliza en links y logout para cerrar el panel mobile al navegar.
  const closeMenu = () => setIsMenuOpen(false)
  // toggleMenu abre/cierra la navegacion mobile desde el boton hamburguesa.
  const toggleMenu = () => setIsMenuOpen((currentValue) => !currentValue)

  const handleLogout = () => {
    closeMenu()
    logout()
  }

  return (
    <nav className="navbar">
      {/* Marca del sitio: vuelve al home y muestra el logo compacto. */}
      <Link className="brand" to="/" onClick={closeMenu}>
        <img src="/images/universo-geek-logo.png" alt="" />
        <span>Universo Geek</span>
      </Link>

      <button
        className="menu-toggle"
        type="button"
        aria-controls="primary-navigation"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
        onClick={toggleMenu}
      >
        {isMenuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
      </button>

      {/* NavLink agrega la clase active automaticamente cuando coincide la ruta. */}
      <div
        className={`nav-links ${isMenuOpen ? 'nav-links-open' : ''}`}
        id="primary-navigation"
      >
        <NavLink to="/" end onClick={closeMenu}>
          Inicio
        </NavLink>
        <NavLink to="/productos" onClick={closeMenu}>Productos</NavLink>
        {isAuthenticated ? (
          <>
            {isAdmin && (
              <NavLink to="/admin" onClick={closeMenu}>
                <FiLock aria-hidden="true" />
                Dashboard
              </NavLink>
            )}
            <NavLink to="/carrito" onClick={closeMenu}>
              {/* CartWidget muestra el icono y la cantidad total del carrito. */}
              <CartWidget />
            </NavLink>
            <button className="nav-action" type="button" onClick={handleLogout}>
              <FiLogOut aria-hidden="true" />
              Salir
            </button>
          </>
        ) : (
          <NavLink to="/login" onClick={closeMenu}>
            <FiLogIn aria-hidden="true" />
            Acceso
          </NavLink>
        )}
      </div>
    </nav>
  )
}

export default NavBar
