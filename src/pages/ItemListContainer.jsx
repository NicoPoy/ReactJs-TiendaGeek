import { useEffect, useState } from 'react'
import ItemList from '../components/products/ItemList.jsx'

const categories = ['Todos', 'Perifericos', 'Audio', 'Setup', 'Rol', 'Coleccion']

function ItemListContainer() {
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/productos.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('No se pudieron cargar los productos')
        }

        return response.json()
      })
      .then((data) => setProducts(data))
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="status-message">Cargando productos...</p>
  }

  if (error) {
    return <p className="status-message">{error}</p>
  }

  const filteredProducts =
    selectedCategory === 'Todos'
      ? products
      : products.filter((product) => product.category === selectedCategory)

  return (
    <section className="page-section">
      <div className="section-heading">
        <span className="eyebrow">Catalogo</span>
        <h1>Productos destacados</h1>
        <p>Elegidos para mejorar tu setup y sumar objetos con onda geek.</p>
      </div>

      <div className="category-filters" aria-label="Categorias de productos">
        {categories.map((category) => (
          <button
            className={selectedCategory === category ? 'active' : ''}
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredProducts.length > 0 ? (
        <ItemList products={filteredProducts} />
      ) : (
        <p className="empty-category">
          Todavia no hay productos cargados en esta categoria.
        </p>
      )}
    </section>
  )
}

export default ItemListContainer
