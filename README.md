# Universo Geek - Pre Entrega React

Proyecto de ecommerce geek realizado con React, Vite, React Router DOM y Context API.

## Imagenes

Las fotos del proyecto son de Pexels y se usan bajo su licencia gratuita.
Referencia: https://www.pexels.com/license/

Fuentes usadas:

- https://www.pexels.com/photo/modern-gaming-setup-with-rgb-lighting-28842077/
- https://www.pexels.com/photo/mechanical-computer-keyboard-671629/
- https://www.pexels.com/photo/close-up-of-hands-using-a-keyboard-and-mouse-on-a-gaming-setup-with-colorful-lights-7915503/
- https://www.pexels.com/photo/headphones-on-desk-5877660/
- https://www.pexels.com/photo/glowing-desk-lamp-19844043/
- https://www.pexels.com/photo/green-d20-dice-for-tabletop-rpg-gaming-32030732/
- https://www.pexels.com/photo/modern-gaming-desk-setup-with-rgb-lighting-31018745/
- https://www.pexels.com/photo/body-kun-1084753/

## Instalacion

```bash
npm install
```

## Levantar el proyecto

```bash
npm run dev
```

Luego abrir la URL que muestra la terminal, normalmente `http://localhost:5173`.

## Build de produccion

```bash
npm run build
```

## Requisitos cubiertos

- Estructura de carpetas organizada.
- Layout con Header, NavBar y Footer.
- Catalogo de productos cargado desde `productos.json` con `useEffect` y `fetch`.
- Componente reutilizable `Item.jsx`.
- Ruteo con `react-router-dom`.
- Detalle de producto en `/producto/:id`.
- Carrito global con Context API.
- CartWidget con indicador numerico actualizado.
- Vista de carrito en `/carrito`.
