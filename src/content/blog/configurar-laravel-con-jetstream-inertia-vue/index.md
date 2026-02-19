---
title: 'Crear un proyecto con PHP + MySQL + Laravel + Jetstream + Inertia + Vue JS'
description: 'Lorem ipsum dolor sit amet'
pubDate: 'Marzo 09 2025 19:30:00'
heroImage: '/blog-placeholder-2.jpg'
---

## Introducción

En muchas ocasiones hemos querido iniciar proyectos rápidamente sin embargo al momento de comenzar a configurar nuestro entorno nos abrumamos con la cantidad de recursos que hay, tantos lenguajes de programación, diversos motores de bases de datos, patrones de arquitecturas de software, tantos frameworks tanto para Backend asi como para Frontend, en fin, si no tenemos mucha experiencia podemos pasar horas y hasta días para elegir una sola herramienta de tantas, es por eso que en esta entrada voy a explicar como configurar rápidamente un proyecto listo para empezar a programar la lógica de nuestro negocio sin preocuparnos tanto por la elección de herramientas de software, de manera general este stack funciona increíble aunque ciertamente existirán mejores dependiendo de la situación, no nos estamos cerrando a un solo stack si no todo lo contrario, que cada vez sea mas fácil la configuración inicial del proyecto y así podamos probar tantos stacks como podamos. Comencemos 🚀.

### Herramientas base 🔨⛏️

Las herramientas base son aquellos programas fundamentales que necesitamos tener instalados en nuestro sistema operativo antes de comenzar cualquier desarrollo. Estas herramientas son el núcleo sobre el cual construiremos nuestras aplicaciones y, a diferencia de los frameworks y librerías que usaremos más adelante, son programas compilados que instalamos directamente en nuestro sistema.

En este contexto, nuestras herramientas base son:

- **PHP:** El lenguaje de programación principal que ejecutará nuestro código del lado del servidor.
- **MySQL:** Nuestro sistema gestor de bases de datos relacionales donde almacenaremos la información.
- **Composer:** El gestor de dependencias de PHP que nos permitirá instalar y administrar los paquetes y frameworks que necesitemos.
- **NPM:** El gestor de paquetes de Node.js que utilizaremos para manejar las dependencias del frontend y las herramientas de desarrollo.

Es importante diferenciar estas herramientas base de los frameworks y librerías que instalaremos posteriormente. Mientras que las herramientas base son programas precompilados que instalamos una sola vez en nuestro sistema, los frameworks y librerías son código fuente que podemos examinar, modificar y adaptar según nuestras necesidades específicas de desarrollo.

[Instalar herramientas base](./instalar-herramientas-base)

### Instalar Framework y Librerías 📚🔖

Una vez que tenemos lista la base de nuestro sistema operativo (Linux o Windows) seguiremos con la parte mas tangible de nuestro proyecto, la cual es la de instalar el Framework que en este caso es Laravel y las librerías adicionales sobre las cuales escribiremos código directamente.

Existen muchos stacks tanto en el mismo PHP como en los diferentes lenguajes de programación, pero creo este es un excelente grupo de tecnologías con las que podremos hacer proyectos muy robustos, es bastante eficiente y si necesitamos SSR en un futuro también podremos agregárselo. Asi que sin mas comencemos con la instalación 💪⚡💻

[Tutorial para configurar un proyecto con Laravel + Jetstream con Inertia y Vue](./configurar-laravel-con-jetstream-inertia-y-vue) 

## Comentarios finales

Es así que con las anteriores guías podremos tener un stack muy completo para hacer las tareas mas comunes en muchos proyectos, claro esta aun queda mucho por hacer ya que solamente hemos configurado las bases sobre la cual integraremos lógica de negocio, aplicaciones de terceros, servicios, adaptadores, nos la ingeniaremos para crear UI’s intuitivas, rápidas pero sobre todo funcionales, etc.