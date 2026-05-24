# Nexus Demo

Demo SPA empresarial moderna construida con React 18, Vite 5 y Tailwind CSS 3.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + JSX |
| Bundler | Vite 5 |
| Estilos | Tailwind CSS 3 |
| Enrutamiento | React Router DOM v6 |
| Estado global | Zustand 4 |
| i18n | i18next + react-i18next + i18next-browser-languagedetector |
| Iconos | lucide-react |
| Utilidades CSS | clsx + tailwind-merge |
| Tests | Vitest + Testing Library + jsdom |
| Linting | ESLint 8 |

## Requisitos

- Node.js ≥ 18
- npm ≥ 9

## Instalación

```bash
# 1. Clonar / descargar el proyecto
cd c:\Projects\ChatBot

# 2. Instalar dependencias
npm install

# 3. Arrancar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Variables de entorno

Copia `.env.example` como `.env.local` para sobreescribir valores:

```bash
cp .env.example .env.local
```

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL base de la API (no usada en la demo) | `http://localhost:8888` |

> Solo se admiten variables con prefijo `VITE_`. Nunca uses `process.env` en código frontend.

## Comandos disponibles

```bash
npm run dev          # Servidor de desarrollo con HMR
npm run build        # Build de producción en /dist
npm run preview      # Previsualizar el build de producción
npm run test         # Ejecutar tests con Vitest
npm run test:ui      # Interfaz web de Vitest
npm run test:coverage # Informe de cobertura
npm run lint         # Linting con ESLint
```

## Estructura del proyecto

```
src/
├── main.jsx              # Entry point / registro de SW
├── App.jsx               # BrowserRouter + rutas públicas
├── index.css             # Estilos globales Tailwind
├── components/
│   ├── Navbar.jsx        # Navbar responsive (desktop + móvil)
│   └── ui/
│       ├── Button.jsx    # Botón con variantes: primary, secondary, danger, ghost, outline
│       ├── Card.jsx      # Tarjeta con Header, Body, Footer
│       ├── Badge.jsx     # Etiqueta de estado
│       ├── Input.jsx     # Campo de texto + textarea
│       ├── Spinner.jsx   # Indicador de carga
│       └── index.js      # Re-exportaciones
├── pages/
│   ├── HomePage.jsx      # / — Bienvenida + métricas + funcionalidades
│   ├── ServicesPage.jsx  # /servicios — Servicios disponibles
│   ├── AboutPage.jsx     # /acerca-de — Info técnica de la demo
│   ├── ContactPage.jsx   # /contacto — Formulario con validación
│   └── NotFoundPage.jsx  # * — 404
├── hooks/
│   ├── useDarkMode.js    # Modo oscuro (sincroniza clase 'dark' en <html>)
│   ├── useLanguage.js    # Cambio de idioma + sincronización con i18n
│   └── useAppStore.js    # Re-exporta el store de Zustand
├── store/
│   └── useAppStore.js    # Zustand store: darkMode, language, mobileMenu
├── i18n/
│   ├── index.js          # Configuración de i18next
│   └── locales/
│       ├── es.json       # Español (fallback)
│       ├── ca.json       # Catalán
│       └── en.json       # Inglés
└── utils/
    ├── cn.js             # Helper clsx + tailwind-merge
    └── apiFetch.js       # Wrapper fetch sin Authorization

tests/
├── setup.js              # Importa @testing-library/jest-dom
├── cn.test.js            # Tests unitarios del helper cn()
├── Button.test.jsx       # Tests del componente Button
├── Card.test.jsx         # Tests del componente Card
├── Navbar.test.jsx       # Tests del componente Navbar
├── ContactPage.test.jsx  # Tests del formulario + validación
└── routes.test.jsx       # Tests de renderizado de rutas

public/
├── favicon.svg
└── sw.js                 # Service Worker básico (solo en producción)
```

## Rutas públicas

| Ruta | Página |
|------|--------|
| `/` | Inicio |
| `/servicios` | Servicios |
| `/acerca-de` | Acerca de |
| `/contacto` | Contacto |
| `*` | 404 Not Found |

## Internacionalización

El idioma se detecta automáticamente desde:
1. `localStorage` (clave `app_lang`)
2. Idioma del navegador (`navigator.language`)
3. Fallback: `es` (español)

Para cambiar el idioma en tiempo de ejecución usa el selector de idioma en la Navbar.

## Modo oscuro

El modo oscuro se activa pulsando el icono de luna/sol en la Navbar. La preferencia se persiste en `localStorage` mediante Zustand.

## Service Worker (PWA básica)

- **Desarrollo**: los SWs previos se desregistran automáticamente para evitar conflictos con HMR.
- **Producción**: se registra `public/sw.js` con estrategia cache-first para assets y network-first para navegación.

## Notas de seguridad

- No hay autenticación, roles ni rutas protegidas.
- `apiFetch` no añade cabeceras `Authorization` ni tokens.
- Solo se usan variables de entorno `VITE_*`; nunca `process.env`.
