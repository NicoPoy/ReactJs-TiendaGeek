import Item from './Item.jsx'

// ItemList recibe un array de productos y delega cada card al componente Item.
// Mantiene separada la grilla del contenido de cada producto.
function ItemList({ products }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        // key permite que React identifique cada elemento de la lista.
        <Item key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ItemList
