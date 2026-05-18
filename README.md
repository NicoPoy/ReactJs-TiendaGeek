# Universo Geek - Pre Entrega React

Proyecto de ecommerce geek realizado con React, Vite, React Router DOM y Context API.

## Imagenes

El logo principal y el background del home fueron creados de forma personalizada
con IA para esta pagina.

Las imagenes de productos se guardan localmente en `public/images` y se
referencian desde `productos.json`.

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
