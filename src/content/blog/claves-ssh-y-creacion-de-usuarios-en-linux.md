---
title: "Claves SSH y Creación de Usuarios en Linux: La Guía para No Entrar por la Puerta Trasera 🔐"
description: "Guía completa para crear usuarios en Linux, generar claves SSH Ed25519, instalar la clave pública en el servidor, hacer hardening de SSH y simplificar la conexión con SSH config."
author: "Alejandro Tejero"
pubDate: "2026-02-18 12:00:00"
heroImage: "/llave-ssh.jpg"
---

# ¿Qué es SSH y Por Qué Deberías Dejar de Usar Contraseñas?

SSH (Secure Shell) es un **protocolo de red criptográfico** — o como le dicen en la calle, "el túnel seguro" — que te permite conectarte a una máquina remota de forma cifrada. Es el estándar de facto para administrar servidores Linux. Cada vez que haces `ssh usuario@servidor`, estás usando este protocolo.

Pero aquí viene el detalle: SSH soporta dos métodos de autenticación principales:

1. **Password authentication** (contraseña) — La opción "fácil" pero insegura. Cualquier bot de fuerza bruta en internet está constantemente probando combinaciones de usuario/contraseña contra servidores expuestos. Si tu password es `admin123` o `P@ssw0rd`, felicidades: ya estás comprometido.
2. **Key-based authentication** (autenticación por clave pública/privada) — La opción pro. En lugar de un password, usas un **par de claves criptográficas**: una pública (que va en el servidor) y una privada (que se queda en tu máquina local y nunca debe salir de ahí). Es como un candado y su llave única: el servidor tiene el candado, tú tienes la llave.

¿Por qué las claves SSH son superiores? Porque una clave de 4096 bits es prácticamente imposible de adivinar por fuerza bruta. No hay diccionario de contraseñas que funcione. Es como intentar abrir una cerradura intentando todas las combinaciones posibles de átomos en el universo — simplemente no es viable.

---

# Parte 1: Crear un Usuario Nuevo (el usuario `devops`)

Antes de generar las claves SSH, vamos a crear un usuario dedicado. ¿Por qué? Porque **trabajar directamente como root es el equivalente en Linux a correr con tijeras** — funciona hasta que no funciona, y cuando falla, falla catastróficamente. Un `rm -rf /` accidental como root y tu servidor se convierte en un ladrillo caro.

La buena práctica (o _best practice_ como dicen los de DevOps) es crear un usuario con privilegios de `sudo` y deshabilitar el login de root por SSH. Esto se conoce como el **principio de mínimo privilegio** (Principle of Least Privilege) — darle a cada usuario solo los permisos que necesita y nada más.

## Paso 1: Conectarse como root (por última vez)

Conectarse al VPS como root. Esta será idealmente la última vez que hagamos login directo como root:

```bash
ssh root@TU_IP_DEL_VPS
```

## Paso 2: Crear el usuario `devops`

El comando `useradd` es el encargado de crear usuarios en sistemas basados en RHEL (como AlmaLinux). El flag `-m` le dice que cree el directorio home automáticamente:

```bash
# Crear el usuario con su home directory
useradd -m -s /bin/bash devops
```

Desglose del comando (para que no sea _código misterioso_):

- `useradd` — El binario que crea usuarios en el sistema
- `-m` — Crea el directorio `/home/devops` automáticamente
- `-s /bin/bash` — Asigna Bash como shell por defecto (sin esto podría asignarse `/bin/sh` u otro shell más limitado)
- `devops` — El nombre del usuario

## Paso 3: Asignar una contraseña al usuario

Aunque vamos a usar claves SSH (y eventualmente deshabilitar la autenticación por contraseña), es buena práctica tener un password para el comando `sudo`:

```bash
passwd devops
```

Te pedirá ingresar y confirmar la contraseña. Usa una contraseña fuerte: mínimo 16 caracteres, mezcla de mayúsculas, minúsculas, números y símbolos. Puedes generarla con:

```bash
openssl rand -base64 24
```

Eso te dará un string aleatorio de 32 caracteres que puedes usar como password. Guárdala en un gestor de contraseñas como Bitwarden, 1Password o KeePass.

## Paso 4: Dar privilegios de sudo

En AlmaLinux (y cualquier distro basada en RHEL), el grupo `wheel` es el grupo de sudoers — quienes pueden usar `sudo` para ejecutar comandos como root. En distros basadas en Debian/Ubuntu, el equivalente es el grupo `sudo`.

```bash
usermod -aG wheel devops
```

