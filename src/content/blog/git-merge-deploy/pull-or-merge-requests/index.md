---
title: "⤴️Pull Requests (PR) / Merge Requests (MR)"
description: "Aprenderemos que significan estos conceptos, como nos ayudan a mejorar la calidad de las entregas y las practicas comunes en la mayoria de los equipos de trabajo"
author: "Alejandro Tejero GPT"
pubDate: "2025-08-31 20:45:00"
heroImage: '/git-merge-deploy/portada-pr-mr.jpg'
includeTitleInContent: false
includeInList: true
---

# ⤴️Pull Requests (PR) / Merge Requests (MR)

Ahora que ya tienes una base sólida sobre branching estratégico y git flow, es el momento ideal para entender cómo las **Pull Requests** (GitHub) o **Merge Requests** (GitLab) - que son básicamente el mismo concepto con nombres diferentes - actúan como el puente entre tu trabajo individual y el código que eventualmente llegará a producción.

<aside class="bg-blue-100 flex">
🎯

Imagínate que estás construyendo una casa con varios amigos. Cada uno trabaja en una habitación diferente (su rama o branch), pero antes de que alguien pueda conectar su habitación con el resto de la casa, necesita mostrarle a los demás lo que hizo, explicar por qué lo hizo de esa manera, y obtener la aprobación del equipo. Eso es exactamente **lo que hace una Pull Request: es como tocar a la puerta y pedir permiso para que tu trabajo se una al código principal.**

</aside>

## ¿Qué es una Pull Request realmente?

Una **Pull Request** es una solicitud formal para fusionar (merge) los cambios de tu rama de trabajo hacia otra rama, típicamente la rama principal como `main`, `develop`, o `release`. Es tu manera de decir: "Oye equipo, he terminado mi feature/bugfix/hotfix, ¿pueden revisar mi código antes de que se integre al proyecto?"

<aside class="bg-amber-50 flex flex-col">
🧠

**Pull Request y Merge Request son dos nombres para la misma idea**: proponer que tus cambios se integren a una rama principal.

- GitHub dice **Pull Request** porque piensa en "jalar" los cambios.
- GitLab dice **Merge Request** porque piensa en "fusionar" las ramas.

Pero en el fondo, **hacen lo mismo**. Solo cambia cómo describes la acción. 

---

El término "pull" puede sonar confuso al principio. No es que estés "jalando" código, sino que estás pidiendo que el mantenedor del repositorio "jale" tus cambios hacia la rama destino. Es como si fueras a un restaurante y en lugar de decir "quiero una hamburguesa", dijeras "por favor, tomen mi orden de hamburguesa" - es la perspectiva desde el punto de vista del que recibe la solicitud.

</aside>

En palabras cortas: Una persona propone cambios, otra(s) revisan, y al final se integran al proyecto principal.

Hacerlo bien es la diferencia entre un proyecto estable y un Frankenstein lleno de bugs.

## El flujo completo: De tu rama al deploy

Vamos a ver cómo encaja esto en el proceso completo (Git + Merge + Deploy):

**Paso 1: Desarrollo en tu rama**
Siguiendo git flow, digamos que estás trabajando en una `feature/nueva-funcionalidad`. **Has hecho varios commits**, has probado tu código localmente, y estás satisfecho con el resultado. Tu rama ha "divergido" de la rama principal - esto significa que mientras tú trabajabas, otros desarrolladores también hicieron cambios que ya están en `develop`.

<aside class="bg-emerald-100 flex flex-col">
✅

**Ramas limpias y con propósito**

- Nombra la rama según su objetivo:
    - `feature/agregar-login`
    - `fix/error-de-pagos`
    - `hotfix/falla-produccion`

**Commits claros y atómicos**

