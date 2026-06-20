import NavBar from './NavBar.jsx'

// Header contiene la navegacion principal.
// Se separa de NavBar para mantener una estructura clara de Layout.
function Header() {
  return (
    <header className="site-header">
      <NavBar />
    </header>
  )
}

export default Header
