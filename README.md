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
- Rutas protegidas para carrito y panel privado.
- Panel admin para crear, editar, eliminar y listar productos.
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
- Usuario autenticado: puede comprar, usar carrito y acceder al panel.
- Panel admin: permite administrar productos.

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

## Configurar Firebase

1. Crear un proyecto en Firebase.
2. Crear una app web dentro del proyecto.
3. Activar Authentication con proveedor Email/Password.
4. Crear una base de datos Firestore.
5. Copiar `.env.example` como `.env`.
6. Completar `.env` con los datos reales del proyecto.

Variables esperadas:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Si Firebase no esta configurado, la app usa un modo demo local con
`localStorage`. Esto permite probar la interfaz, pero para la entrega final se
recomienda usar Firebase real.

## Reglas sugeridas de Firestore

Estas reglas permiten leer el catalogo publicamente y restringen escritura a
usuarios autenticados:

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

## Cargar productos iniciales

1. Ejecutar el proyecto.
2. Ir a `/login`.
3. Crear una cuenta o ingresar con un usuario existente.
4. Entrar a `/admin`.
5. Presionar `Cargar JSON inicial`.

Ese boton toma los productos de `public/productos.json` y los guarda en la
coleccion `products` de Firestore. En modo demo los guarda en `localStorage`.

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

## Imagenes y datos

- Las imagenes viven en `public/images`.
- El catalogo base vive en `public/productos.json`.
- Las rutas de imagen se guardan como `/images/nombre-del-archivo.jpg`.

## Deploy

Para publicar en Vercel o Netlify:

1. Subir el repositorio a GitHub.
2. Crear un proyecto en Vercel/Netlify.
3. Configurar las mismas variables de entorno del `.env`.
4. Ejecutar deploy.
5. Probar rutas, login, catalogo, carrito y panel admin en la URL publicada.

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
- [ ] Firebase real configurado en el entorno de entrega.
- [ ] Deploy publicado y probado.
