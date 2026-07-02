import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

// ProtectedRoute protege pantallas privadas.
// Si no hay usuario autenticado redirige a login y recuerda la ruta original.
function ProtectedRoute({ children, requiredRole }) {
  // role permite bloquear rutas admin aunque el usuario cliente este logueado.
  const { isAuthenticated, loading, role } = useAuth()
  // location se guarda para volver despues del login cuando corresponda.
  const location = useLocation()

  if (loading) {
    return <p className="status-message">Validando sesion...</p>
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" state={{ from: location }} />
  }

  if (requiredRole && role !== requiredRole) {
    // Los clientes autenticados vuelven al catalogo si intentan entrar al panel.
    return <Navigate replace to="/productos" />
  }

  return children
}

export default ProtectedRoute
