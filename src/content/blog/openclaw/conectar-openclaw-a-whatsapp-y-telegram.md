---
title: 'Conectar OpenClaw a WhatsApp y Telegram: De "Channel Config Unavailable" a Chatear con tu Langosta 🦞💬'
description: "Guía para conectar OpenClaw con WhatsApp (vía Baileys) y Telegram (Bot API). Cubre la arquitectura de canales, configuración del JSON, vinculación por QR, pairing de seguridad y troubleshooting."
author: "Alejandro Tejero OpenClaw"
pubDate: "2026-02-20 00:00:00"
heroImage: "/openclaw/conectar-openclaw-a-whatsapp-y-telegram.jpg"
includeTitleInContent: false
includeInList: true
---

# ¿Qué es un Canal en OpenClaw?

Antes de meter mano, entendamos la arquitectura. OpenClaw funciona como un **message router** (enrutador de mensajes) con un patrón conocido como **Gateway Pattern**: un solo proceso central (el Gateway) recibe y envía mensajes a través de múltiples plataformas de chat simultáneamente. Cada plataforma conectada se llama un **channel** (canal).

Piénsalo como un switch de red pero para mensajería: WhatsApp, Telegram, Discord, Slack, Signal, iMessage, Microsoft Teams — todos llegan al mismo gateway, que los procesa con el modelo de IA que hayas configurado y responde por el mismo canal por donde llegó el mensaje.

Los canales disponibles actualmente incluyen: WhatsApp (vía protocolo Baileys), Telegram (Bot API), Discord (bot token), Slack, Signal, iMessage (vía BlueBubbles bridge), Microsoft Teams, Google Chat, Matrix y más.

> En _syntactical sugar_ de arquitectura: OpenClaw implementa un **fan-in/fan-out messaging pattern** donde el Gateway actúa como un **message broker** entre N canales de entrada y un agente de IA.

---

# El Error: "Channel config schema unavailable" 🚫

Si intentas mostrar el QR de WhatsApp desde el dashboard o ejecutas un comando de canales y ves este error, no te asustes — es el equivalente a intentar hacer `git push` sin haber hecho `git init` primero. OpenClaw simplemente no tiene configuración de ningún canal todavía.

El archivo `openclaw.json` (que vive en `~/openclaw/data/openclaw.json` en nuestra instalación Docker) es el **single source of truth** (la fuente única de verdad) de toda la configuración. Si no tiene una sección `"channels"`, el gateway no sabe que quieres usar WhatsApp, Telegram o cualquier otro canal — y te lanza ese error.

La solución es agregar la configuración del canal manualmente al JSON o usar el wizard interactivo. Veremos ambos métodos.

---

# Opción 1: WhatsApp — El Canal más Popular (y el más Delicado) 📱

WhatsApp es el canal favorito de la comunidad OpenClaw porque, bueno, es la app de mensajería que todo el mundo ya tiene. Pero tiene sus _gotchas_ porque la integración se basa en **Baileys**, una implementación _reverse-engineered_ (ingeniería inversa) del protocolo WhatsApp Web Multi-Device.

## ¿Cómo funciona por debajo?

Cuando vinculas WhatsApp con OpenClaw, es exactamente lo mismo que vincular WhatsApp Web en tu navegador:

- Tu teléfono sigue siendo el **dispositivo primario**
- OpenClaw actúa como un **companion device** (dispositivo acompañante) — uno más de los 4 que WhatsApp permite tener vinculados simultáneamente
- Los mensajes fluyen por los servidores de WhatsApp como siempre — OpenClaw solo intercepta los entrantes, los procesa con tu IA, y envía la respuesta de vuelta
- Tu teléfono **debe permanecer online** — si se desconecta por más de ~14 días, WhatsApp desvincula la sesión automáticamente

**Importante**: Baileys NO es la API oficial de WhatsApp Business (esa requiere aprobación de Meta, una empresa registrada, y cobra por conversación). Baileys es gratuito y funciona con cualquier cuenta personal, pero al ser ingeniería inversa, Meta podría restringir tu cuenta si detecta comportamiento automatizado agresivo. Úsalo con moderación y sentido común.

## Paso 1: Agregar la configuración de WhatsApp al JSON

Conéctate a tu VPS por SSH y edita el archivo de configuración:

```bash
nano ~/openclaw/data/openclaw.json
```

