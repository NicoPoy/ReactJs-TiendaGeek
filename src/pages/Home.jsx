import { Link } from 'react-router-dom'
import Seo from '../components/seo/Seo.jsx'

// Home es la pantalla inicial.
// Presenta la identidad de Universo Geek y deriva al usuario hacia el catalogo.
function Home() {
  return (
    <section className="hero">
      <Seo
        title="Inicio"
        description="Ecommerce geek con figuras de coleccion, accesorios gamer, productos de rol y objetos de setup."
      />
      <div className="hero-content">
        <span className="eyebrow">Bienvenido</span>
        {/* Logo principal creado para darle identidad a Universo Geek. */}
        <img
          className="hero-logo"
          src="/images/universo-geek-logo.png"
          alt="Universo Geek"
        />
        <h1 className="sr-only">Universo Geek</h1>
        <p>
          Figuras de coleccion, accesorios gamer, productos para rol y objetos
          de setup para darle identidad a tu espacio geek.
        </p>
        {/* Link interno: navega sin recargar la pagina gracias a react-router-dom. */}
        <Link className="button" to="/productos">
          Ver productos
        </Link>
      </div>
    </section>
  )
}

export default Home
