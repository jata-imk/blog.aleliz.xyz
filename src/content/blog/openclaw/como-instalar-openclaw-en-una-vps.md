---
title: "Guía: Instalar OpenClaw en un VPS Barato con AlmaLinux 🐧"
description: "Guía paso a paso para instalar OpenClaw en un VPS modesto con AlmaLinux usando Docker. Cubre desde la conexión SSH hasta la configuración del firewall, túneles SSH y conexión de canales de mensajería."
author: "Alejandro Tejero OpenClaw"
pubDate: "2026-02-19 23:30:00"
heroImage: "/openclaw/instalar-openclaw-en-una-vps-con-docker.jpg"
includeTitleInContent: false
includeInList: true
---

# Guía: Instalar OpenClaw en un VPS Barato con AlmaLinux 🐧

Esta guía está pensada para un VPS modesto (2 vCores, 2 GB RAM, 80 GB NVMe) corriendo **AlmaLinux**, que es un fork enterprise de RHEL (Red Hat Enterprise Linux). Usaremos **Docker** para mantener todo encapsulado y fácil de gestionar.

## Paso 0: Prerequisitos y Contexto

Antes de empezar, ten en cuenta:

- OpenClaw es un servicio de **Node.js** (requiere Node >= 22)
- La forma recomendada de desplegarlo en un VPS es vía **Docker** y **Docker Compose**
- Necesitarás al menos una API key de un proveedor de LLM (Anthropic, OpenAI, Google, etc.)
- Tu VPS debe tener acceso SSH configurado

## Paso 1: Conectarse al VPS por SSH

Si aún no tienes un usuario dedicado ni claves SSH configuradas, consulta primero la guía completa: [Claves SSH y Creación de Usuarios en Linux: La Guía para No Entrar por la Puerta Trasera 🔐](/blog/claves-ssh-y-creacion-de-usuarios-en-linux/)

Una vez configurado, conéctate a tu VPS. Si usas **PowerShell / Terminal** con clave formato OpenSSH:

```bash
ssh -i ~/.ssh/id_ed25519 devops@TU_IP_DEL_VPS
```

O con SSH config:

```bash
ssh mi-vps
```

Si usas **PuTTY** con clave `.ppk`, abre PuTTY, carga tu sesión guardada con la IP del VPS y tu clave privada configurada en **Connection → SSH → Auth → Credentials**, y conecta como `devops`.

## Paso 2: Actualizar el Sistema

AlmaLinux usa `dnf` como package manager (el sucesor de `yum`):

```bash
sudo dnf update -y
```

## Paso 3: Instalar Docker y Docker Compose

En AlmaLinux, Docker no viene de fábrica. Hay que agregar el repositorio oficial:

```bash
# Instalar dependencias
sudo dnf install -y dnf-plugins-core

# Agregar el repo oficial de Docker
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Instalar Docker Engine, CLI y Compose
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Iniciar y habilitar Docker como servicio (daemon)
sudo systemctl start docker
sudo systemctl enable docker

# Verificar que funciona
docker --version
docker compose version
```

AlmaLinux es binario-compatible con RHEL/CentOS, así que el repo de Docker para CentOS funciona perfecto.

### Paso 3.1: Agregar tu usuario al grupo `docker`

Este paso depende de **con qué usuario estés trabajando**:

- **Si estás como `root`**: No necesitas hacer nada extra. El usuario `root` es el _todopoderoso_ del sistema y tiene permisos para ejecutar cualquier cosa, incluyendo Docker. Sin embargo, recuerda que trabajar como root en producción es un antipatrón de seguridad — es como conducir sin cinturón: funciona hasta que no funciona.
- **Si estás como un usuario no-root (como `devops`)**: Necesitas agregar tu usuario al grupo `docker`. Sin esto, cada vez que intentes ejecutar un comando de Docker te va a escupir un bonito **permission denied**, porque el _socket_ de Docker (`/var/run/docker.sock`) pertenece al grupo `docker` y tu usuario no tiene acceso a él.

Para agregarte al grupo:

