# Universo Geek - Entrega Final React

Universo Geek es un ecommerce geek desarrollado como entrega final del curso de
React. El proyecto respeta la estructura aprobada en la pre-entrega y suma
autenticacion, carrito, busqueda, paginacion, CRUD de productos y conexion con
Firebase.

## Tecnologias

- React 18
- Vite
- React Router DOM
- Context API
- Firebase Authentication
- Cloud Firestore
- React Bootstrap / Bootstrap
- React Icons
- React Helmet Async
- styled-components
- CSS modular por secciones

## Funcionalidades principales

- Home con identidad visual de Universo Geek.
- Catalogo de productos con carga asincronica.
- Busqueda por nombre, descripcion o categoria.
- Filtros por categoria.
- Paginacion de productos.
- Detalle de producto en ruta dinamica `/producto/:id`.
- Carrito global con Context API.
- Login y registro de usuarios.
- Rutas protegidas para carrito y panel admin.
- Panel admin para crear, editar, eliminar y listar productos.
- Roles de usuario: los registros nuevos son clientes y las cuentas anteriores
  sin perfil siguen entrando como admins.
- Carga inicial de productos desde `public/productos.json`.
- Modal de confirmacion antes de eliminar productos.
- SEO dinamico por pagina.
- Footer con informacion del proyecto, equipo y modal "Sobre mi".

## Estructura de carpetas

```text
src/
  components/
    auth/          Componentes de proteccion de rutas.
    layout/        Header, NavBar, Layout y Footer.
    products/      Componentes reutilizables del catalogo.
    seo/           Componente para metadatos dinamicos.
    ui/            Componentes pequenos de interfaz.
  context/         Estados globales de autenticacion y carrito.
  firebase/        Configuracion centralizada de Firebase.
  pages/           Pantallas principales de la aplicacion.
  services/        Logica de acceso a productos y persistencia.
  styles/          CSS dividido por responsabilidad.
```

La documentacion completa de responsabilidades por archivo esta en
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Rutas

- `/`: vista principal.
- `/productos`: catalogo con filtros, busqueda y paginacion.
- `/producto/:id`: detalle de un producto.
- `/login`: login y registro.
- `/carrito`: carrito protegido para usuarios autenticados.
- `/admin`: panel privado protegido.
- `*`: pagina 404.

## Reglas de acceso

- Usuario sin login: puede ver inicio, catalogo, detalle y login.
- Usuario sin login: no puede agregar productos al carrito.
- Usuario cliente: puede comprar y usar carrito.
- Usuario admin: puede acceder al panel y administrar productos.
- Todo registro nuevo desde `/login` crea un perfil `client`; no hay registro
  publico de admins.

## Instalacion

```bash
npm install
```

## Levantar el proyecto

```bash
npm run dev
```

Luego abrir la URL que muestra la terminal, normalmente:

```text
http://localhost:5173
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
```

## Build de produccion

```bash
npm run build
```

El build debe completarse sin errores antes de entregar o desplegar.

## Checklist de entrega final

- [x] Estructura organizada de carpetas.
- [x] Layout con Header, NavBar y Footer.
- [x] Footer con informacion de empresa y tarjetas de personas.
- [x] Catalogo con productos reutilizando `Item.jsx`.
- [x] Ruteo con `react-router-dom`.
- [x] Detalle de producto por ruta dinamica.
- [x] Carrito con Context API.
- [x] Auth con Context API y Firebase.
- [x] Rutas privadas.
- [x] CRUD de productos.
- [x] Busqueda y paginacion.
- [x] SEO dinamico.
- [x] CSS dividido por responsabilidad.
- [x] Firebase real configurado en el entorno de entrega.
- [x] Chequear los roles de usuarios y admin, que no se creen admins
- [x] Deploy publicado y probado.

## Enlaces del Proyecto
- **Repositorio GitHub**: https://github.com/NicoPoy/ReactJs-TiendaGeek/tree/main
- **Sitio en Producción (Deploy)**: https://react-js-tienda-geek.vercel.app/

## Credenciales de Acceso para Corrección
- **Usuario Administrador**:
  - Email: `admin@tiendageek.com`
  - Contraseña: `admin-tienda-geek-2026`
- **Usuario Cliente**:
  - Email: `user@tiendageek.com`
  - Contraseña: `user-tienda`

## Configuración de Firebase
- `VITE_FIREBASE_API_KEY="AIzaSyB7EFBB4Zn_IJ7_mjm8dBZhBpymek1zOVg"`
- `VITE_FIREBASE_AUTH_DOMAIN="curso-react-67e7b.firebaseapp.com"`
- `VITE_FIREBASE_PROJECT_ID="curso-react-67e7b"`
- `VITE_FIREBASE_MESSAGING_SENDER_ID="393314399948"`
- `VITE_FIREBASE_APP_ID="1:393314399948:web:13ff01163203059a4df469"`
