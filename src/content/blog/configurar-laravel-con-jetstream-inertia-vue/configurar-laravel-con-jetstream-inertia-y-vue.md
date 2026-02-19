---
title: 'Tutorial para configurar un proyecto con Laravel + Jetstream con Inertia y Vue'
description: 'Lorem ipsum dolor sit amet'
pubDate: 'Marzo 09 2025 21:00:00'
heroImage: '/blog-placeholder-2.jpg'
---

### Creando el proyecto Laravel

Después de instalar PHP, Composer y el instalador de Laravel, estaremos listos para crear una nueva aplicación de Laravel. El instalador de Laravel le pedirá que seleccione su marco de prueba preferido, base de datos y kit de inicio:

```powershell
laravel new example-app
```

Una vez creada la aplicación, puede iniciar el servidor de desarrollo local de Laravel, el trabajador de cola y el servidor de desarrollo de Vite utilizando el script de Composer **`dev`**

```powershell
cd example-app
npm install && npm run build
composer run dev
```

Una vez que haya iniciado el servidor de desarrollo, su aplicación será accesible en su navegador web en [http://localhost:8000](http://localhost:8000/). A continuación, estará listo para las configuraciones iniciales de laravel, no se preocupe, es realmente sencillo y rápido:

[Laravel - The PHP Framework For Web Artisans](https://laravel.com/docs/11.x/installation#initial-configuration)

## Agregando Jetstream e InertiaJS

Jetstream es un paquete oficial de Laravel que proporciona un andamiaje (scaffolding - generación automática de archivos que sirven como base para trabajar nuestro proyecto) **para la autenticación y la gestión de usuarios** en aplicaciones Laravel.  Está diseñado para simplificar la configuración de funcionalidades como el **registro, inicio de sesión, verificación de correo electrónico, recuperación de contraseña y gestión de perfiles de usuario.**

Este puede ser instalado desde que creamos la aplicación de Laravel desde la linea de comandos ya que al crear la aplicación con`laravel new example-app` el asistente de instalación nos preguntara si queremos instalarlo, nos preguntara si lo usaremos con Liveware o Inertia JS y unas cuantas cosas mas, sin embargo si solo instalamos Laravel o si tenemos un proyecto que ya esta avanzado (Leer advertencias mas abajo), entonces lo podemos agregar manualmente:

[Installation | Laravel Jetstream](https://jetstream.laravel.com/installation.html)

## Instalando Jetstream

```powershell
composer require laravel/jetstream
```

Después de instalar el paquete Jetstream, puede ejecutar el comando Artisan **`jetstream:install`**. Este comando acepta el nombre de la pila que prefiera (**`livewire`** o **`inertia`**). Además, puede usar el modificador **`--teams`** para habilitar el soporte de equipo.

**Se recomienda encarecidamente leer toda la documentación de [Livewire](https://livewire.laravel.com/) o [Inertia](https://inertiajs.com/) antes de comenzar su proyecto Jetstream.**

<aside>
⚠️

**Solo aplicaciones nuevas:** Jetstream solo debe instalarse en aplicaciones nuevas de Laravel. Intentar instalar Jetstream en una aplicación Laravel existente provocará problemas y comportamientos inesperados.

</aside>

Como se mencionó anteriormente, en este post haremos uso de esta biblioteca junto con Inertia JS, así que los scripts que nos interesan son los siguientes:

### Instalar Jetstream + Inertia + Vue JS

```powershell
# standalone
php artisan jetstream:install inertia

# con soporte para "teams"
php artisan jetstream:install inertia --teams
```

### Finalizando la instalación

Después de instalar Jetstream, debe instalar y crear sus dependencias de NPM y migrar su base de datos:

```powershell
npm install
npm run build
php artisan migrate
```

La pila Inertia que ofrece Jetstream utiliza Vue.js como lenguaje de plantillas. Crear una aplicación Inertia es muy parecido a crear una aplicación Vue típica; sin embargo, utilizará el enrutador de Laravel en lugar del enrutador Vue. Inertia es una pequeña biblioteca que le permite renderizar componentes Vue de un solo archivo desde su backend de Laravel proporcionando el nombre del componente y los datos que se deben hidratar en las "props" de ese componente.

En otras palabras, esta pila le brinda toda la potencia de Vue.js sin la complejidad del enrutamiento del lado del cliente. La pila Inertia es una excelente opción si se siente cómodo y disfruta de usar Vue.js como lenguaje de plantillas. Al usar Inertia, las rutas de su aplicación responderán renderizando una "página" de Inertia.