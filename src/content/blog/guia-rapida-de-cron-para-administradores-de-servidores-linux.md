---
title: "⏰ Guía Rápida de Cron para Administradores de Servidores Linux"
description: "Todo lo que necesitas saber para programar tareas automáticas en Linux usando cron, explicado de forma clara y profesional."
pubDate: "Julio 06 2025 21:30:00"
tags: [linux, cron, tareas-programadas, devops]
author: "Alejandro Tejero GPT"
heroImage: 'https://www.redswitches.com/wp-content/uploads/2023/11/cron-job-linux.png'
includeTitleInContent: false
---

# ⏰ Guía Rápida de `cron` para Administradores de Servidores

`cron` es el demonio de tareas programadas en Linux. Te permite ejecutar scripts o comandos en intervalos definidos, desde tareas diarias de mantenimiento hasta automatizaciones críticas.

---

## 📚 Índice

- [🛠️ Edición del crontab](https://www.notion.so/Gu-a-R-pida-de-Cron-para-Administradores-de-Servidores-Linux-20961db7db7f8071b82eef0fbe9ac266?pvs=21)
- [📋 Sintaxis de las líneas de cron](https://www.notion.so/Gu-a-R-pida-de-Cron-para-Administradores-de-Servidores-Linux-20961db7db7f8071b82eef0fbe9ac266?pvs=21)
- [🧠 Ejemplos comunes](https://www.notion.so/Gu-a-R-pida-de-Cron-para-Administradores-de-Servidores-Linux-20961db7db7f8071b82eef0fbe9ac266?pvs=21)
- [🔍 Ver y gestionar crons de otros usuarios](https://www.notion.so/Gu-a-R-pida-de-Cron-para-Administradores-de-Servidores-Linux-20961db7db7f8071b82eef0fbe9ac266?pvs=21)
- [🪵 Logs y depuración](https://www.notion.so/Gu-a-R-pida-de-Cron-para-Administradores-de-Servidores-Linux-20961db7db7f8071b82eef0fbe9ac266?pvs=21)
- [🚫 Desactivar tareas temporalmente](https://www.notion.so/Gu-a-R-pida-de-Cron-para-Administradores-de-Servidores-Linux-20961db7db7f8071b82eef0fbe9ac266?pvs=21)
- [📦 Archivos relacionados](https://www.notion.so/Gu-a-R-pida-de-Cron-para-Administradores-de-Servidores-Linux-20961db7db7f8071b82eef0fbe9ac266?pvs=21)

---

## 🛠️ Edición del crontab

```bash
# Editar el crontab del usuario actual
crontab -e

# Ver crontab del usuario actual
crontab -l

# Eliminar el crontab del usuario actual
crontab -r
```

> Usa EDITOR=nano crontab -e si prefieres nano en lugar de vi.
> 

---

## 📋 Sintaxis de las líneas de cron

```bash
# ┌──────── minuto (0 - 59)
# │ ┌────── hora (0 - 23)
# │ │ ┌──── día del mes (1 - 31)
# │ │ │ ┌── mes (1 - 12)
# │ │ │ │ ┌─ día de la semana (0 - 7) (0 o 7 = domingo)
# │ │ │ │ │
# │ │ │ │ │
# * * * * * comando-a-ejecutar

```

---

## 🧠 Ejemplos comunes

```bash
# Ejecutar cada día a las 3:30 AM
30 3 * * * /ruta/script.sh

# Ejecutar cada lunes a las 7 AM
0 7 * * 1 /ruta/backup.sh

# Cada 5 minutos
*/5 * * * * /ruta/monitoreo.sh

# Cada hora exacta
0 * * * * /ruta/tarea.sh

# Al reiniciar el sistema
@reboot /ruta/init-script.sh

# Redirigir salida a log
0 1 * * * /ruta/script.sh >> /var/log/miscript.log 2>&1

```

---

## 🔍 Ver y gestionar crons de otros usuarios

```bash
# Ver crontab de otro usuario
sudo crontab -u nombre_usuario -l

# Editar crontab de otro usuario
sudo crontab -u nombre_usuario -e

```

---

## 🪵 Logs y depuración

```bash
# Ver logs de cron en sistemas con rsyslog
grep CRON /var/log/syslog         # Debian, Ubuntu
grep CRON /var/log/cron           # CentOS, RHEL, AlmaLinux

# Si journalctl está disponible:
journalctl -u cron.service        # Debian-like
journalctl -u crond.service       # RHEL-like

```

> Tip: redirige siempre la salida de tus comandos para poder detectar errores (>> /ruta/log 2>&1).
> 

---

## 🚫 Desactivar tareas temporalmente

```bash
# Comentar una línea anteponiendo "#"
# 0 2 * * * /ruta/script.sh

# O usa condiciones dentro del script:
[ "$(date +\%u)" -ne 7 ] && exit 0  # no correr los domingos

```

---

## 📦 Archivos relacionados

| Archivo | Descripción |
| --- | --- |
| `/etc/crontab` | Crontab global del sistema |
| `/etc/cron.d/` | Archivos crontab individuales por servicio |
| `/etc/cron.daily/` | Scripts ejecutados diariamente |
| `/etc/cron.hourly/` | Scripts ejecutados cada hora |
| `/etc/cron.weekly/` | Scripts ejecutados semanalmente |
| `/var/spool/cron/` | Crontabs por usuario (no editar directamente) |
| `/etc/anacrontab` | Anacron: ejecuta tareas perdidas por apagado |


> Con cron bien afinado, puedes automatizar casi todo lo que harías como sysadmin a mano. Solo recuerda testear manualmente tus scripts antes de agendarlos.