Agrega la sección `"channels"` al JSON. Tu archivo debería quedar algo así:

```json
{
  "commands": {
    "native": "auto",
    "nativeSkills": "auto"
  },
  "gateway": {
    "bind": "lan",
    "auth": {
      "mode": "token",
      "token": "TU_TOKEN_AQUI"
    }
  },
  "channels": {
    "whatsapp": {
      "selfChatMode": true,
      "dmPolicy": "pairing",
      "allowFrom": ["+521234567890"]
    }
  },
  "meta": {
    "lastTouchedVersion": "...",
    "lastTouchedAt": "..."
  }
}
```

Desglose de cada campo:

- `"selfChatMode": true` — Permite que te envíes mensajes a ti mismo para hablar con el bot (útil para testing sin necesitar otro número)
- `"dmPolicy": "pairing"` — Política de seguridad para mensajes directos. Hay 4 opciones:
  - `"pairing"` (recomendado): Cuando un desconocido te envía un DM, recibe un código de pairing que tú debes aprobar desde el CLI. Es el equivalente a un _handshake_ de seguridad.
  - `"allowlist"`: Solo los números en `"allowFrom"` pueden hablar con el bot. Todo lo demás se ignora silenciosamente.
  - `"open"`: Cualquiera puede hablar con el bot. **No recomendado** a menos que sepas exactamente lo que haces — es como dejar el puerto 22 sin firewall.
  - `"disabled"`: Ignora todos los DMs entrantes.
- `"allowFrom"` — Lista blanca de números en formato internacional (con código de país). Funciona en conjunto con `dmPolicy`.

Guarda el archivo (`Ctrl+O`, `Enter`, `Ctrl+X` en nano).

## Paso 2: Reiniciar el Gateway

Para que OpenClaw cargue la nueva configuración:

```bash
cd ~/openclaw
docker compose down && docker compose up -d --force-recreate
```

Espera unos 15 segundos y verifica que el contenedor está corriendo:

```bash
docker ps
```

## Paso 3: Vincular WhatsApp (escanear QR)

Este es el paso clave. Necesitas ejecutar el comando de login de canales **dentro del contenedor** con terminal interactiva (el `-it` es crucial para que puedas ver el QR):

```bash
docker exec -it openclaw-gateway node dist/index.js channels login
```

Si te pide seleccionar un canal, elige WhatsApp. Verás un **código QR** renderizado en ASCII en tu terminal.

Ahora, en tu teléfono:

1. Abre **WhatsApp**
2. Ve a **Configuración** (o Settings)
3. Toca **Dispositivos vinculados** (Linked Devices)
4. Toca **Vincular un dispositivo** (Link a Device)
5. Escanea el QR de tu terminal **rápidamente** — los QR expiran en ~60 segundos

Si el QR expira antes de que lo escanees, no hay drama — ejecuta el comando de login de nuevo para generar uno nuevo.

Cuando el escaneo sea exitoso, verás algo como `WhatsApp linked successfully` o `device linked, session saved` en la terminal.

**Tip para VPS headless**: Si estás conectado por SSH y tu terminal es pequeña, el QR puede verse distorsionado. Intenta maximizar la ventana de PuTTY/terminal antes de ejecutar el comando, o reduce el tamaño de fuente temporalmente.

## Paso 4: Reiniciar el Gateway (post-vinculación)

Después de vincular, reinicia el gateway para que establezca la conexión de WhatsApp:

```bash
cd ~/openclaw
docker compose down && docker compose up -d --force-recreate
```

Verifica en los logs que WhatsApp está conectado:

```bash
docker compose logs --tail=20
```

Deberías ver mensajes indicando que la conexión de WhatsApp se estableció correctamente.

## Paso 5: Aprobar el Pairing (si usas dmPolicy: pairing)

Si configuraste `"dmPolicy": "pairing"` (recomendado), cuando envíes tu primer mensaje al bot desde WhatsApp, recibirás un código de pairing en vez de una respuesta. Para aprobarlo, necesitas el mismo truco de loopback que usamos para el device pairing:

**1. Cambiar bind a loopback temporalmente:**

```bash
nano ~/openclaw/data/openclaw.json
```

Cambia `"bind": "lan"` a `"bind": "loopback"`. Guarda.

**2. Reiniciar:**

```bash
cd ~/openclaw
docker compose down && docker compose up -d --force-recreate
```

**3. Aprobar el pairing:**

