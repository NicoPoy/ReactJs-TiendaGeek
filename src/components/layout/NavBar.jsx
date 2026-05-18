import { Link, NavLink } from 'react-router-dom'
import CartWidget from '../ui/CartWidget.jsx'

function NavBar() {
  return (
    <nav className="navbar">
      <Link className="brand" to="/">
        <img src="/images/universo-geek-logo.png" alt="" />
        <span>Universo Geek</span>
      </Link>

      <div className="nav-links">
        <NavLink to="/" end>
          Inicio
        </NavLink>
        <NavLink to="/productos">Productos</NavLink>
        <NavLink to="/carrito">
          <CartWidget />
        </NavLink>
      </div>
    </nav>
  )
}

export default NavBar