```bash
sudo usermod -aG docker devops
```

Desglose rápido: `usermod` modifica el usuario, `-aG` es **a**ppend (agregar) al **G**rupo — sin la `a` reemplazaría todos tus grupos, lo cual sería un _bug catastrófico_ en tu configuración de permisos.

**Importante**: Los cambios de grupo no toman efecto en la sesión actual. Tienes dos opciones:

```bash
# Opción 1: Recargar el grupo en la sesión actual (rápido pero temporal)
newgrp docker

# Opción 2: Cerrar sesión y volver a entrar (la opción limpia)
exit
ssh mi-vps
```

Para verificar que funcionó:

```bash
# Esto debería funcionar SIN sudo
docker ps
```

Si ves una tabla vacía (o con contenedores si ya tienes alguno corriendo) en vez de un _permission denied_, estás listo. Si sigues viendo el error, verifica que hiciste logout/login o `newgrp` correctamente.

**¿Por qué no simplemente usar `sudo docker` siempre?** Técnicamente podrías anteponer `sudo` a cada comando de Docker, pero esto tiene varias desventajas: el `docker-compose.yml` podría comportarse diferente con `sudo` (las rutas `~` se expanden al home de root en vez del tuyo), es tedioso, y si configuras cron jobs o scripts que usen Docker, tendrías que lidiar con la escalación de privilegios en cada uno. Agregar tu usuario al grupo `docker` es la forma limpia y estándar de resolverlo.

## Paso 4: Crear Directorios para Persistencia de Datos

Los contenedores de Docker son **efímeros** (stateless por defecto) — si el contenedor muere, los datos se van con él. Por eso necesitamos **bind mounts** (volúmenes) para que los datos persistan en el host:

```bash
mkdir -p ~/openclaw/data
mkdir -p ~/openclaw/workspace
```

Ahora hay que ajustar los permisos para que el usuario interno del contenedor (uid 1000, que es el usuario `node` dentro de la imagen de Docker) pueda leer y escribir en esos directorios. El comando `chown` (change owner) **requiere privilegios de root** — esto es una medida de seguridad del kernel de Linux: un usuario normal no puede reasignar la propiedad de archivos a otro usuario, porque eso sería un _exploit_ de escalación de privilegios. Por eso necesitas `sudo`:

```bash
# Si estás como root, no necesitas sudo
# Si estás como devops u otro usuario no-root, sudo es obligatorio
sudo chown -R 1000:1000 ~/openclaw/data
sudo chown -R 1000:1000 ~/openclaw/workspace
```

Sin este paso, el contenedor de OpenClaw no podrá escribir datos en esos directorios y te lanzará errores de permisos al arrancar — un _silent failure_ que puede costarte horas de debugging si no sabes dónde buscar.

## Paso 5: Crear el archivo docker-compose.yml

Crear el archivo de configuración de Docker Compose:

```bash
cd ~/openclaw
nano docker-compose.yml
```

Pega el siguiente contenido:

```yaml
services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: openclaw-gateway
    restart: always
    ports:
      - "127.0.0.1:18789:18789"
    volumes:
      - ~/openclaw/data:/home/node/.openclaw
      - ~/openclaw/workspace:/home/node/.openclaw/workspace
    environment:
      - NODE_ENV=production
```

**Nota de seguridad importante**: Al usar `127.0.0.1:18789:18789`, el puerto solo se expone localmente dentro del VPS. Nadie puede acceder desde afuera sin un túnel SSH. Esto es **crucial** — no expongas el gateway directamente a internet.

### Paso 5.1: Configurar el bind address del gateway (importante para Docker)

Por defecto, OpenClaw escucha en modo `loopback` (`127.0.0.1`) — que está bien si corres el gateway directamente en tu máquina, pero **dentro de un contenedor Docker causa un problema silencioso**: el gateway solo acepta conexiones desde el propio contenedor. Cuando Docker hace _port forwarding_ del host al contenedor, el tráfico llega por la interfaz virtual de red (`eth0`), no por el loopback, y el gateway lo rechaza con un `Connection reset by peer`. Es un _gotcha_ clásico de Docker networking que te puede costar horas de _debugging_.

