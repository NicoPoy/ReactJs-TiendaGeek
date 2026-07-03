import { useEffect, useMemo, useState } from 'react'
import ItemList from '../components/products/ItemList.jsx'
import Seo from '../components/seo/Seo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getProducts } from '../services/productService.js'

// ItemListContainer es la pantalla de catalogo.
// Carga productos desde el servicio, aplica busqueda, categoria, orden y paginacion.
// allCategoriesLabel representa el estado sin filtro por categoria.
const allCategoriesLabel = 'Todos'
// defaultProductsPerPage define cuantas cards se ven al entrar al catalogo.
const defaultProductsPerPage = 6
// productsPerPageOptions alimenta el selector de cantidad por pagina.
const productsPerPageOptions = [6, 9, 12, 24]

// sortOptions conecta labels visibles con valores internos de ordenamiento.
const sortOptions = [
  { label: 'Mas nuevos', value: 'newest' },
  { label: 'Nombre A-Z', value: 'name-asc' },
  { label: 'Precio menor', value: 'price-asc' },
  { label: 'Precio mayor', value: 'price-desc' },
]

// sortProducts ordena una copia para no mutar el array original recibido de Firestore.
const sortProducts = (products, sortOrder) => {
  // sortedProducts permite aplicar sort sin alterar products.
  const sortedProducts = [...products]

  if (sortOrder === 'name-asc') {
    return sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
  }

  if (sortOrder === 'price-asc') {
    return sortedProducts.sort((a, b) => a.price - b.price)
  }

  if (sortOrder === 'price-desc') {
    return sortedProducts.sort((a, b) => b.price - a.price)
  }

  return sortedProducts.sort((a, b) => {
    // dateDifference prioriza productos recientes y usa nombre como desempate estable.
    const dateDifference = (b.createdAtTime ?? 0) - (a.createdAtTime ?? 0)
    return dateDifference || a.name.localeCompare(b.name)
  })
}

function ItemListContainer() {
  // El saludo de cliente se muestra solo cuando hay una sesion activa.
  const { isAuthenticated, user } = useAuth()
  // products guarda el listado completo recibido desde Firestore.
  const [products, setProducts] = useState([])
  // selectedCategory controla que filtro esta activo en la vista.
  const [selectedCategory, setSelectedCategory] = useState(allCategoriesLabel)
  // searchTerm guarda el texto del buscador lateral.
  const [searchTerm, setSearchTerm] = useState('')
  // sortOrder guarda el criterio actual elegido por el usuario.
  const [sortOrder, setSortOrder] = useState('newest')
  // productsPerPage controla cuantas cards entran por pagina.
  const [productsPerPage, setProductsPerPage] = useState(defaultProductsPerPage)
  // currentPage indica que slice del resultado filtrado se muestra.
  const [currentPage, setCurrentPage] = useState(1)
  // loading y error permiten mostrar mensajes mientras se carga o si falla el fetch.
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // El fetch se ejecuta una sola vez cuando se monta el componente.
  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data))
      .catch(() => setError('No pudimos cargar el catalogo. Intenta nuevamente en unos minutos.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchTerm, sortOrder, productsPerPage])

  // categories se deriva de productos para no mantener otro estado duplicado.
  const categories = useMemo(() => {
    // productCategories extrae categorias unicas ignorando diferencias de mayusculas.
    const productCategories = products
      .map((product) => product.category)
      .filter(Boolean)
      .filter((category, index, currentCategories) =>
        currentCategories.findIndex(
          (currentCategory) => currentCategory.toLowerCase() === category.toLowerCase(),
        ) === index,
      )
      .sort((a, b) => a.localeCompare(b))

    return [allCategoriesLabel, ...productCategories]
  }, [products])

  // filteredProducts combina busqueda, categoria y orden en una lista lista para paginar.
  const filteredProducts = useMemo(() => {
    // Filtrado derivado: no modifica la lista original de productos.
    const normalizedSearch = searchTerm.trim().toLowerCase()

    // matchingProducts conserva solo productos que cumplen categoria y texto buscado.
    const matchingProducts = products.filter((product) => {
      // matchesCategory permite "Todos" o coincidencia exacta de categoria.
      const matchesCategory =
        selectedCategory === allCategoriesLabel || product.category === selectedCategory
      // matchesSearch busca por nombre, descripcion o categoria para una experiencia amplia.
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch)

      return matchesCategory && matchesSearch
    })

    return sortProducts(matchingProducts, sortOrder)
  }, [products, searchTerm, selectedCategory, sortOrder])

  // selectedSortLabel traduce el valor interno del select a texto del resumen.
  const selectedSortLabel =
    sortOptions.find((sortOption) => sortOption.value === sortOrder)?.label || 'Mas nuevos'
  // totalPages evita que el paginador quede en 0 paginas cuando no hay resultados.
  const totalPages = Math.max(Math.ceil(filteredProducts.length / productsPerPage), 1)
  // firstProductIndex calcula desde que producto empieza la pagina actual.
  const firstProductIndex = (currentPage - 1) * productsPerPage
  // paginatedProducts es el subconjunto final que se renderiza.
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
      {isAuthenticated && (
        <div className="catalog-user-greeting" title={user?.email}>
          Hola, {user?.email}
        </div>
      )}
      <div className="catalog-header">
        <div className="section-heading">
          <span className="eyebrow">Catalogo</span>
          <h1>Catalogo Universo Geek</h1>
          <p>Explora figuras, accesorios gamer, productos de rol y piezas para completar tu setup.</p>
        </div>
      </div>
      <section className="catalog-search-panel" aria-label="Busqueda de productos">
        <label className="catalog-search-control" htmlFor="product-search">
          <span>Buscar productos</span>
          <strong>Mejora tu inventario</strong>
          <input
            id="product-search"
            placeholder="Teclado, figura, setup..."
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
      </section>

      <div className="catalog-layout">
        <aside className="catalog-sidebar" aria-label="Filtros del catalogo">
          <div className="sidebar-panel">
            <div className="sidebar-heading">
              <span>Filtros</span>
            </div>

            <div className="catalog-tools">

              <label className="sort-control" htmlFor="product-sort">
                <span>Ordenar por</span>
                <select
                  id="product-sort"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                >
                  {sortOptions.map((sortOption) => (
                    <option key={sortOption.value} value={sortOption.value}>
                      {sortOption.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sort-control" htmlFor="products-per-page">
                <span>Productos por pagina</span>
                <select
                  id="products-per-page"
                  value={productsPerPage}
                  onChange={(event) => setProductsPerPage(Number(event.target.value))}
                >
                  {productsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
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
            <span>{selectedCategory} - {selectedSortLabel}</span>
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