```bash
docker exec openclaw-gateway node dist/index.js pairing approve whatsapp CODIGO_RECIBIDO
```

Donde `CODIGO_RECIBIDO` es el código que te llegó al WhatsApp.

**4. Volver a cambiar bind a lan:**

```bash
nano ~/openclaw/data/openclaw.json
```

Cambia `"bind": "loopback"` de vuelta a `"bind": "lan"` y reinicia:

```bash
docker compose down && docker compose up -d --force-recreate
```

Ahora envía un mensaje desde WhatsApp — si tienes un modelo de IA configurado, deberías recibir respuesta. 🎉

## Credenciales y Persistencia

Las credenciales de la sesión de WhatsApp se guardan en:

```
~/openclaw/data/credentials/whatsapp/
```

Estas credenciales son **sensibles** — trátelas como contraseñas. Cualquiera que tenga acceso a estos archivos puede leer y enviar mensajes desde tu cuenta de WhatsApp. OpenClaw reconecta automáticamente usando estas credenciales guardadas cada vez que el gateway se reinicia, así que **no necesitas re-escanear el QR** a menos que WhatsApp desvincule la sesión.

## Troubleshooting: Problemas Comunes con WhatsApp

- **El QR no aparece o se ve corrupto**: Agranda tu terminal. Si estás en PuTTY, ve a Settings → Window → Columns y ponlo en al menos 120.
- **"Session closed" después de unos días**: Tu teléfono estuvo offline demasiado tiempo. Re-vincula con `channels login`.
- **Mensajes no llegan**: Verifica que el gateway esté corriendo (`docker ps`) y revisa los logs (`docker compose logs --tail=30`). Si ves errores de conexión, puede ser un problema de red o de rate limiting de WhatsApp.
- **"Account restricted"**: WhatsApp detectó comportamiento automatizado. Reduce la frecuencia de mensajes y evita enviar a muchos contactos desconocidos. Baileys tiene rate limiting incorporado pero no es infalible.
- **Re-vincular desde cero**: Si todo falla, borra las credenciales y re-escanea:

```bash
rm -rf ~/openclaw/data/credentials/whatsapp/
docker compose down && docker compose up -d --force-recreate
docker exec -it openclaw-gateway node dist/index.js channels login
```

---

# Opción 2: Telegram — El Canal Fácil y Sin Drama 🤖

Si WhatsApp te parece demasiado frágil (y lo es — depende de ingeniería inversa y Meta puede cambiar las reglas cuando quiera), **Telegram es la alternativa más estable y fácil de configurar**. Usa la API oficial de Telegram Bot, que es gratuita, documentada, y no tiene riesgo de que te baneen la cuenta.

## Paso 1: Crear un Bot en Telegram