La solución es editar el archivo de configuración de OpenClaw para cambiar el _bind mode_ a `"lan"`. Primero necesitas que el contenedor arranque al menos una vez para que genere el archivo de configuración, así que si aún no has hecho el Paso 6, hazlo primero y luego regresa aquí.

Edita el archivo:

```bash
nano ~/openclaw/data/openclaw.json
```

Agrega `"bind": "lan"` dentro del objeto `"gateway"`:

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
      "token": "TU_TOKEN_AUTOGENERADO"
    }
  },
  "meta": {
    "lastTouchedVersion": "...",
    "lastTouchedAt": "..."
  }
}
```

Luego reinicia el contenedor para que tome la nueva config:

```bash
cd ~/openclaw
docker compose down && docker compose up -d --force-recreate
```

Verifica en los logs que ahora dice `listening on ws://0.0.0.0:18789` en vez de `ws://127.0.0.1:18789`:

```bash
docker compose logs --tail=5
```

**¿Por qué esto es seguro?** El `0.0.0.0` es solo **dentro del contenedor** — significa que acepta conexiones desde cualquier interfaz _del contenedor_. Pero en el `docker-compose.yml` ya restringimos el puerto al `127.0.0.1` del host, así que desde internet sigue siendo inaccesible. La seguridad la controla Docker a nivel del host, no el gateway a nivel del contenedor.

## Paso 6: Levantar el Contenedor (primer arranque)

El primer arranque es necesario para que OpenClaw genere su archivo de configuración (`openclaw.json`) y los archivos de identidad del dispositivo.

```bash
docker compose up -d
```

El flag `-d` es de _detached mode_ (corre en background como un daemon). Docker descargará la imagen oficial de OpenClaw y levantará el servicio.

Para ver los logs en tiempo real:

```bash
docker compose logs -f
```

Una vez que veas en los logs que el gateway está escuchando (`listening on ws://...`), **ve al Paso 5.1** que dejamos pendiente para configurar el `"bind": "lan"` en el `openclaw.json`. Después del cambio, reinicia con:

```bash
docker compose down && docker compose up -d --force-recreate
```

El flag `--force-recreate` es importante — le dice a Docker que tire el contenedor viejo y cree uno nuevo con la config actual. Sin este flag, Docker a veces reutiliza el contenedor existente (un _cache_ silencioso que te puede volver loco en sesiones de _debugging_).

## Paso 6.1: Aprobar el dispositivo del Control UI (Pairing)

OpenClaw usa un sistema de **pairing** (emparejamiento) similar a Bluetooth: cada cliente que se conecta al gateway debe ser aprobado explícitamente. Sin esto, verás el error `disconnected (1008): pairing required` en el dashboard.

Aquí hay un _gotcha_ importante: con `"bind": "lan"`, el CLI dentro del contenedor no puede conectarse al gateway para aprobar dispositivos (otro _deadlock_ de tipo huevo y gallina 🐔🥚). La solución es hacer el pairing con bind en loopback:

**1. Temporalmente cambiar bind a loopback:**

```bash
nano ~/openclaw/data/openclaw.json
```

Cambia `"bind": "lan"` a `"bind": "loopback"` y guarda.

**2. Reiniciar el contenedor:**

```bash
cd ~/openclaw
docker compose down && docker compose up -d --force-recreate
```

**3. Abrir el dashboard desde tu navegador** (el túnel SSH no funcionará en modo loopback, pero necesitas que el dashboard envíe su solicitud de pairing). Si ya intentaste acceder con el token antes, la solicitud debería estar pendiente.

**4. Listar y aprobar dispositivos pendientes:**

```bash
docker exec openclaw-gateway node dist/index.js devices list
```

Verás las solicitudes pendientes. Aprébalas con:

```bash
docker exec openclaw-gateway node dist/index.js devices approve EL_ID_DEL_DISPOSITIVO
```

**5. Volver a cambiar bind a lan:**

