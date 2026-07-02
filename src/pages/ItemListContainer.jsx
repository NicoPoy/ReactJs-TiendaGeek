import { useEffect, useMemo, useState } from 'react'
import ItemList from '../components/products/ItemList.jsx'
import Seo from '../components/seo/Seo.jsx'
import { getProducts } from '../services/productService.js'

// ItemListContainer es la pantalla de catalogo.
// Carga productos desde el servicio, aplica busqueda, categoria y paginacion.
// Categorias disponibles para filtrar el catalogo.
// Deben coincidir con los valores category guardados en Firestore.
const categories = ['Todos', 'Perifericos', 'Setup', 'Rol', 'Coleccion']
const productsPerPage = 8

function ItemListContainer() {
  // products guarda el listado completo recibido desde Firestore.
  const [products, setProducts] = useState([])
  // selectedCategory controla que filtro esta activo en la vista.
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  // loading y error permiten mostrar mensajes mientras se carga o si falla el fetch.
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // El fetch se ejecuta una sola vez cuando se monta el componente.
  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data))
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchTerm])

  const filteredProducts = useMemo(() => {
    // Filtrado derivado: no modifica la lista original de productos.
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todos' || product.category === selectedCategory
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch)

      return matchesCategory && matchesSearch
    })
  }, [products, searchTerm, selectedCategory])

  const totalPages = Math.max(Math.ceil(filteredProducts.length / productsPerPage), 1)
  const firstProductIndex = (currentPage - 1) * productsPerPage
  const paginatedProducts = filteredProducts.slice(
    firstProductIndex,
    firstProductIndex + productsPerPage,
  )

  return (
    <section className="page-section catalog-page">
      <Seo
        title="Productos"
        description="Catalogo de accesorios gamer, figuras coleccionables, productos de rol y objetos para setup."
      />
      <div className="catalog-header">
        <div className="section-heading">
          <span className="eyebrow">Catalogo</span>
          <h1>Productos destacados</h1>
          <p>Elegidos para mejorar tu setup y sumar objetos con onda geek.</p>
        </div>
      </div>

      <div className="catalog-layout">
        <aside className="catalog-sidebar" aria-label="Filtros del catalogo">
          <div className="sidebar-panel">
            <div className="sidebar-heading">
              <span>Filtros</span>
            </div>

            <div className="catalog-tools">
              <label className="search-control" htmlFor="product-search">
                <span>Buscar productos</span>
                <input
                  id="product-search"
                  placeholder="Teclado, figura, setup..."
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>
            </div>

            {/* Botonera de filtros. Cada click cambia la categoria activa. */}
            <div>
              <span className="filter-title">Categorias</span>
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
            </div>
          </div>
        </aside>

        <div className="catalog-results">
          <div className="catalog-results-bar">
            <span>
              Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
            </span>
            <span>{selectedCategory}</span>
          </div>

          {loading && <p className="status-message inline-status">Cargando productos...</p>}
          {error && <p className="status-message inline-status">{error}</p>}

          {/* Si una categoria no tiene productos, se informa sin romper la vista. */}
          {!loading && !error && paginatedProducts.length > 0 ? (
            <>
              <ItemList products={paginatedProducts} />
              {totalPages > 1 && (
                <nav className="pagination-bar" aria-label="Paginador de productos">
                  <button
                    className="button button-secondary"
                    disabled={currentPage === 1}
                    type="button"
                    onClick={() => setCurrentPage((page) => page - 1)}
                  >
                    Anterior
                  </button>
                  <span>
                    Pagina {currentPage} de {totalPages}
                  </span>
                  <button
                    className="button button-secondary"
                    disabled={currentPage === totalPages}
                    type="button"
                    onClick={() => setCurrentPage((page) => page + 1)}
                  >
                    Siguiente
                  </button>
                </nav>
              )}
            </>
          ) : (
            !loading &&
            !error && (
              <p className="empty-category">
                No hay productos que coincidan con la busqueda o categoria elegida.
              </p>
            )
          )}
        </div>
      </div>
    </section>
  )
}

export default ItemListContainer

