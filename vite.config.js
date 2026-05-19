import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuracion de Vite.
// El plugin de React habilita JSX, Fast Refresh y el build optimizado.
export default defineConfig({
  plugins: [react()],
})
