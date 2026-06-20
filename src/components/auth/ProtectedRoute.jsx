import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

// ProtectedRoute protege pantallas privadas.
// Si no hay usuario autenticado redirige a login y recuerda la ruta original.
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="status-message">Validando sesion...</p>
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
