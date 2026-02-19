---
title: "Flujo básico de una feature usando Git Flow (con ejemplos vanilla)"
description: "Ejemplos con codigo de un flujo de trabajo colaborativo usando git flow"
author: "Alejandro Tejero GPT"
pubDate: "2025-08-31 20:35:00"
heroImage: '/git-merge-deploy/flujo-de-trabajo-centralizado.jpg'
includeTitleInContent: false
includeInList: true
---

# Flujo básico de una feature usando Git Flow (con ejemplos vanilla)

Gitflow puede utilizarse en proyectos que tienen un ciclo de publicación programado, así como para la [práctica recomendada de DevOps](https://www.atlassian.com/es/devops/what-is-devops/devops-best-practices) de [entrega continua](https://www.atlassian.com/es/continuous-delivery)

## **Funcionamiento**

### **Ramas principales y de desarrollo**

En lugar de una única rama `main`, este flujo de trabajo utiliza dos ramas para registrar el historial del proyecto. La rama `main` o principal almacena el historial de publicación oficial y la rama `develop` o de desarrollo sirve como rama de integración para las funciones. Asimismo, conviene etiquetar todas las confirmaciones de la rama `main` con un número de versión.

En el siguiente ejemplo se trabaja en una nueva funcionalidad para listar logs de usuarios

**Iniciar Git Flow (si no está inicializado)**

```bash
# con la extension git flow
git flow init

# sin la extension
git branch develop
git push -u origin develop

git checkout develop
```

**Crear una rama de feature desde `develop`**

```bash
# con la extension git flow
git flow feature start logs-de-usuario

# sin la extension
git checkout develop                     # Cambia a la rama develop
git pull origin develop                  # Sincroniza con el remoto
git checkout -b feature/logs-de-usuario  # Crea la rama de feature
```

- Esto crea una rama `feature/logs-de-usuario` basada en `develop`.

<aside>
💡

En la mayoría de los escenarios de equipo, especialmente con metodologías como Git Flow o Feature Branch Workflow, la práctica estándar es **empujar las ramas de feature al repositorio remoto**.

**`git push -u origin feature/nombre-de-la-feature` (¡Aquí la diferencia!)** - Subes tu rama de feature al remoto. Puedes hacer esto varias veces mientras trabajas para tener respaldo y permitir la visibilidad.

</aside>

### **Ejemplo visual de las ramas**

Antes de `git flow init`:

```
main
```

Después de `git flow init`:

```
main
develop
```

Y luego al crear features:

```
main
develop
  → feature/logs-de-usuario
```

**Trabajar en la feature (ejemplo de comandos durante el desarrollo)**

```bash
# Hacer cambios en los archivos...
git add src/utils/userLogs.js src/components/UserLogs.astro
git commit -m "Agrega servicio de logs de usuario"
git add tests/userLogs.test.js
git commit -m "Añade tests para los logs de usuario"

```

**Sincronizar con `develop` (opcional, si hay cambios nuevos en `develop`)**

```bash
git checkout develop
git pull origin develop
git checkout feature/logs-de-usuario
git merge develop
# Resuelve conflictos si los hay
```

**Finalizar la feature (merge a `develop`)**

```bash
# con la extension git flow
git flow feature finish logs-de-usuario

# sin la extension
git checkout develop                       # Vuelve a develop
git merge --no-ff feature/logs-de-usuario  # Fusiona la feature
git branch -d feature/logs-de-usuario      # Borra la rama local
git push origin develop                    # Sube los cambios
```

- Este comando:
    1. Fusiona `feature/logs-de-usuario` en `develop`.
    2. Elimina la rama de feature.
    3. Te regresa a la rama `develop`.

**Publicar cambios en el repositorio remoto**

```bash
git push origin develop
```

### **Diagrama visual del flujo**

```
master
   ↑
release/* (opcional)
   ↑
develop ← feature/logs-de-usuario (mergeado)
```

![Representación del flujo final de feature/log_de_usuarios](/git-merge-deploy/git-flow-feature-example.jpg)

<p class="text text-sm text-center italic text-gray-400">Representación del flujo final de feature/log_de_usuarios</p>

---

### **Comandos adicionales útiles**

**Si necesitas subir la rama de feature al repositorio remoto** (para colaboración):

```bash
git flow feature publish logs-de-usuario

# O manualmente:
git push origin feature/logs-de-usuario

```

**Si hay conflictos al finalizar la feature**:

```bash
# Resuelve conflictos manualmente, luego:
git add .
git commit -m "Resuelve conflictos en logs-de-usuario"
git flow feature finish logs-de-usuario

```

**Para cancelar una feature** (en caso de abandonar el desarrollo):

```bash
git flow feature delete logs-de-usuario
```

---

### **Notas importantes**

1. **Convención de nombres**: Las ramas de feature siguen el formato `feature/nombre-de-feature` (en kebab-case).
2. **Recomendación**: Usa `git flow feature finish` en lugar de hacer merge manual para mantener la consistencia del flujo.
3. **Herramientas gráficas**: Si prefieres una interfaz, herramientas como **Sourcetree** o **GitKraken** soportan Git Flow. De cualquier forma en el enlace siguiente se encuentran muchos mas clientes con interfaz grafica directamente en el sitio oficial de Git:
    
    [Git - GUI Clients](https://git-scm.com/downloads/guis?os=linux)
    

| **Acción** | **Con `git-flow`** | **Con Git puro** |
| --- | --- | --- |
| Iniciar feature | **`git flow feature start logs-de-usuario`** | **`git checkout -b feature/logs-de-usuario`** |
| Publicar feature | **`git flow feature publish`** | **`git push -u origin feature/logs-de-usuario`** |
| Finalizar feature | **`git flow feature finish`** | **`git merge --no-ff`** + **`git branch -d`** |