# CLAUDE.md - blog.aleliz.xyz

Blog personal de Alejandro Tejero construido con Astro 5. Contenido en español.

## Stack

- **Astro 5** (SSG) con integraciones: MDX, Sitemap, React
- **React 19** - Solo para componentes interactivos (ej. PDFViewer)
- **Tailwind CSS v4** - Integrado via `@tailwindcss/vite`
- **TypeScript** - Modo strict (`astro/tsconfigs/strict`)
- **Content Collections** - Posts en Markdown/MDX con schema Zod

## Comandos

```bash
npm run dev       # Dev server en localhost:4321
npm run build     # Build estático a ./dist/
npm run preview   # Preview del build local
```

## Estructura del proyecto

```
src/
  components/       # Componentes Astro y React (.astro, .jsx)
  content/
    blog/           # Posts del blog (Markdown/MDX)
  layouts/
    BlogPost.astro  # Layout principal para posts
  pages/
    index.astro     # Homepage
    about.astro     # Página about con CV en PDF
    blog/
      index.astro       # Listado de posts
      [...slug].astro   # Rutas dinámicas de posts
    rss.xml.js      # Feed RSS
  styles/
    global.css      # CSS global + Tailwind import + variables custom
  consts.ts         # SITE_TITLE, SITE_DESCRIPTION
  content.config.ts # Schema de Content Collections
public/             # Assets estáticos (imágenes, fuentes, PDFs)
astro.config.mjs    # Configuración de Astro
```

## Content Collections - Schema del blog

Definido en `src/content.config.ts`:

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `title` | string | Si | |
| `description` | string | Si | |
| `pubDate` | date | Si | Acepta strings parseables por Date() |
| `updatedDate` | date | No | |
| `heroImage` | string | No | Ruta relativa a `/public/` |
| `includeTitleInContent` | boolean | No | Default: `true`. Poner `false` si el post ya tiene H1 |
| `includeInList` | boolean | No | Default: `false`. Poner `true` para que posts en subcarpetas aparezcan en el listado |

## Convenciones de contenido

### Posts simples
Archivo directo en `src/content/blog/nombre-del-post.md`. Aparecen automáticamente en el listado.

### Series (posts agrupados)
```
src/content/blog/nombre-serie/
  index.md                    # Índice de la serie (aparece en listado)
  capitulo-uno.md             # Subcapítulo (oculto del listado por defecto)
  subcarpeta/
    index.md
    otro-capitulo.md
```

Los posts en subcarpetas NO aparecen en el listado a menos que tengan `includeInList: true`.

### Assets
Organizar en `public/` por tema del post:
```
public/
  nombre-serie/
    imagen1.jpg
    diagrama.svg
```
Referenciar en frontmatter como: `heroImage: "/nombre-serie/imagen1.jpg"`

## Estilos

- Variables CSS custom en `src/styles/global.css`: `--accent`, `--black`, `--gray`, etc.
- Clase `.prose` para contenido: max-width 720px, centrado
- Breakpoint responsive: 720px
- Fuente custom: Atkinson (woff en `/public/fonts/`)

## Componentes clave

| Componente | Archivo | Propósito |
|------------|---------|-----------|
| BaseHead | `src/components/BaseHead.astro` | Meta tags, OG, Twitter Cards, SEO |
| Header | `src/components/Header.astro` | Navbar con navegación y social links |
| BlogPost | `src/layouts/BlogPost.astro` | Layout de posts: hero image, fecha, contenido |
| PDFViewer | `src/components/PDFViewer.jsx` | Visor PDF interactivo (React, `client:visible`) |
| FormattedDate | `src/components/FormattedDate.astro` | Formateo de fechas locale US |

## Reglas

- NO modificar archivos generados en `.astro/`
- Imágenes y assets estáticos van en `public/`, nunca en `src/`
- Componentes React solo cuando se necesita interactividad; usar `client:visible` para lazy hydration
- Commits en español, descriptivos
- Branches: `feature/nombre` o `tema/descripcion`
- El `site` en `astro.config.mjs` está pendiente de actualizar a la URL real
