import { useEffect, useState } from 'react'
import ItemList from '../components/products/ItemList.jsx'

// Categorias disponibles para filtrar el catalogo.
// Deben coincidir con los valores category definidos en productos.json.
const categories = ['Todos', 'Perifericos', 'Setup', 'Rol', 'Coleccion']

// ItemListContainer carga el catalogo desde el JSON local y maneja filtros/estados.
function ItemListContainer() {
  // products guarda el listado completo recibido desde public/productos.json.
  const [products, setProducts] = useState([])
  // selectedCategory controla que filtro esta activo en la vista.
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  // loading y error permiten mostrar mensajes mientras se carga o si falla el fetch.
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // El fetch se ejecuta una sola vez cuando se monta el componente.
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

  // Mientras se espera la respuesta, se muestra un estado de carga.
  if (loading) {
    return <p className="status-message">Cargando productos...</p>
  }

  // Si el fetch falla, se muestra el mensaje de error en pantalla.
  if (error) {
    return <p className="status-message">{error}</p>
  }

  // Si el filtro es "Todos" se muestra el catalogo completo.
  // En otro caso se filtran solo los productos de la categoria seleccionada.
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

      {/* Botonera de filtros. Cada click cambia la categoria activa. */}
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

      {/* Si una categoria no tiene productos, se informa sin romper la vista. */}
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
