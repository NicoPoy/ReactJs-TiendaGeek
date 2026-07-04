import { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

// Footer concentra datos institucionales y tarjetas del equipo.
// Nicolas tiene un modal "Sobre mi"; las otras tarjetas muestran el boton deshabilitado.
// Datos de las tarjetas del footer.
// Se mantienen en un array para renderizar las 3 personas con map.
const team = [
  {
    name: 'Nicolas',
    role: 'Atencion personalizada',
    email: 'nicolaspoy98@gmail.com',
    image: '/images/perfil-nicolas.png',
    linkedin: 'https://www.linkedin.com/in/nicolas-poy-peters/',
    github: 'https://github.com/NicoPoy',
    technologies: 'React, Vite, Router, Context API, Firebase, Bootstrap.',
    about:
      'Soy Nicolas, estudiante de React y creador de Universo Geek. Este proyecto representa mi entrega final: una tienda ecommerce con catalogo, detalle de productos, carrito, autenticacion y panel de administracion.',
  },
  {
    name: 'Lourdes',
    role: 'Gestion de pedidos',
    email: 'lourdes@univgeek.com',
    image: '/images/perfil-lourdes.png',
  },
  {
    name: 'Tina',
    role: 'Soporte de productos',
    email: 'tina@univgeek.com',
    image: '/images/perfil-tina.png',
  },
]

// Footer muestra informacion de la empresa y las tarjetas requeridas por la consigna.
function Footer() {
  // selectedPerson define si el modal "Sobre mi" esta abierto y que datos muestra.
  const [selectedPerson, setSelectedPerson] = useState(null)
  // isMobile detecta si el cliente navega en un dispositivo movil para activar el carrusel.
  const [isMobile, setIsMobile] = useState(false)
  // memberIndex controla que integrante del equipo se muestra en el slider movil.
  const [memberIndex, setMemberIndex] = useState(0)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)')
    const listener = (e) => {
      setIsMobile(e.matches)
      if (!e.matches) setMemberIndex(0) // Reset index on resize to desktop
    }
    setIsMobile(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  // visibleTeam contiene todos los integrantes en desktop o solo el actual en mobile.
  const visibleTeam = isMobile ? [team[memberIndex]] : team

  return (
    <footer className="site-footer">
      {/* Bloque institucional de Universo Geek. */}
      <section>
        <h2>Universo Geek</h2>
        <p>
          Tienda de figuras de coleccion, accesorios gamer, productos para rol y
          objetos de setup para fans del universo geek.
        </p>
      </section>

      {/* Tarjetas del equipo. Cada una usa avatar, nombre, rol y mail. */}
      <section className="footer-team-container" aria-label="Equipo de la empresa">
        {isMobile && (
          <div className="team-carousel-header">
            <h3>Nuestro equipo</h3>
            <div className="carousel-controls">
              <button
                type="button"
                className="carousel-control-btn"
                onClick={() => setMemberIndex((prev) => (prev - 1 + team.length) % team.length)}
                aria-label="Miembro anterior"
              >
                <FiChevronLeft />
              </button>
              <button
                type="button"
                className="carousel-control-btn"
                onClick={() => setMemberIndex((prev) => (prev + 1) % team.length)}
                aria-label="Siguiente miembro"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}

        <div className="footer-team">
          {visibleTeam.map((person) => (
            <article className="person-card" key={person.email}>
              <div className="person-heading">
                <img className="person-avatar" src={person.image} alt={person.name} />
                <div>
                  <h3>{person.name}</h3>
                  <button
                    className="about-button"
                    disabled={!person.about}
                    type="button"
                    onClick={() => setSelectedPerson(person)}
                  >
                    Sobre mi
                  </button>
                </div>
              </div>
              <p>{person.role}</p>
              <a href={`mailto:${person.email}`}>{person.email}</a>
            </article>
          ))}
        </div>
      </section>

      <Modal
        centered
        show={Boolean(selectedPerson)}
        onHide={() => setSelectedPerson(null)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Sobre mi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPerson && (
            <div className="about-modal-content">
              <div className="about-modal-heading">
                <img src={selectedPerson.image} alt={selectedPerson.name} />
                <h3>{selectedPerson.name}</h3>
              </div>
              <p>{selectedPerson.about}</p>
              {selectedPerson.technologies && (
                <p className="about-technologies">
                  <strong>Tecnologias usadas:</strong> {selectedPerson.technologies}
                </p>
              )}
              <a href={`mailto:${selectedPerson.email}`}>{selectedPerson.email}</a>
              {selectedPerson.linkedin && (
                <a
                  className="profile-link-card linkedin-card"
                  href={selectedPerson.linkedin}
                  rel="noreferrer"
                  target="_blank"
                >
                  <FaLinkedin aria-hidden="true" />
                  <span>
                    <span className="profile-link-label">
                      LinkedIn
                      <em>Open to work</em>
                    </span>
                    <strong>nicolas-poy-peters</strong>
                  </span>
                </a>
              )}
              {selectedPerson.github && (
                <a
                  className="profile-link-card github-card"
                  href={selectedPerson.github}
                  rel="noreferrer"
                  target="_blank"
                >
                  <FaGithub aria-hidden="true" />
                  <span>
                    GitHub
                    <strong>NicoPoy</strong>
                  </span>
                </a>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </footer>
  )
}

export default Footer
