import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="eyebrow">Bienvenido</span>
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
        <Link className="button" to="/productos">
          Ver productos
        </Link>
      </div>
    </section>
  )
}

export default Home
