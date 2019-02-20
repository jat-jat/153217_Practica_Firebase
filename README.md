# Gestor de Pokemones con Firebase
CRUD para Pokemones:

![Captura de pantalla](https://user-images.githubusercontent.com/32760027/53132722-324e2900-3536-11e9-8a5b-304df570ffb0.png)

Se hace uso de Firebase para lo siguiente:

| Nombre  | Uso | Ubicación en el código |
| ------------- | ------------- | ------------- |
| Realtime Database | Guardar y leer la información, en una base de datos. | \src\app\home\home.page.ts
| Messaging | Recibir y enviar notificaciones, cuando alguien crea un Pokemón. | \src\app\push-notifications.service.ts y \src\app\home\home.page.ts (líneas 121 a 128)

Ubicación de llaves de Firebase:
- /google-services.json
- /src/app/app.component.ts (Líneas 9-16).
- /src/app/push-notifications.service.ts (Líneas 20 y 21)

Información del autor:
```
UNIVERSIDAD POLITÉCNICA DE CHIAPAS
INGENIERÍA EN DESARROLLO DE SOFTWARE
Desarrollo de aplicaciones móviles – Corte 2

Javier Alberto Argüello Tello – 153217 – 8º
20 de febrero del 2018
```
