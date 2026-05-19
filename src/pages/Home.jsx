import { Link } from 'react-router-dom'

// Home es la pantalla inicial. Presenta el logo y un acceso al catalogo.
function Home() {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="eyebrow">Bienvenido</span>
        {/* Logo principal creado para darle identidad a Universo Geek. */}
        <img
          className="hero-logo"
          src="/images/universo-geek-logo.png"
          alt="Universo Geek"
        />
        {/* Titulo */}
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
