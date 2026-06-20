# Universo Geek - Entrega Final React

Ecommerce geek realizado con React, Vite, React Router DOM, Context API,
Firebase Authentication, Firestore, React Bootstrap, styled-components, React
Icons y React Helmet.

## Funcionalidades

- Catalogo de productos con carga asincronica, estados de carga y errores.
- Busqueda en tiempo real por nombre, descripcion o categoria.
- Filtros por categoria y paginacion de productos.
- Detalle individual de producto.
- Carrito global con Context API: agregar, quitar, modificar cantidades y vaciar.
- Autenticacion de usuarios con Firebase Authentication.
- Ruta privada `/admin` protegida para usuarios autenticados.
- CRUD de productos contra Firestore: crear, leer, editar y eliminar.
- Modal de confirmacion antes de eliminar productos.
- SEO dinamico por pagina con React Helmet.
- Diseno responsive con Bootstrap, React Bootstrap y CSS propio.

## Instalacion

```bash
npm install
```

## Configurar Firebase

1. Crear un proyecto en Firebase.
2. Crear una app web dentro del proyecto.
3. Activar Authentication con el proveedor Email/Password.
4. Crear una base Firestore.
5. Copiar `.env.example` como `.env`.
6. Completar `.env` con los datos reales de Firebase.

Ejemplo:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Reglas sugeridas de Firestore para la entrega

Estas reglas dejan leer el catalogo publicamente y restringen la escritura a
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

## Levantar el proyecto

```bash
npm run dev
```

Luego abrir la URL que muestra la terminal, normalmente `http://localhost:5173`.

## Cargar productos iniciales

1. Ir a `/login`.
2. Crear una cuenta con email y password.
3. Entrar al panel `/admin`.
4. Presionar `Cargar JSON inicial`.

Ese boton toma los productos de `public/productos.json` y los carga en la
coleccion `products` de Firestore. Si Firebase no esta configurado, la app usa
un modo demo local con `localStorage` para poder probar la interfaz.

## Build de produccion

```bash
npm run build
```

## Imagenes

Las imagenes del sitio se guardan en `public/images` y los productos las
referencian con rutas como `/images/teclado-rgb.jpg`.