```bash
nano ~/openclaw/data/openclaw.json
```

Cambia `"bind": "loopback"` de vuelta a `"bind": "lan"` y reinicia:

```bash
docker compose down && docker compose up -d --force-recreate
```

Ahora el dashboard funcionará correctamente a través del túnel SSH con el dispositivo ya aprobado.

## Paso 7: Acceder al Dashboard vía SSH Tunnel

El dashboard de OpenClaw está escuchando en `127.0.0.1:18789` dentro del VPS (solo accesible localmente). Para verlo desde tu computadora necesitas crear un **SSH tunnel** (túnel SSH) — que básicamente es un _port forwarding_ (reenvío de puertos) cifrado: todo el tráfico del puerto 18789 de tu máquina local viaja por el túnel SSH hasta el puerto 18789 del VPS, como si estuvieras conectado directamente.

El método depende de cómo te conectas al VPS y qué formato tiene tu clave SSH.

### Opción A: PowerShell / Terminal (clave formato OpenSSH)

Si generaste tu clave con `ssh-keygen` (formato OpenSSH estándar), puedes usar el cliente SSH que viene integrado en Windows 10/11, macOS o Linux. Desde PowerShell o cualquier terminal:

```bash
ssh -L 18789:127.0.0.1:18789 -i C:\Users\TU_USUARIO\.ssh\id_ed25519 devops@TU_IP_DEL_VPS
```

En macOS/Linux la ruta de la clave sería `~/.ssh/id_ed25519`. Si configuraste el SSH config, simplemente:

```bash
ssh -L 18789:127.0.0.1:18789 mi-vps
```

### Opción B: PuTTY (clave formato `.ppk`)

Si generaste tu clave con **PuTTYgen**, tu clave privada está en formato `.ppk` — un formato **propietario de PuTTY** que no es compatible con el cliente OpenSSH de PowerShell. Son como dos _runtimes_ que hablan dialectos distintos del mismo protocolo. En este caso tienes dos caminos:

**Camino 1: Hacer el túnel directamente desde PuTTY (sin convertir nada)**

1. Abre PuTTY y carga tu sesión guardada (o crea una nueva con la IP de tu VPS)
2. En el panel izquierdo, navega a **Connection → SSH → Auth → Credentials** y selecciona tu archivo `.ppk` en "Private key file for authentication"
3. Luego ve a **Connection → SSH → Tunnels**
4. En **Source port** escribe: `18789`
5. En **Destination** escribe: `127.0.0.1:18789`
6. Deja seleccionado **Local** y haz clic en **Add**. Deberías ver `L18789 127.0.0.1:18789` en la lista de forwarded ports
7. Vuelve a **Session**, guarda la configuración (para no repetir esto cada vez) y haz clic en **Open**
8. Inicia sesión como `devops` cuando te lo pida

Mientras la ventana de PuTTY esté abierta, el túnel estará activo.

**Camino 2: Convertir la clave `.ppk` a formato OpenSSH (para usar PowerShell)**

Si prefieres usar PowerShell en vez de PuTTY para los túneles (más cómodo, scripteable, y los comandos son idénticos a Linux), puedes convertir tu clave:

