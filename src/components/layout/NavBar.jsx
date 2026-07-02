import { Link, NavLink } from 'react-router-dom'
import { FiLock, FiLogIn, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'
import CartWidget from '../ui/CartWidget.jsx'

// NavBar permite moverse entre las rutas principales sin recargar la pagina.
// Los links cambian segun el estado de autenticacion del usuario.
function NavBar() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <nav className="navbar">
      {/* Marca del sitio: vuelve al home y muestra el logo compacto. */}
      <Link className="brand" to="/">
        <img src="/images/universo-geek-logo.png" alt="" />
        <span>Universo Geek</span>
      </Link>

      {/* NavLink agrega la clase active automaticamente cuando coincide la ruta. */}
      <div className="nav-links">
        <NavLink to="/" end>
          Inicio
        </NavLink>
        <NavLink to="/productos">Productos</NavLink>
        {isAuthenticated ? (
          <>
            <NavLink to="/admin">
              <FiLock aria-hidden="true" />
              Panel
            </NavLink>
            <NavLink to="/carrito">
              {/* CartWidget muestra el icono y la cantidad total del carrito. */}
              <CartWidget />
            </NavLink>
            <button className="nav-action" type="button" onClick={logout}>
              <FiLogOut aria-hidden="true" />
              Salir
            </button>
          </>
        ) : (
          <NavLink to="/login">
            <FiLogIn aria-hidden="true" />
            Acceso
          </NavLink>
        )}
      </div>
    </nav>
  )
}

export default NavBar
