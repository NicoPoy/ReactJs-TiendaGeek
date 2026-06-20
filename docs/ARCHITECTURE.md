# Arquitectura del Proyecto

Este documento explica la responsabilidad de cada carpeta y archivo principal.
La idea es que el proyecto sea facil de leer, mantener y evaluar.

## Entrada de la aplicacion

- `src/main.jsx`: monta React en el DOM. Envuelve la app con `HelmetProvider`,
  `BrowserRouter`, `AuthProvider` y `CartProvider`.
- `src/App.jsx`: define el mapa de rutas. Centraliza que paginas son publicas y
  cuales estan protegidas con `ProtectedRoute`.

## Componentes

- `src/components/layout/Layout.jsx`: estructura comun de la app. Renderiza
  Header, contenido dinamico con `Outlet` y Footer.
- `src/components/layout/Header.jsx`: contenedor semantico del encabezado.
- `src/components/layout/NavBar.jsx`: navegacion principal con `NavLink`, acceso
  condicional a login, panel y carrito.
- `src/components/layout/Footer.jsx`: footer institucional, tarjetas del equipo
  y modal "Sobre mi".
- `src/components/products/Item.jsx`: tarjeta reutilizable de producto.
- `src/components/products/ItemList.jsx`: recibe un array y renderiza multiples
  `Item`.
- `src/components/ui/CartWidget.jsx`: muestra icono y contador del carrito.
- `src/components/auth/ProtectedRoute.jsx`: bloquea rutas si no hay usuario
  autenticado.
- `src/components/seo/Seo.jsx`: actualiza title y meta description por pagina.

## Paginas

- `src/pages/Home.jsx`: portada y acceso al catalogo.
- `src/pages/ItemListContainer.jsx`: catalogo. Carga productos, filtra, busca y
  pagina resultados.
- `src/pages/ItemDetailContainer.jsx`: detalle de un producto. Permite comprar
  solo si el usuario esta autenticado.
- `src/pages/Cart.jsx`: vista del carrito. Consume `CartContext`.
- `src/pages/Login.jsx`: login/registro. Consume `AuthContext`.
- `src/pages/AdminProducts.jsx`: panel CRUD de productos.
- `src/pages/NotFound.jsx`: fallback para rutas inexistentes.

## Contextos

- `src/context/AuthContext.jsx`: estado global de usuario, login, registro,
  logout y modo demo local.
- `src/context/CartContext.jsx`: estado global del carrito, cantidades, total y
  acciones de agregar/quitar/vaciar.

## Datos y servicios

- `src/firebase/config.js`: lee variables de entorno y crea instancias de Auth y
  Firestore cuando Firebase esta configurado.
- `src/services/productService.js`: capa unica de productos. Usa Firestore si
  existe configuracion y `localStorage`/JSON como fallback demo.
- `public/productos.json`: catalogo inicial para carga local o seed.
- `public/images/`: imagenes usadas por productos y layout.

## Estilos

`src/styles/global.css` solo importa archivos CSS por responsabilidad:

- `base.css`: reset, tipografia, body y elementos HTML base.
- `layout.css`: header, navbar, layout general y CartWidget.
- `home.css`: hero y pantalla inicial.
- `buttons.css`: botones reutilizables.
- `sections.css`: secciones, titulos y mensajes globales.
- `catalog.css`: catalogo, filtros, busqueda y paginacion.
- `products.css`: cards de producto y detalle.
- `cart.css`: carrito y selector de cantidad.
- `auth.css`: login, panel admin y formularios.
- `footer.css`: footer, tarjetas del equipo y modal "Sobre mi".
- `responsive.css`: media queries generales.

## Flujo de datos

1. `main.jsx` monta providers globales.
2. Las paginas piden productos a `productService.js`.
3. `productService.js` decide si usar Firestore o fallback local.
4. `CartContext` mantiene el carrito en memoria durante la sesion.
5. `AuthContext` mantiene el usuario autenticado o un usuario demo.
6. `ProtectedRoute` usa `AuthContext` para permitir o bloquear rutas privadas.

## Criterio de documentacion

Cada archivo tiene un comentario inicial o comentarios cercanos a la logica
principal explicando que hace. Los comentarios evitan repetir codigo obvio y se
concentran en responsabilidades, flujos y decisiones importantes.
