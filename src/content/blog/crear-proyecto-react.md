---
title: 'Guia para crear proyecto React + Clean Architecture'
description: 'Lorem ipsum dolor sit amet'
pubDate: 'Marzo 04 2025 21:30:00'
heroImage: '/blog-placeholder-4.jpg'
---

## Introducción

El desarrollo moderno no es solo copiar y pegar código (aunque a veces eso parece la solución mágica). Aquí te mostraré cómo **React** y **Clean Architecture** se pueden complementar para evitar que tu proyecto se convierta en un lío inextricable a medida que crece. Sí, así de simple: poner orden en el caos nunca fue tan gratificante.

## ¿Qué es React?

React es una biblioteca de JavaScript creada por Facebook para construir interfaces de usuario de forma rápida y eficiente. Su enfoque basado en **componentes reutilizables** te permite dividir la UI en piezas pequeñas, lo que facilita el mantenimiento y la escalabilidad. En pocas palabras, React es el LEGO del desarrollo web: bloques simples que, bien ensamblados, pueden dar lugar a estructuras impresionantes.

## ¿Qué es Clean Architecture?

Clean Architecture, popularizada por Robert C. Martin (aka Uncle Bob), es un conjunto de principios que te obligan a separar las responsabilidades de tu aplicación en distintas capas. La idea es aislar la lógica de negocio de detalles como la interfaz de usuario, bases de datos o frameworks. Esto no solo mejora la mantenibilidad, sino que también te permite cambiar de tecnología sin que todo se venga abajo. Es como poner tu código en un spa de organización: cada parte se cuida y se mantiene en forma.

## ¿Por qué combinar React con Clean Architecture?

Aunque a primera vista pueda parecer una combinación forzada, integrar React con Clean Architecture trae beneficios reales:

- **Organización y Escalabilidad:** Separar la lógica de negocio de la UI te permite crecer sin temor a que el código se descontrole.  
- **Facilidad de Pruebas:** Con capas bien definidas, escribir tests se vuelve menos una pesadilla y más una rutina.
- **Flexibilidad:** Al desacoplar tu aplicación, cambiar librerías o actualizar dependencias es mucho menos traumático.
- **Claridad y Mantenimiento:** Adoptar una estructura limpia desde el inicio evita el típico “spaghetti code” que hace que hasta el café parezca menos fuerte.

## Arquitecturas Tradicionales en Proyectos React

### ✅ Ventajas
- **Simplicidad Inicial:** Para proyectos pequeños, mezclar la lógica y la UI puede parecer más directo y fácil de implementar.
- **Curva de Aprendizaje Baja:** Muchos desarrolladores están acostumbrados al enfoque tradicional, lo que significa menos tiempo en aprender nuevas abstracciones.

### ⚠️ Desventajas
- **Escalabilidad Limitada:** Lo que empezó como un proyecto sencillo puede transformarse rápidamente en un desastre si no se tiene una estructura clara.
- **Acoplamiento:** La falta de separación hace que cualquier cambio en la lógica de negocio impacte directamente la UI, convirtiendo pequeños ajustes en grandes dolores de cabeza.
- **Pruebas Complicadas:** Testear componentes que mezclan lógica y presentación puede resultar en un conjunto de tests frágiles y difíciles de mantener.

## Iniciar un nuevo proyecto de React

Comenzaremos creando un proyecto de React sin ningun framework, mas bien, utilizaremos una herramienta de [Vite](https://vite.dev/) llamada [Create Vite](https://github.com/vitejs/vite/tree/main/packages/create-vite), a traves de esta utilizaremos un template de React con las carpetas tipicas.

```console
npm create vite@latest my-app --template react
```

Al ejecutar este comando obtendremos la siguiente estructura de carpetas

```plaintext
my-app/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
```

Es una estructura minimalista enfocada en el desarrollo rápido, sin convenciones estrictas.

## Cómo adaptar a Clean Architecture

La Clean Architecture se organiza en capas (dominio, aplicación, infraestructura, presentación). Una adaptación para React/Vite específicamente para Frontend podría ser:

```plaintext
src/
├── core/                  # Capa de dominio y lógica crítica
│   ├── domain/            # Entidades y modelos de negocio
│   │   └── userEntity.js  # Ej: Modelo de usuario con reglas de validación
│   ├── application/       # Casos de uso y lógica de aplicación
│   │   ├── auth/          # Ej: Lógica de autenticación
│   │   └── products/      # Ej: Reglas para manejar productos
│   └── stores/            # Manejo de estado global (Zustand)
│       └── useAuthStore.js # Ej: Store para autenticación
│
├── infrastructure/        # Adaptadores y conexiones externas
│   ├── api/               # Adaptadores de API
│   │   ├── authAdapter.js # Ej: Llamadas a endpoints de auth
│   │   └── apiClient.js   # Configuración de Axios/Fetch
│   ├── storage/           # Adaptadores de almacenamiento local
│   │   └── localStorageAdapter.js
│   └── utils/             # Herramientas específicas para infraestructura
│
├── presentation/          # Capa de UI y componentes
│   ├── components/        # Componentes reutilizables
│   │   ├── ui/            # Componentes "tontos" (buttons, cards)
│   │   └── auth/          # Componentes específicos de auth
│   ├── pages/             # Vistas/páginas
│   │   └── LoginPage.jsx
│   ├── hooks/             # Custom hooks (para lógica reutilizable de UI)
│   ├── assets/            # Estilos, imágenes, fuentes
│   │   ├── styles/
│   │   │   ├── global.js  # Estilos globales con styled-components
│   │   │   └── theme.js   # Tema para styled-components
│   │   └── tailwind.css   # Archivo base de Tailwind
│   └── layouts/           # Layouts generales (ej: DashboardLayout)
│
├── shared/                # Utilidades y código compartido
│   ├── constants/         # Constantes globales
│   ├── utils/             # Funciones helper genéricas
│   └── types/             # Tipos de TypeScript (si usas TS)
│
└── App.jsx                # Componente raíz
```

### Pasos para reorganizar
Crea las carpetas según tu arquitectura.

Mueve los archivos existentes a sus nuevas ubicaciones.

Actualiza las importaciones en los archivos (ej: `import App from './presentation/App'`).

Configura alias de Vite para evitar imports relativos:

```javascript
// vite.config.js
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
    }
  }
});
```

### Consejos clave
Usa barrel files (archivos index.js) en carpetas para simplificar imports.

Separa lógica de negocio de componentes UI (ej: usar hooks o contextos).

Mantén la capa de infraestructura desacoplada (ej: servicios API detrás de interfaces).