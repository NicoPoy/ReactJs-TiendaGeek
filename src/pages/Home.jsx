import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="eyebrow">Tienda geek</span>
        <h1>Universo Geek</h1>
        <p>
          Accesorios gamer, perifericos, objetos de setup y dados RPG para
          armar un escritorio con identidad propia.
        </p>
        <Link className="button" to="/productos">
          Ver productos
        </Link>
      </div>
    </section>
  )
}

export default Home
