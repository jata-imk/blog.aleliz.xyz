---
title: 'Instalar herramientas base'
description: 'Lorem ipsum dolor sit amet'
pubDate: 'Marzo 09 2025 20:30:00'
heroImage: '/blog-placeholder-2.jpg'
---

# Programas base

En los programas base encontraremos los que instalamos directamente en nuestro sistema operativo, aqui se encuentran:

- Lenguaje de programación y su manejador de paquetes
- Motor de base de datos
- Node y NPM para compilar los archivos del frontend.

<aside class="bg-amber-50">
⚠️

Después de ejecutar uno de los comandos anteriores, debe reiniciar su sesión de terminal. Para actualizar PHP, Composer y el instalador de Laravel después de instalarlos mediante php.new, puede volver a ejecutar el comando en su terminal.

</aside>

<br>

## Instalar PHP, Composer y Laravel

Con el siguiente script instalaremos PHP 8.3 en nuestros sistemas:

**Windows (PowerShell)**

```powershell
# Run as administrator...
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.3'))
```

**Linux**

```powershell
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.4)"
```

Si ya tenemos PHP y Composer y solamente queremos el instalador de laravel:

```powershell
composer global require laravel/installer
```

## Cómo descargar MySQL para Windows

Vamos a **descargar MySQL para Windows** visitando la página oficial de MySQL, donde acabaremos llegando a la [~~página de descarga~~](https://dev.mysql.com/downloads/mysql/) de la Comunidad de MySQL. Allí podremos descargar MySQL Community Server para Windows, que podremos usar libremente para nuestros proyectos. Este es un instalador MSI así que lo único que haremos será darle click en siguiente → siguiente varias veces.

Si lo necesitamos en un servidor linux que tenga por ejemplo CentOs 9:

https://www.hostinger.mx/tutoriales/instalar-mysql-centos

## Instalar NodeJS y NPM

### Método tradicional

1. Visita la página oficial de Node.js: [https://nodejs.org](https://nodejs.org/)
2. Descarga la versión LTS (Long Term Support)
3. Ejecuta el instalador descargado
4. Sigue los pasos del asistente de instalación
5. Verifica la instalación abriendo PowerShell y ejecutando:
    
    ```powershell
    node --version
    npm --version
    ```
    

### Metodo con FNM (Fast Node Manager)

1. Abre PowerShell como administrador
2. Instala Scoop (gestor de paquetes para Windows):
    
    ```powershell
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
    irm get.scoop.sh | iex
    ```
    
3. Instala FNM usando Scoop:
    
    ```powershell
    scoop install fnm
    ```
    
4. Agrega FNM a tu perfil de PowerShell:
    
    ```powershell
    fnm env --use-on-cd | Out-String | Invoke-Expression
    ```
    
5. Para que FNM se cargue automáticamente, agrega estas líneas a tu perfil de PowerShell:
    
    ```powershell
    # Abre tu perfil
    notepad $PROFILE
    
    # Agrega esta línea
    fnm env --use-on-cd | Out-String | Invoke-Expressio
    ```
    

### Comandos básicos

```powershell
# Listar versiones disponibles de Node.js
fnm ls-remote

# Instalar una versión específica
fnm install 16.14.0

# Usar una versión específica
fnm use 16.14.0

# Listar versiones instaladas
fnm ls

# Establecer una versión por defecto
fnm default 16.14.0
```

### Verificación

Para asegurarte de que todo está funcionando correctamente:

```powershell
fnm --version
node --version
npm --version
```

### Solución de problemas comunes

- Si FNM no es reconocido como comando, reinicia PowerShell
- Si hay problemas con los permisos, asegúrate de ejecutar PowerShell como administrador
- Para problemas de ejecución de scripts, verifica la política de ejecución con `Get-ExecutionPolicy`