- Evita "fix cosas", "arreglo final", "última prueba".
- Prefiere convenciones (Estudiar [conventional commits](https://www-conventionalcommits-org.translate.goog/en/v1.0.0/?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=tc)):
    - `fix: corrige validación en formulario de usuarios`
    - `feat: agrega soporte para pago con PayPal`
</aside>

**Paso 2: Preparación para la Pull Request**
Antes de crear tu PR, es una buena práctica hacer un `git fetch` y luego un `git rebase` o `git merge` para traer los últimos cambios de la rama destino a tu rama. Esto es como asegurarte de que tu habitación se conecte perfectamente con las modificaciones que otros ya hicieron en la casa.

**Paso 3: Creación de la Pull Request**
Aquí es donde ocurre la magia del **syntactic sugar** de las plataformas como GitHub o GitLab. En lugar de ejecutar comandos git complejos, tienes una interfaz web bonita donde puedes:

- Seleccionar la rama origen (tu feature) y la rama destino (por ejemplo, develop)
- Escribir un título descriptivo
- **Agregar una descripción detallada de qué cambios hiciste y por qué**
- **Asignar revisores**
- Agregar etiquetas y milestones

## 👨‍🏫Anatomía de una buena Pull Request

Una PR bien estructurada es como un buen commit message, pero expandido. Debe responder:

**¿Qué?** - Una descripción clara de los cambios realizados
**¿Por qué?** - La justificación o el problema que resuelve
**¿Cómo?** - Detalles técnicos relevantes, especialmente si usaste algún approach no obvio

Por ejemplo:

```
Título: Implementar validación de email con regex personalizado

Descripción:
- Agregué validación del lado del cliente usando una expresión regular más estricta
- Refactoricé el componente EmailInput para separar la lógica de validación
- Incluí tests unitarios para los casos edge más comunes
- Actualicé la documentación del componente

Fixes #123
```

- Si aplica, agrega capturas de pantalla, GIFs o ejemplos de requests/responses.
- Un PR gigante de 1000 líneas es difícil de revisar y propenso a errores. Intenta dividir en PR más pequeños y fáciles de aprobar.

## ✨El proceso de Code Review

Aquí es donde el verdadero valor de las PRs brilla. El **code review** (revisión de código) no es solo buscar bugs - es un proceso de **knowledge sharing** (compartir conocimiento) y **quality assurance** (aseguramiento de calidad).

Los revisores pueden:

- Hacer comentarios línea por línea en tu código
- Sugerir mejoras o alternativas
- Solicitar cambios antes de aprobar
- Aprobar la PR si todo se ve bien
- Rechazar la PR si hay problemas fundamentales

Este proceso evita el temido **código spaghetti** - ese tipo de código enredado y difícil de mantener que surge cuando no hay suficientes ojos revisando los cambios.

- **👀 Buenas prácticas al revisar un PR/MR**
    1. **Revisión con mentalidad constructiva**
        - Señala errores, pero también reconoce soluciones bien hechas.
        - Evita comentarios tipo “esto está mal”, mejor explica *por qué*.
    2. **Verificar estándares de código**
        - Linter, convenciones de estilo y arquitectura.
        - Nombres de variables, funciones y clases claros.
    3. **Revisión funcional**
        - ¿Los cambios cumplen lo que prometen?
        - ¿Rompen algo existente? (tests automatizados deberían ayudar aquí)
    4. **Pruebas locales**
        - Si es algo crítico, baja la rama y prueba tú mismo.
        - Confía en CI/CD, pero recuerda: la máquina no lo ve todo.

## 👤 ¿Quién aprueba y quién mergea?

Esto depende del tamaño del equipo, pero estas reglas funcionan bien:

- **El autor nunca mergea su propio PR** (salvo casos de emergencia/hotfix).
- **Se necesita al menos una aprobación externa** (dos si el equipo es grande).
- El merge lo hace alguien con permisos de “maintainer” o “lead dev”.
- En equipos pequeños (2-3 personas), basta con que *otro* revise antes de aprobar.

### Estrategias de Merge

Una vez que tu PR está aprobada, tienes varias opciones para integrar los cambios, cada una con sus trade-offs:

**Merge Commit (Mas común)**: Crea un commit adicional que une las dos ramas. Mantiene todo el historial, pero puede hacer que el grafo de git se vea como un plato de spaghetti si se abusa.

**Squash and Merge**: Combina todos tus commits en uno solo antes del merge. Es como comprimir una novela en un resumen - pierdes el detalle del proceso, pero el historial queda más limpio.

**Rebase and Merge**: Reaplica tus commits sobre la rama destino sin crear un merge commit. Es como si hubieras trabajado directamente sobre la versión más reciente desde el principio.

## ⚡Mas ventajas de un PR/MR

**Automatización y CI/CD:** Aquí es donde las PRs se vuelven realmente poderosas en un contexto DevOps. Puedes configurar **Continuous Integration** para que automáticamente:

- Ejecute tus tests
- Haga análisis estático de código
- Ejecute linters
- Haga builds de prueba
- Ejecute tests de integración

Si alguno de estos checks falla, la PR se marca como "no lista para merge". Es como tener un inspector automático que revisa tu habitación antes de conectarla a la casa.

**✅Mas adelante veremos este tema mas a detalle.**

**Deployment y Feature Flags:** Después del merge, dependiendo de tu estrategia de deployment, el código puede:

- Ir directamente a producción (si mergeaste a main en un flujo de continuous deployment)
- Esperar a un release programado
- Estar disponible pero deshabilitado usando **feature flags** (banderas de características)

---

**Temas que también te pueden interesar:**

[Diferencias entre hacer merge directamente VS usar el proceso de PR/MR](pr-or-mr-vs-direct-merge/)

[Pull Requests y Merge Requests: ¿Git nativo o invención de las plataformas?](pr-mr-git-nativo-o-invencion-de-las-plataformas/)

[Ejemplo práctico de creación de PR’s/MR’s con Code Review](ejemplos-creacion-pr-mr)