---
title: "🔀 Branching estratégico 🌿"
description: "Hay varios flujos de trabajo de Git publicados que pueden ser adecuados para tu equipo. Aquí hablaremos sobre algunas de estas opciones de flujo de trabajo de Git."
author: "Alejandro Tejero GPT"
pubDate: "2025-08-31 20:30:00"
heroImage: '/git-merge-deploy/portada-branching-estrategico.jpg'
includeTitleInContent: false
includeInList: true
---

El **branching estratégico** es como la arquitectura vial de tu proyecto: si todos manejan por cualquier calle sin reglas, habrá choques y caos. Así que vamos a ver los modelos más usados y cuándo conviene uno u otro.
****

### 🧱 1. Git Flow (el clásico)

Fue propuesto por Vincent Driessen y es ideal para proyectos con:

- Versiones planificadas.
- Equipos medianos o grandes.
- Necesidad de mantenimiento en paralelo a nuevas features.

**Branches típicos:**

- `main`: el código en producción.
- `develop`: el código listo para el próximo release (lo que sería staging).
- `feature/xxx`: una rama para cada nueva funcionalidad.
- `release/x.y.z`: para estabilizar una versión antes de ir a producción.
- `hotfix/x.y.z`: parches urgentes sobre producción.

🔧 **Ventajas:**

- Estructurado.
- Permite trabajar en paralelo sin miedo.
- Buen control para releases formales.

🔥 **Desventajas:**

- Mucho "ceremonial".
- Puede ser overkill para equipos pequeños o proyectos de deploy continuo.

---

### 🚂 2. Trunk-Based Development (tryhard)

Acá todos trabajan sobre una sola rama (`main`, `trunk`, o como le digas), con ramas temporales muy cortas (a veces ni siquiera existen).

Usado por empresas que hacen **deploys múltiples al día** como Google o Facebook.

🔧 **Ventajas:**

- Simplifica el flujo.
- Promueve integración continua real.
- Menos conflictos por ramas viejas o divergentes.

🔥 **Desventajas:**

- Necesita tests automatizados **robustos**.
- Puede generar bugs en producción si no se hace bien.

---

### 🧪 3. Modelo híbrido (GitHub Flow / Simplified Flow)

Es lo más común en startups y equipos medianos: una mezcla de Git Flow y Trunk-Based.

- `main`: producción.
- `dev` o `staging`: entorno de pruebas previo a producción.
- `feature/xxx`: ramas de corto ciclo.
- A veces se usa `release/x.y.z`, pero no es obligatorio.

🔧 **Ventajas:**

- Balance entre control y velocidad.
- Requiere poca infraestructura para funcionar.

🔥 **Desventajas:**

- Si no hay convenciones claras, puede volverse un desastre.

El principio clave de GitHub Flow / Simplified Flow es que la rama `main` siempre está en un estado deployable, lo que significa que una vez fusionados, los cambios pueden implementarse en producción casi inmediatamente.

<aside class="bg-blue-100 flex flex-col">
📖

### ¿Qué es el corto ciclo exactamente?

**Corto ciclo = Tiempo entre creación y eliminación de la rama**

El flujo típico es:

1. **Crear** la rama desde main/develop
2. **Desarrollar** tu funcionalidad (Commits + Push a remoto)
3. **Hacer merge** a la rama principal (Directo o mas recomendado a traves de PR/MR)
4. (Si see utiliza PR/MR) Responder a los comentarios y realizar los ajustes necesarios según la revisión del código. Enviar las correcciones a la rama remota.
5. **Eliminar** la rama (sí, se puede y se debe hacer)
    
    ```bash
    # Eliminar rama local
    git branch -d nombre-rama
    
    # Eliminar rama remota
    git push origin --delete nombre-rama
    
    # O en GitHub/GitLab via interfaz web
    ```
    
    **¿Por qué eliminar?**
    
    - Mantiene limpio el repositorio
    - Evita confusión con ramas obsoletas
    - Es una buena práctica en equipos
    
    ## ¿Puedo hacer checkout después de eliminarla?
    
    **¡Aquí está lo importante!** Una vez que haces merge, **NO necesitas la rama**:
    
    - Los **commits** quedan en el historial de la rama principal
    - Puedes hacer `git log` y ver todos los cambios
    - Puedes hacer `checkout` a cualquier commit específico
    - El código ya está integrado en main/develop
    
    **Ejemplo práctico:**
    
    ```bash
    # Tu rama ya merged y eliminada
    git log --oneline  # Ves todos los commits
    git checkout abc123  # Puedes ir a cualquier commit específico
    ```
    
    ## ¿Qué pasa si necesito "regresar en el tiempo"?
    
    Tienes varias opciones:
    
    - `git revert` para deshacer cambios
    - `git checkout commit-hash` para explorar el estado anterior
    - `git reset` si necesitas retroceder completamente
    
    La rama desaparece, pero **el historial y los cambios permanecen**. ¿Te queda más claro ahora?
</aside>

Actualmente trabajo en un proyecto mediano que apunta para ser grande entonces en el equipo de desarrollo creemos que lo mejor es utilizar **Git Flow**, por lo que para despejar aun mas dudas si llegaran a quedar dejo una entrada explicando cual seria el flujo típico de una feature con esta metodología:

[Flujo básico de una **feature** usando Git Flow (con ejemplos vanilla)](flujo-basico-de-una-feature-usando-git-flow/)