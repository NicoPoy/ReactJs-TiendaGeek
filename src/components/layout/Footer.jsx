const team = [
  {
    name: 'Nicolas Poy Peters',
    role: 'Atencion personalizada',
    email: 'nicolas@univgeek.com',
  },
]

function Footer() {
  return (
    <footer className="site-footer">
      <section>
        <h2>Universo Geek</h2>
        <p>
          Local especializado en accesorios gamer, perifericos, objetos de setup
          y productos para mesas de rol.
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