1. Abre Telegram y busca a **@BotFather** (es el bot oficial de Telegram para crear otros bots — sí, un bot que crea bots, _inception_ level 🤯)
2. Envíale el comando `/newbot`
3. Te pedirá un **nombre** para tu bot (el nombre visible, puede tener espacios)
4. Te pedirá un **username** (debe terminar en `bot`, ejemplo: `mi_openclaw_bot`)
5. BotFather te dará un **token** que se ve algo como: `7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
6. **Copia ese token** — es la llave de tu bot

## Paso 2: Agregar Telegram al JSON (o usar el CLI)

Tienes dos opciones:

**Opción A — Editar el JSON manualmente:**

```bash
nano ~/openclaw/data/openclaw.json
```

Agrega Telegram dentro de `"channels"`:

```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "dmPolicy": "pairing"
    }
  }
}
```

**Opción B — Usar el CLI (más rápido):**

Primero cambia bind a loopback (ya sabes el drill), luego:

```bash
docker exec -it openclaw-gateway node dist/index.js channels add --channel telegram --token TU_TOKEN_DE_BOTFATHER
```

Luego vuelve a poner bind en lan.

## Paso 3: Reiniciar el Gateway

```bash
cd ~/openclaw
docker compose down && docker compose up -d --force-recreate
```

## Paso 4: Enviar un Mensaje y Aprobar Pairing

Abre Telegram, busca tu bot por su username (ejemplo: `@mi_openclaw_bot`) y envíale un mensaje. Si usas `dmPolicy: pairing`, el bot te responderá con un código de pairing.

Apruébalo con el truco de loopback:

```bash
# Cambiar a loopback, reiniciar, y luego:
docker exec openclaw-gateway node dist/index.js pairing approve telegram CODIGO
# Volver a lan y reiniciar
```

Después de aprobar, envía otro mensaje — ahora sí debería responder tu agente de IA. 🎉

## Ventajas de Telegram sobre WhatsApp

- **API oficial**: No es ingeniería inversa, no hay riesgo de ban
- **Sin dependencia del teléfono**: El bot funciona independientemente de que tu teléfono esté online
- **Gratis y sin límites prácticos**: La Bot API de Telegram no cobra por mensaje
- **Más estable**: No hay sesiones que se desvinculen ni credenciales que expiren
- **Fácil de compartir**: Puedes darle el link del bot a otras personas

## Desventaja

- Necesitas que tus contactos usen Telegram (en muchos países, WhatsApp domina)

---

# Múltiples Canales: El Poder del Gateway Pattern 🔀

Una de las features más potentes de OpenClaw es que puedes tener **múltiples canales activos simultáneamente**. Un solo gateway puede responder en WhatsApp, Telegram y Discord al mismo tiempo, manteniendo el contexto de cada conversación por separado.

Tu `openclaw.json` podría verse así:

```json
{
  "channels": {
    "whatsapp": {
      "selfChatMode": true,
      "dmPolicy": "pairing"
    },
    "telegram": {
      "enabled": true,
      "dmPolicy": "pairing"
    },
    "discord": {
      "enabled": true,
      "dmPolicy": "allowlist"
    }
  }
}
```

El gateway se encarga del _fan-in_ (recibir de múltiples fuentes) y del _fan-out_ (responder por el canal correcto). Cada canal tiene su propia política de seguridad (`dmPolicy`), su propia lista de permitidos, y sus propias sesiones. Es un _monolito moderno_ — un solo servicio que hace de todo pero con separación lógica interna.

---

# Checklist de Seguridad para Canales 🔒

Antes de dormir tranquilo con tu langosta respondiendo mensajes 24/7, repasa esto:

- **Nunca uses `dmPolicy: open`** a menos que sea un bot público intencionalmente. Es como poner tu base de datos en internet sin password.
- **Usa `pairing` o `allowlist` siempre**. La paranoia en seguridad no es paranoia, es sentido común.
- **Protege las credenciales**: Los archivos en `~/openclaw/data/credentials/` contienen tokens y sesiones. Trátelos como si fueran API keys de producción (porque lo son).
- **No expongas el gateway**: Sigue usando el túnel SSH. El puerto 18789 NO debe estar abierto en el firewall.
- **WhatsApp específico**: No envíes spam ni mensajes masivos. Baileys tiene rate limiting pero Meta puede banear tu número si detecta abuso.
- **Revisa los logs periódicamente**: `docker compose logs --tail=50` es tu amigo. Busca intentos de conexión no autorizados.

---

# Resumen: Ruta Rápida ⚡

Para los que quieren el _speedrun_ sin la historia:

**WhatsApp:**

1. Editar `~/openclaw/data/openclaw.json` → agregar sección `channels.whatsapp`
2. Reiniciar: `docker compose down && docker compose up -d --force-recreate`
3. Login: `docker exec -it openclaw-gateway node dist/index.js channels login`
4. Escanear QR desde el teléfono
5. Reiniciar gateway de nuevo
6. Aprobar pairing (si aplica)

**Telegram:**

1. Crear bot con @BotFather → copiar token
2. `docker exec -it openclaw-gateway node dist/index.js channels add --channel telegram --token TOKEN`
3. Reiniciar gateway
4. Enviar mensaje al bot y aprobar pairing

_Nota: Recuerda el truco de loopback cada vez que necesites ejecutar comandos del CLI dentro del contenedor._

---

# Recursos

- Documentación oficial de canales: [docs.openclaw.ai/channels](http://docs.openclaw.ai/channels)
- WhatsApp específico: [docs.openclaw.ai/channels/whatsapp](http://docs.openclaw.ai/channels/whatsapp)
- Telegram específico: [docs.openclaw.ai/channels/telegram](http://docs.openclaw.ai/channels/telegram)
- Seguridad del Gateway: [docs.openclaw.ai/gateway/security](http://docs.openclaw.ai/gateway/security)
- Baileys (la librería de WhatsApp): [github.com/WhiskeySockets/Baileys](http://github.com/WhiskeySockets/Baileys)
