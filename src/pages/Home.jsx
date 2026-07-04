import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiTruck, FiShield, FiAward, FiUsers, FiChevronLeft, FiChevronRight, FiChevronDown } from 'react-icons/fi'
import Seo from '../components/seo/Seo.jsx'
import { getProducts } from '../services/productService.js'
import Item from '../components/products/Item.jsx'

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  // isMobile determina si el viewport es movil para adaptar el carrusel de novedades.
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)')
    const listener = (e) => {
      setIsMobile(e.matches)
      setCurrentIndex(0) // Reiniciamos el índice al cambiar de tamaño
    }
    setIsMobile(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  useEffect(() => {
    getProducts()
      .then((data) => {
        // Ordenamos por fecha de creación de manera descendente (los más nuevos primero) y limitamos a 6
        const sorted = [...data].sort((a, b) => (b.createdAtTime ?? 0) - (a.createdAtTime ?? 0))
        setFeaturedProducts(sorted.slice(0, 6))
      })
      .catch((err) => {
        console.error('Error al cargar productos destacados:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const nextProducts = () => {
    // step define el paso del carrusel: 1 elemento en movil, 3 en pantallas grandes.
    const step = isMobile ? 1 : 3
    if (currentIndex + step < featuredProducts.length) {
      setCurrentIndex((prev) => prev + step)
    } else {
      // Volvemos al inicio si no hay más
      setCurrentIndex(0)
    }
  }

  const prevProducts = () => {
    // step define el paso del carrusel: 1 elemento en movil, 3 en pantallas grandes.
    const step = isMobile ? 1 : 3
    if (currentIndex - step >= 0) {
      setCurrentIndex((prev) => prev - step)
    } else {
      if (isMobile) {
        setCurrentIndex(featuredProducts.length - 1)
      } else {
        // Ir a la última tanda de 3
        const remainder = featuredProducts.length % 3
        const lastIndex = remainder === 0 
          ? featuredProducts.length - 3 
          : featuredProducts.length - remainder
        setCurrentIndex(lastIndex >= 0 ? lastIndex : 0)
      }
    }
  }

  const scrollToFeatures = () => {
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Seo
        title="Inicio"
        description="Ecommerce geek con figuras de coleccion, accesorios gamer, productos de rol y objetos de setup."
      />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="eyebrow">Bienvenido a Universo Geek</span>
            <h1>Tu espacio ideal, tu propio estilo</h1>
            <p>
              Explorá las mejores figuras oficiales de tus sagas favoritas, periféricos de alto rendimiento y accesorios exclusivos para armar tu rincón ideal.
            </p>
            <Link className="button button-glow" to="/productos">
              Explorar Catálogo
            </Link>
          </div>
          <div className="hero-media-wrapper">
            <img
              className="hero-logo-glowing"
              src="/images/universo-geek-logo.png"
              alt="Universo Geek Logo"
            />
          </div>
        </div>
        <button onClick={scrollToFeatures} className="scroll-down-btn" aria-label="Ver contenido de abajo">
          <FiChevronDown />
        </button>
      </section>

      {/* Características / Beneficios */}
      <section id="features-section" className="home-section">
        <div className="section-header">
          <h2>¿Por qué Universo Geek?</h2>
          <p>Ofrecemos la mejor experiencia para coleccionistas y entusiastas del gaming.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FiTruck aria-hidden="true" />
            </div>
            <h3>Envíos a todo el país</h3>
            <p>Embalajes súper protegidos para que tus figuras y periféricos lleguen impecables.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FiShield aria-hidden="true" />
            </div>
            <h3>Pago 100% Seguro</h3>
            <p>Múltiples opciones de pago con encriptación para resguardar tus datos.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FiAward aria-hidden="true" />
            </div>
            <h3>Calidad Premium</h3>
            <p>Garantía de originalidad en todas nuestras figuras y accesorios.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FiUsers aria-hidden="true" />
            </div>
            <h3>Comunidad Activa</h3>
            <p>Sumate a nuestro Discord y compartí fotos de tu setup con otros fanáticos.</p>
          </div>
        </div>
      </section>

      {/* Productos Destacados en Carrusel */}
      <section className="home-section">
        <div className="section-header-carousel">
          <div className="section-header-text">
            <h2>Novedades Destacadas</h2>
            <p>Descubrí los últimos lanzamientos agregados a nuestra tienda.</p>
          </div>
          {!loading && featuredProducts.length > (isMobile ? 1 : 3) && (
            <div className="carousel-controls">
              <button onClick={prevProducts} className="carousel-control-btn" aria-label="Productos anteriores">
                <FiChevronLeft />
              </button>
              <button onClick={nextProducts} className="carousel-control-btn" aria-label="Siguientes productos">
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="featured-products-skeleton">
            <div className="skeleton-card" aria-hidden="true"></div>
            <div className="skeleton-card" aria-hidden="true"></div>
            <div className="skeleton-card" aria-hidden="true"></div>
          </div>
        ) : (
          <div className="featured-products-grid-wrapper">
            <div className="featured-products-grid">
              {featuredProducts.slice(currentIndex, currentIndex + (isMobile ? 1 : 3)).map((product) => (
                <Item key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Newsletter / Comunidad */}
      <section className="home-section">
        <div className="newsletter-card">
          <div className="newsletter-content">
            <h2>Unite a la Resistencia</h2>
            <p>Dejanos tu email y sé el primero en enterarte de las preventas exclusivas, ofertas flash y lanzamientos limitados.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Tu email geek..."
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn">
                Suscribirme
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
