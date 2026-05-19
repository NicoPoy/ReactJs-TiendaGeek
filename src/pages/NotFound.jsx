import { Link } from 'react-router-dom'

// Pagina de respaldo para cualquier ruta que no exista en la aplicacion.
function NotFound() {
  return (
    <section className="page-section compact-section">
      <div className="section-heading">
        <span className="eyebrow">404</span>
        <h1>Pagina no encontrada</h1>
        <p>La ruta que intentaste abrir no existe.</p>
      </div>
      {/* Permite volver a una ruta valida sin recargar el sitio completo. */}
      <Link className="button" to="/">
        Volver al inicio
      </Link>
    </section>
  )
}

export default NotFound
