import { useState } from 'react'
import { Alert, Form, Spinner } from 'react-bootstrap'
import { FiLock, FiLogIn, FiShield, FiShoppingBag, FiUserPlus } from 'react-icons/fi'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Seo from '../components/seo/Seo.jsx'
import { useAuth } from '../context/AuthContext.jsx'

// Login permite iniciar sesion o registrar usuario desde una misma pantalla.
// Usa AuthContext para trabajar con Firebase Authentication.
function Login() {
  // useAuth entrega estado de sesion y acciones para login/registro.
  const { isAdmin, isAuthenticated, isFirebaseConfigured, login, register } = useAuth()
  // navigate cambia de pantalla despues de autenticar sin recargar la app.
  const navigate = useNavigate()
  // location conserva la ruta privada que intento abrir el usuario.
  const location = useLocation()
  // mode alterna entre formulario de ingreso y formulario de registro.
  const [mode, setMode] = useState('login')
  // formData mantiene los campos controlados del formulario.
  const [formData, setFormData] = useState({ email: '', password: '' })
  // error muestra problemas de validacion o Firebase en el formulario.
  const [error, setError] = useState('')
  // loading bloquea el boton mientras Firebase responde.
  const [loading, setLoading] = useState(false)
  // from indica a donde volver si el login venia de una ruta protegida.
  const from = location.state?.from?.pathname || '/admin'

  if (isAuthenticated) {
    return <Navigate replace to={isAdmin ? from : '/productos'} />
  }

  // handleChange sincroniza cada input con formData usando el atributo name.
  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  // handleSubmit valida datos, ejecuta login/registro y redirige segun rol.
  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!formData.email.trim() || formData.password.length < 6) {
      setError('Ingresa un email valido y una contrasena de al menos 6 caracteres.')
      return
    }

    try {
      setLoading(true)
      if (mode === 'login') {
        // profile contiene el rol para decidir si puede volver a /admin.
        const profile = await login(formData.email, formData.password)
        navigate(profile.role === 'admin' ? from : '/productos', { replace: true })
      } else {
        // register siempre crea clientes, por eso luego se navega al catalogo.
        await register(formData.email, formData.password)
        navigate('/productos', { replace: true })
      }
    } catch {
      setError('No se pudo autenticar el usuario. Revisa email, contrasena y Firebase.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-section auth-section login-page">
      <Seo
        title="Acceso"
        description="Ingreso de usuarios para comprar en Universo Geek o administrar el catalogo."
      />

      <div className="login-shell">
        <aside className="login-panel">
          <span className="eyebrow">Usuarios</span>
          <h1>{mode === 'login' ? 'Ingresar' : 'Crear cliente'}</h1>
          <p>
            Accede a Universo Geek para comprar productos, gestionar el carrito y
            administrar el catalogo si tu cuenta ya tiene permisos.
          </p>

          <div className="login-feature-list" aria-label="Beneficios del acceso">
            <div>
              <FiShield aria-hidden="true" />
              <span>Sesion protegida</span>
            </div>
            <div>
              <FiShoppingBag aria-hidden="true" />
              <span>Compras habilitadas</span>
            </div>
            <div>
              <FiLock aria-hidden="true" />
              <span>Panel privado</span>
            </div>
          </div>
        </aside>

        <div className="login-form-wrap">
          {!isFirebaseConfigured && (
            <Alert className="login-alert" variant="warning">
              Firebase no esta configurado. Carga las variables de entorno para iniciar sesion.
            </Alert>
          )}

          <Form className="auth-card login-card" onSubmit={handleSubmit}>
            <div className="login-card-heading">
              <span>{mode === 'login' ? 'Bienvenido' : 'Nuevo cliente'}</span>
              <strong>{mode === 'login' ? 'Login' : 'Registro'}</strong>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                autoComplete="email"
                name="email"
                placeholder="tu@email.com"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Contrasena</Form.Label>
              <Form.Control
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength="6"
                name="password"
                placeholder="Minimo 6 caracteres"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="form-actions">
              <button className="button" disabled={loading} type="submit">
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : mode === 'login' ? (
                  <FiLogIn aria-hidden="true" />
                ) : (
                  <FiUserPlus aria-hidden="true" />
                )}
                {mode === 'login' ? 'Ingresar' : 'Registrarme'}
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => {
                  setError('')
                  setMode(mode === 'login' ? 'register' : 'login')
                }}
              >
                {mode === 'login' ? 'Crear cuenta' : 'Ya tengo cuenta'}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </section>
  )
}

export default Login

