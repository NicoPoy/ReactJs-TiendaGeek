// Datos de las tarjetas del footer.
// Se mantienen en un array para renderizar las 3 personas con map.
const team = [
  {
    name: 'Nicolás',
    role: 'Atencion personalizada',
    email: 'nicolas@univgeek.com',
    image: '/images/perfil-nicolas.png',
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
      <section className="footer-team" aria-label="Equipo de la empresa">
        {team.map((person) => (
          <article className="person-card" key={person.email}>
            <div className="person-heading">
              <img className="person-avatar" src={person.image} alt={person.name} />
              <h3>{person.name}</h3>
            </div>
            <p>{person.role}</p>
            <a href={`mailto:${person.email}`}>{person.email}</a>
          </article>
        ))}
      </section>
    </footer>
  )
}

export default Footer
