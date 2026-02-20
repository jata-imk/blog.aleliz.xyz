# AGENTS.md - blog.aleliz.xyz

Instrucciones para agentes de IA que trabajen en este proyecto. Para contexto detallado y específico de Claude Code, consultar también `CLAUDE.md` en la raíz del proyecto.

## Proyecto

Blog personal de Alejandro Tejero. Contenido en español.

## Stack tecnológico

- **Astro 5** - Framework SSG (Static Site Generation)
- **React 19** - Solo para componentes interactivos
- **Tailwind CSS v4** - Estilos, integrado via Vite plugin
- **TypeScript** - Modo strict
- **MDX** - Markdown con soporte JSX
- **Content Collections** - Sistema de contenido tipado de Astro con validación Zod

## Comandos

```bash
npm run dev       # Dev server en localhost:4321
npm run build     # Build estático a ./dist/
npm run preview   # Preview del build local
```

## Estructura

```
src/
  components/       # Componentes (.astro, .jsx)
  content/blog/     # Posts en Markdown/MDX
  layouts/          # BlogPost.astro (layout principal de posts)
  pages/            # Rutas: index, about, blog/index, blog/[...slug], rss.xml
  styles/global.css # CSS global + Tailwind + variables custom
  consts.ts         # Constantes: SITE_TITLE, SITE_DESCRIPTION
  content.config.ts # Schema de Content Collections (Zod)
public/             # Assets estáticos (imágenes, fuentes, PDFs)
astro.config.mjs    # Configuración de Astro + integraciones
```

## Convenciones de contenido

### Frontmatter requerido para posts

```yaml
---
title: "Título del post"
description: "Descripción breve"
pubDate: "2026-02-19 23:00:00"
---
```

### Campos opcionales

```yaml
updatedDate: "2026-02-20"
heroImage: "/carpeta/imagen.jpg"        # Ruta relativa a public/
includeTitleInContent: false             # Default: true. Poner false si el markdown ya tiene H1
includeInList: true                      # Default: false. Fuerza aparición en listado del blog
```

### Estructura de posts

- **Post simple**: `src/content/blog/nombre-post.md`
- **Serie**: `src/content/blog/nombre-serie/index.md` + subcapítulos en archivos o subcarpetas
- Posts en subcarpetas no aparecen en el listado a menos que tengan `includeInList: true`

### Assets

- Imágenes y archivos estáticos van en `public/`, organizados por tema: `public/nombre-serie/imagen.jpg`
- Nunca colocar assets en `src/`

## Reglas del proyecto

- No modificar archivos auto-generados en `.astro/`
- Componentes React solo cuando se necesita interactividad; usar directiva `client:visible`
- Commits descriptivos en español
- TypeScript strict - respetar tipos y schemas definidos
- Estilos: usar Tailwind + variables CSS custom definidas en `src/styles/global.css`
