# Focus Grades

Creada por **DammerungEthan** · [Código fuente en GitHub](https://github.com/DammerungEthan/FocusGrades) · Licencia [MIT](LICENSE).

Focus Grades es una app móvil para organizar asignaturas, registrar y editar notas, ver el promedio y calcular qué nota se necesita para aprobar. Incluye escalas de calificación configurables, temas de color, estadísticas, copias de seguridad y búsqueda de actualizaciones.

## Tecnologías

- React Native
- Expo SDK 58
- JavaScript
- AsyncStorage para guardar asignaturas y notas en el dispositivo

## Requisitos

- Node.js y npm
- Android Studio con Android SDK
- Expo Go para probar la app desde el teléfono, o un dispositivo Android para instalar el APK

## Preparar el proyecto

Abre una terminal en la carpeta del proyecto y ejecuta:

```sh
npm install
```

## Probar con Expo Go

1. Instala Expo Go en el teléfono Android.
2. En la carpeta del proyecto, ejecuta:

   ```sh
   npx expo start
   ```

3. Escanea el QR desde Expo Go. Para una conexión mediante túnel, usa `npx expo start --tunnel`.

Mantén la terminal abierta mientras pruebas la app.

## Compilar el APK localmente

El APK se compila en el PC; no usa EAS Build. Con Android Studio y su Android SDK instalados, ejecuta:

```sh
npm run build:android:local
```

La primera compilación necesita conexión a internet para descargar Gradle y las dependencias de Android. El APK se guarda en `dist/` con el número de versión del proyecto, por ejemplo `dist/Focus-Grades-v1.0.2.apk`. La versión y el código Android deben mantenerse sincronizados en `app.json`, `package.json` y `android/app/build.gradle`.

## Publicar una versión en GitHub

El APK no se pega en el README ni se sube como archivo normal al código del repositorio. La compilación ARM actual pesa aproximadamente 38 MB y GitHub limita a 25 MiB cada archivo que se carga al repositorio desde el navegador. En cambio, cada archivo adjunto a un Release debe pesar menos de 2 GiB ([límites del repositorio](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github), [límites de Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)).

Primero sube al repositorio el código fuente y el README, sin `node_modules/`, `.expo/`, `.gradle-local/`, `dist/` ni las claves privadas. Después adjunta el APK a una publicación (**Release**):

1. En el repositorio, abre **Releases** y selecciona **Create a new release**.
2. Usa una etiqueta como `v1.0.2` y escribe el título de la versión.
3. Arrastra el APK generado desde `dist/` al área de archivos adjuntos del formulario.
4. Publica el Release.

La app consulta las publicaciones de GitHub para encontrar versiones nuevas. El nombre del APK puede incluir la versión; asegúrate de adjuntar un solo APK de esta app a cada Release.

## Publicar actualizaciones

Para cada nueva versión:

1. Actualiza la versión en `app.json`, `package.json` y `android/app/build.gradle`; aumenta también `versionCode` en ambos archivos Android (`app.json` y `build.gradle`).
2. Ejecuta `npm run build:android:local` cuando quieras generar el APK.
3. Crea un Release con una etiqueta que coincida con la versión, por ejemplo `v1.0.3`, y adjunta el APK generado.

Android acepta una actualización sobre la instalación anterior cuando se conserva el mismo identificador de paquete (`com.dammerungethan.focusgrades`) y se firma con la misma clave. Las asignaturas y notas se guardan localmente y no deberían borrarse al actualizar.

## Firma privada de Android

La clave de publicación se guarda localmente en `android/app/release.keystore` y sus datos de acceso en `android/keystore.properties`. **No subas esos archivos a GitHub ni los compartas.** Guarda una copia segura de ambos: sin la clave original no se podrán publicar actualizaciones compatibles con las instalaciones existentes.

Los archivos de compilación, dependencias y APK están excluidos del repositorio mediante `.gitignore`; el APK se adjunta a cada GitHub Release.