Desglose:

- `usermod` — Modifica un usuario existente
- `-aG` — **a**ppend (agregar) al **G**rupo. Sin la `a`, _reemplazaría_ todos los grupos del usuario en vez de agregar. Este es un error clásico que te puede dejar sin acceso.
- `wheel` — El grupo con permisos de sudo en RHEL/AlmaLinux

## Paso 5: Verificar que todo funciona

```bash
# Cambiar al usuario devops
su - devops

# Verificar que sudo funciona
sudo whoami
```

Si responde `root`, todo está correcto. El usuario `devops` ahora puede ejecutar cualquier comando como root usando `sudo`, pero por defecto opera con permisos limitados. Eso es _hardening_ básico.

---

# Parte 2: Generar el Par de Claves SSH

Ahora viene la parte jugosa: crear tu par de claves criptográficas. Esto se hace **en tu máquina local** (tu laptop/PC), NO en el servidor.

¿Por qué en tu máquina local? Porque la clave privada es TU secreto. Nunca debe existir en ningún otro lugar que no sea tu computadora. Generar la clave en el servidor y luego transferirla sería un antipatrón de seguridad (o en términos de calle, un _code smell_ de seguridad).

## Paso 1: Generar las claves (en tu máquina local)

Abre una terminal en tu computadora y ejecuta:

```bash
ssh-keygen -t ed25519 -C "devops@mi-vps-openclaw"
```

Desglose del comando:

- `ssh-keygen` — La herramienta para generar claves SSH
- `-t ed25519` — El tipo de algoritmo. **Ed25519** es el estándar moderno: más rápido, más seguro y genera claves más cortas que RSA. Si por alguna razón tu sistema no soporta Ed25519 (muy raro hoy en día), usa `-t rsa -b 4096` como fallback.
- `-C "devops@mi-vps-openclaw"` — Un comentario para identificar la clave. No afecta la seguridad, es puro _syntactical sugar_ organizacional para que cuando tengas 20 claves sepas cuál es cuál.

Te preguntará:

```
Enter file in which to save the key (/home/tu_usuario/.ssh/id_ed25519):
```

Puedes presionar Enter para aceptar la ruta por defecto, o especificar un nombre personalizado si manejas múltiples claves:

```
/home/tu_usuario/.ssh/id_ed25519_openclaw
```

Luego te pedirá una **passphrase** (frase de contraseña). Esto es una capa extra de seguridad: incluso si alguien roba tu clave privada, no podrá usarla sin la passphrase. Es como ponerle un PIN a la llave de tu casa. Se recomienda usarla, aunque puedes dejarla vacía si prefieres comodidad sobre seguridad (no ideal pero entendible para desarrollo local).

## Paso 2: Verificar que se generaron las claves

```bash
ls -la ~/.ssh/
```

Deberías ver dos archivos nuevos:

- `id_ed25519` (o el nombre que elegiste) — Tu **clave privada**. NUNCA la compartas, la subas a GitHub, la pegues en un chat, ni la mandes por email. Tratar la clave privada como si fuera la contraseña de tu banco.
- `id_ed25519.pub` — Tu **clave pública**. Esta sí la puedes compartir. Es la que va en el servidor.

Para ver el contenido de tu clave pública:

```bash
cat ~/.ssh/id_ed25519.pub
```

Verás algo como:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... devops@mi-vps-openclaw
```

Copia todo ese string — lo necesitarás en el siguiente paso.

---

# Parte 3: Instalar la Clave Pública en el Servidor

Ahora necesitamos poner tu clave pública en el servidor, específicamente en el archivo `authorized_keys` del usuario `devops`. Este archivo es como la "lista VIP" del servidor: si tu clave privada hace match con alguna clave pública de esa lista, entras sin contraseña.

## Método 1: Usando `ssh-copy-id` (la forma elegante)

Si aún puedes acceder al servidor con contraseña:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub devops@TU_IP_DEL_VPS
```

Este comando automáticamente crea el directorio `~/.ssh/` en el servidor, crea el archivo `authorized_keys`, copia tu clave pública, y ajusta los permisos correctamente. Es el _one-liner_ más elegante para esto.

## Método 2: Manual (para cuando `ssh-copy-id` no está disponible)

Si estás en Windows sin WSL o `ssh-copy-id` no está disponible, hazlo manualmente. Conéctate al servidor como root y ejecuta:

