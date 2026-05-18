import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import ItemListContainer from './pages/ItemListContainer.jsx'
import ItemDetailContainer from './pages/ItemDetailContainer.jsx'
import Cart from './pages/Cart.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="productos" element={<ItemListContainer />} />
        <Route path="producto/:id" element={<ItemDetailContainer />} />
        <Route path="carrito" element={<Cart />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
