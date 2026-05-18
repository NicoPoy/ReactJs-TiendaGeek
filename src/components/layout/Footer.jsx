const team = [
  {
    name: 'Nicolás',
    role: 'Atencion personalizada',
    email: 'nicolas@univgeek.com',
  },
  {
    name: 'Lourdes',
    role: 'Gestion de pedidos',
    email: 'lourdes@univgeek.com',
  },
  {
    name: 'Tina',
    role: 'Soporte de productos',
    email: 'tina@univgeek.com',
  },
]

function Footer() {
  return (
    <footer className="site-footer">
      <section>
        <h2>Universo Geek</h2>
        <p>
          Tienda de figuras de coleccion, accesorios gamer, productos para rol y
          objetos de setup para fans del universo geek.
        </p>
      </section>

      <section className="footer-team" aria-label="Equipo de la empresa">
        {team.map((person) => (
          <article className="person-card" key={person.email}>
            <h3>{person.name}</h3>
            <p>{person.role}</p>
            <a href={`mailto:${person.email}`}>{person.email}</a>
          </article>
        ))}
      </section>
    </footer>
  )
}

export default Footer
