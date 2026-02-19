---
title: "Pull Requests y Merge Requests: ¿Git nativo o invención de las plataformas?"
description: "Historia de los Pull Requests"
author: "Alejandro Tejero GPT"
pubDate: "2025-08-31 21:00:00"
heroImage: '/git-merge-deploy/plataformas-git.jpg'
includeTitleInContent: false
includeInList: true
---

Aquí tienes una revelación importante: las **Pull Requests y Merge Requests no son parte de Git nativo**. Git es una herramienta de línea de comandos que se diseñó originalmente para el desarrollo del kernel de Linux, donde Linus Torvalds y su equipo necesitaban una forma distribuida de manejar contribuciones de miles de desarrolladores alrededor del mundo.

Git nativo solo conoce comandos como `git merge`, `git rebase`, `git push`, y `git pull`. No tiene concepto alguno de "solicitar" un merge o de "revisar código" de manera visual. Es como si Git fuera el motor de un automóvil - muy poderoso y funcional, pero sin tablero, volante o pedales. Las plataformas como GitHub, GitLab, y Bitbucket son los que agregaron toda la interfaz de usuario y los procesos de colaboración encima de Git.

La genialidad de estas plataformas fue darse cuenta de que aunque Git era increíblemente potente para el control de versiones, la experiencia de colaboración humana necesitaba algo más amigable que intercambiar emails con parches de código (que era como se hacía originalmente en el desarrollo del kernel de Linux).

GitHub introdujo el concepto de "Pull Request" alrededor del 2008, y GitLab posteriormente creó "Merge Request" que es funcionalmente idéntico pero con un nombre que muchos consideran más intuitivo. BitBucket, Azure DevOps, y otras plataformas adoptaron variaciones similares del mismo concepto.

## Branch Protection: La evolución de la seguridad en repositorios

Las **branch protection rules también son una invención de las plataformas**, no de Git nativo. Git por sí mismo es bastante "anárquico" en el buen sentido - confía en que los desarrolladores saben lo que están haciendo y les da total libertad para hacer prácticamente cualquier operación.

Esta filosofía funcionaba perfectamente en los primeros días cuando los equipos eran pequeños y todos se conocían entre sí. Pero imagínate lo que pasaría en una empresa con cientos de desarrolladores si cualquiera pudiera hacer `git push --force origin main` y reescribir completamente la historia del proyecto principal. Sería como darle las llaves del edificio a todos los empleados sin ningún tipo de control de acceso.

Las plataformas modernas implementaron branch protection como una capa de **policy enforcement** (aplicación de políticas) que actúa como middleware entre los comandos git del desarrollador y el repositorio real. Cuando intentas hacer push a una rama protegida, la plataforma intercepta tu comando y verifica si cumples con las reglas establecidas antes de permitir que la operación se complete.

Estas reglas pueden incluir aspectos como requerir que cierto número de revisores aprueben los cambios, que todos los checks de integración continua pasen exitosamente, que no haya conversaciones sin resolver en la Pull Request, o incluso que ciertas personas específicas (como arquitectos senior o tech leads) hayan dado su visto bueno.

## Cómo funciona la protección de ramas en la práctica

Déjame ilustrarte con un ejemplo concreto de cómo se comporta esto. Supongamos que tienes una rama `main` con las siguientes reglas de protección habilitadas:

Primero, la regla requiere que cualquier cambio pase por una Pull Request - no se permiten pushes directos. Segundo, al menos dos desarrolladores deben revisar y aprobar el código antes del merge. Tercero, todos los tests automatizados deben pasar sin errores. Y finalmente, no debe haber merge conflicts sin resolver.

Si intentaras ejecutar tu secuencia original de comandos directamente contra esta rama protegida, esto es lo que sucedería:

```bash
git checkout main                    # Esto funciona normalmente
git merge --no-ff feature/mi-rama    # Esto también funciona localmente
git push origin main                 # ¡AQUÍ es donde se bloquea!
```

El comando `git push` fallaría con un mensaje similar a "remote: error: GH006: Protected branch update failed. Branch protection rules prevent pushes to this branch." La plataforma literalmente rechaza tu push porque no siguiste el proceso establecido.

## La arquitectura detrás de la magia

Para entender mejor cómo funciona esto técnicamente, piensa en las plataformas como servidores proxy inteligentes que se sitúan entre tu cliente git local y el repositorio real. Cuando ejecutas un comando git que interactúa con el servidor remoto (como push, pull, clone), no estás hablando directamente con Git - estás hablando con el software de la plataforma, que a su vez maneja un repositorio Git real.

Esta arquitectura les permite a las plataformas implementar funcionalidades que van mucho más allá de lo que Git puede hacer nativamente. Pueden mantener bases de datos de metadatos sobre Pull Requests, sistemas de notificaciones, integraciones con herramientas de CI/CD, y toda la lógica de business rules que hace que el desarrollo colaborativo moderno sea posible.

Es importante entender que aunque estas características no son parte de Git nativo, se han vuelto tan fundamentales en el desarrollo moderno que prácticamente no puedes imaginar trabajar sin ellas. Es como el GPS en los automóviles - técnicamente el carro puede funcionar sin él, pero hoy en día es considerado esencial para la experiencia completa.

## Implicaciones para tu workflow de DevOps

Esta comprensión tiene implicaciones importantes para cómo piensas sobre tu pipeline de desarrollo. Cuando diseñas tu estrategia de branching y deployment, no solo estás pensando en comandos Git, sino también en cómo aprovechar las capacidades de la plataforma que estés usando.

Por ejemplo, puedes configurar que ciertos tipos de cambios (como updates de documentación) requieran menos revisiones que cambios en código crítico de seguridad. O puedes establecer que los deployment a producción solo puedan hacerse desde ciertas ramas y solo después de que pasen suites específicas de tests de integración.