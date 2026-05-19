import { Link, NavLink } from 'react-router-dom'
import CartWidget from '../ui/CartWidget.jsx'

// NavBar permite moverse entre las rutas principales sin recargar la pagina.
function NavBar() {
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
        <NavLink to="/carrito">
          {/* CartWidget muestra el icono y la cantidad total del carrito. */}
          <CartWidget />
        </NavLink>
      </div>
    </nav>
  )
}

export default NavBar