```bash
# Crear el directorio .ssh para el usuario devops
mkdir -p /home/devops/.ssh

# Crear el archivo authorized_keys y pegar tu clave pública
echo "PEGA_AQUI_TU_CLAVE_PUBLICA_COMPLETA" >> /home/devops/.ssh/authorized_keys

# Ajustar permisos (CRUCIAL - SSH es muy estricto con esto)
chmod 700 /home/devops/.ssh
chmod 600 /home/devops/.ssh/authorized_keys
chown -R devops:devops /home/devops/.ssh
```

Los permisos son **críticos**. SSH se niega a funcionar si los permisos del directorio `.ssh` o del archivo `authorized_keys` son demasiado permisivos. Es una medida de seguridad: si otros usuarios del sistema pudieran leer o modificar tu archivo `authorized_keys`, podrían agregar sus propias claves y entrar como tú. Piensa en `chmod` como el bouncer del servidor: si los permisos no están exactos, no te deja pasar.

---

# Parte 4: Probar la Conexión

Desde tu máquina local, intenta conectarte con la clave:

```bash
ssh -i ~/.ssh/id_ed25519 devops@TU_IP_DEL_VPS
```

Si todo salió bien, deberías entrar directamente sin que te pida contraseña (o solo la passphrase de la clave, si configuraste una). Si funciona, verás algo como:

```
[devops@mi-vps ~]$
```

¡Felicidades! Ya estás dentro con autenticación por clave SSH.

---

# Parte 5: Hardening — Blindar el Acceso SSH

Ahora que ya puedes entrar con claves SSH, es hora de cerrar las puertas que ya no necesitas. Esto se llama **hardening** (endurecimiento) del servicio SSH.

Edita el archivo de configuración de SSH en el servidor:

```bash
sudo nano /etc/ssh/sshd_config
```

Busca y modifica las siguientes líneas (si están comentadas con `#`, quita el `#`):

```bash
# Deshabilitar login de root por SSH
PermitRootLogin no

# Deshabilitar autenticación por contraseña
PasswordAuthentication no

# Asegurar que la autenticación por clave esté habilitada
PubkeyAuthentication yes
```

**ADVERTENCIA IMPORTANTE**: Antes de aplicar estos cambios, asegúrate de que puedes entrar como `devops` con tu clave SSH. Si desactivas `PasswordAuthentication` y tu clave no funciona, te quedarás **permanentemente fuera del servidor** (lo que en la comunidad se conoce como un _lockout_). Mantén tu sesión actual abierta mientras pruebas.

Para aplicar los cambios, reinicia el servicio SSH:

```bash
sudo systemctl restart sshd
```

Abre una **nueva terminal** (sin cerrar la actual) y prueba conectarte:

```bash
ssh -i ~/.ssh/id_ed25519 devops@TU_IP_DEL_VPS
```

Si entras sin problema, el hardening está completo. Si algo falló, todavía tienes la sesión anterior abierta para revertir los cambios.

---

# Parte 6: Bonus — Simplificar la Conexión con un SSH Config

Escribir `ssh -i ~/.ssh/id_ed25519 devops@123.456.789.0` cada vez es tedioso. Puedes crear un alias en tu archivo de configuración SSH local:

```bash
nano ~/.ssh/config
```

Agrega:

```
Host mi-vps
    HostName TU_IP_DEL_VPS
    User devops
    IdentityFile ~/.ssh/id_ed25519
    Port 22
```

Ahora puedes conectarte simplemente con:

```bash
ssh mi-vps
```

Eso es todo. Dos palabras y estás dentro. Esto también funciona para SCP (copia segura de archivos), SFTP, y por supuesto, para los **SSH tunnels** que necesitarás para acceder a dashboards de servicios self-hosted:

```bash
ssh -L 18789:127.0.0.1:18789 mi-vps
```

Mucho más limpio que escribir toda la IP y la ruta de la clave cada vez.

---

# Resumen: Checklist de Seguridad ✅

- Usuario `devops` creado con directorio home y Bash como shell
- Contraseña fuerte asignada (almacenada en gestor de contraseñas)
- Usuario agregado al grupo `wheel` (permisos de sudo)
- Par de claves Ed25519 generado en la máquina local
- Clave pública instalada en `~/.ssh/authorized_keys` del servidor
- Permisos correctos: `700` para `.ssh/`, `600` para `authorized_keys`
- Login de root deshabilitado (`PermitRootLogin no`)
- Autenticación por contraseña deshabilitada (`PasswordAuthentication no`)
- SSH config local creado para conexión rápida

Con todo esto en su lugar, tu servidor está considerablemente más protegido contra ataques de fuerza bruta y accesos no autorizados.