1. Abre **PuTTYgen**
2. Haz clic en **File → Load Private Key** y selecciona tu archivo `.ppk`
3. Ve a **Conversions → Export OpenSSH key** (si te pregunta por passphrase vacía, decide según tu preferencia)
4. Guárdala como `id_ed25519` (sin extensión) en `C:\Users\TU_USUARIO\.ssh\`

Ahora puedes usar PowerShell normalmente:

```bash
ssh -L 18789:127.0.0.1:18789 -i C:\Users\TU_USUARIO\.ssh\id_ed25519 devops@TU_IP_DEL_VPS
```

**Nota**: Si conviertes la clave, ambos archivos (`.ppk` y el OpenSSH) representan la **misma clave** — no necesitas volver a instalar nada en el servidor. La clave pública no cambia, solo el _encoding_ (formato de empaquetado) de la privada.

### Verificar que el túnel funciona

Independientemente del método que hayas usado, mientras la sesión SSH esté abierta, abre tu navegador y ve a:

```
http://127.0.0.1:18789
```

Si ves el dashboard de OpenClaw, el túnel está funcionando correctamente. Si el navegador dice "conexión rechazada", verifica que el contenedor esté corriendo (`docker ps`) y que no hayas cerrado la ventana de PuTTY o PowerShell.

## Paso 8: Obtener el Token de Acceso

OpenClaw genera un token de autenticación automáticamente. Para obtenerlo:

```bash
cat ~/openclaw/data/openclaw.json | grep '"token":'
```

Copia este token — lo necesitarás para acceder al dashboard web.

## Paso 9: Configurar el Modelo de IA

Desde el dashboard web, selecciona tu proveedor de modelo de IA. Opciones recomendadas:

- **Anthropic Claude** (recomendado por el propio Peter Steinberger por su resistencia a prompt injection)
- **OpenAI GPT / Codex**
- **Google Gemini** (tiene opción de OAuth gratuita)
- **Modelos locales vía Ollama** (ojo: con 2GB de RAM estarás limitado a modelos pequeños)

Necesitarás ingresar tu API key del proveedor elegido.

## Paso 10: Conectar un Canal de Mensajería

Desde el dashboard, configura al menos un canal de chat. Para **Telegram** (el más fácil):

1. Habla con @BotFather en Telegram
2. Crea un nuevo bot con `/newbot`
3. Copia el token que te da BotFather
4. Pégalo en la configuración de OpenClaw

Para **WhatsApp** necesitarás escanear un código QR, similar a WhatsApp Web.

## Paso 11: Configurar Firewall (Seguridad Extra)

AlmaLinux usa `firewalld` por defecto. Asegúrate de que solo SSH esté expuesto:

```bash
# Verificar estado del firewall
sudo firewall-cmd --state

# Asegurarte de que solo SSH está abierto
sudo firewall-cmd --list-all

# Si necesitas agregar SSH (normalmente ya está)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

NO abras el puerto 18789 en el firewall — el túnel SSH es tu capa de seguridad.

## Paso 12: Verificar que Todo Funciona

```bash
# Verificar que el contenedor está corriendo
docker ps

# Health check
curl http://127.0.0.1:18789/health
```

Deberías ver algo como `{"status":"ok"}`. Si ves eso, tu OpenClaw está **production-ready**.

---

# Consideraciones de Seguridad ⚠️

OpenClaw es una herramienta **poderosa y potencialmente peligrosa** si se configura mal. Ten en cuenta:

- **Prompt injection** sigue siendo un problema sin resolver a nivel de toda la industria. Usa modelos fuertes (Claude Opus, GPT-4) que tienen mejor resistencia.
- **Nunca expongas el gateway directamente a internet** sin autenticación. Siempre usa SSH tunnels o Tailscale.
- **Revisa los permisos** que le das al agente. Recuerda que puede ejecutar comandos de shell — un mal prompt podría resultar en un `rm -rf /` accidental.
- **Las credenciales se almacenan localmente** en archivos de configuración. Protege esos archivos.
- Este proyecto es principalmente para **usuarios avanzados** que entienden las implicaciones de correr agentes autónomos con acceso elevado a su sistema.

Como dicen en la comunidad: _"With great claw comes great responsibility."_ 🦞

---

# Recursos Útiles

- Repositorio oficial: [github.com/openclaw/openclaw](http://github.com/openclaw/openclaw)
- Documentación: [docs.openclaw.ai](http://docs.openclaw.ai)
- Sitio web: [openclaw.ai](http://openclaw.ai)
- Discord de la comunidad: Busca "OpenClaw" en Discord
- Blog oficial: [openclaw.ai/blog](http://openclaw.ai/blog)

---

**Siguiente artículo:** [Conectar OpenClaw a WhatsApp y Telegram: De "Channel Config Unavailable" a Chatear con tu Langosta 🦞💬](/blog/openclaw/conectar-openclaw-a-whatsapp-y-telegram/)
