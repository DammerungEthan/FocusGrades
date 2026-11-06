# Focus Grades

Focus Grades ayuda a registrar calificaciones por asignatura, ver el promedio acumulado y saber qué nota necesitas para aprobar. También incluye simulaciones, temas claro y oscuro, respaldos, exportación CSV, informes y comprobación de versiones publicadas en GitHub.

Creada por **DammerungEthan** · [Código fuente](https://github.com/DammerungEthan/FocusGrades) · Licencia [MIT](LICENSE).

## Tecnologías

- React Native y Expo SDK 58
- JavaScript
- AsyncStorage para guardar los datos localmente

## Preparar y probar

Necesitas Node.js y npm. Instala las dependencias desde esta carpeta:

```sh
npm install
```

Para abrir el proyecto con Expo Go:

```sh
npx expo start
```

Escanea el QR desde Expo Go en Android. Si la red local no conecta, prueba `npx expo start --tunnel`. La terminal debe permanecer abierta mientras desarrollas.

## Funciones

- Registra asignaturas y evaluaciones con su nota y porcentaje.
- Selecciona una escala de 0–5, 0–10 o 0–100 y configura la nota mínima para aprobar.
- Consulta en cada materia el promedio acumulado, el porcentaje evaluado y pendiente, la nota que necesitas y el estado de la meta.
- Simula una evaluación sin guardarla en tus notas reales.
- Elige tema claro u oscuro, color de acento, precisión decimal y búsqueda automática de actualizaciones.
- Exporta o restaura un respaldo JSON, comparte las notas como CSV o genera un informe de texto.
- Agrega materias de demostración o borra los datos con confirmación.

## Respaldos y migración a v2

Las materias y notas se guardan en el dispositivo. Antes de desinstalar la versión anterior, abre **Configuración → Copia de seguridad → Exportar JSON** y guarda el archivo fuera del teléfono.

La versión 2.0.0 usa una clave de firma nueva. Android puede impedir instalarla encima de una versión anterior firmada con otra clave. Para migrar, exporta primero el JSON, desinstala la versión antigua si Android lo solicita, instala la v2 y usa **Configuración → Copia de seguridad → Restaurar JSON**. La restauración reemplaza los datos locales actuales.

En las notas del primer Release v2, incluye un aviso visible: “Antes de instalar v2, exporta una copia JSON desde la app anterior. Si Android no permite actualizarla, desinstálala, instala v2 y restaura la copia desde Configuración”.

Las futuras actualizaciones deben conservar el identificador `com.dammerungethan.focusgrades` y firmarse con el mismo keystore de v2. No cambies, regeneres ni compartas ese keystore; conserva una copia segura.

## Compilar APK localmente

La compilación se hace en el PC con Android SDK, Java y las dependencias instaladas. No usa EAS Build. Ejecuta:

```sh
npm run build:android:local
```

La primera compilación puede descargar Gradle y componentes del SDK. El script deja el APK en `dist/Focus-Grades-v2.0.0.apk`. La versión actual es `2.0.0` y el `versionCode` es `4`; ambos deben aumentar en las siguientes versiones.

## Publicar en GitHub

Sube el código fuente y el README al repositorio. No subas `node_modules/`, `.expo/`, `.gradle-local/`, `dist/`, `android/app/release.keystore` ni `android/keystore.properties`; esos elementos están ignorados por Git.

Para publicar el APK, crea un **Release** en GitHub con una etiqueta como `v2.0.0`, añade las notas de cambios y adjunta el archivo de `dist/` como binario. La app consulta los Releases públicos, muestra la versión y las notas, y abre la descarga; Android solicita confirmar la instalación. Las actualizaciones conservan los datos mientras se mantengan el mismo paquete y la firma v2.

## Cambiar la versión

En cada publicación nueva, aumenta la versión en `app.json`, `package.json`, `package-lock.json` y `android/app/build.gradle`. Aumenta también `versionCode` en `app.json` y `android/app/build.gradle`. Después compila, crea el Release con una etiqueta que coincida y adjunta un único APK.

## Privacidad de la firma

El keystore de publicación se encuentra localmente en `android/app/release.keystore`; su configuración está en `android/keystore.properties`. No compartas ni subas estos archivos. Si cambias sus contraseñas, actualiza la configuración local y conserva el mismo certificado de firma para que Android acepte las actualizaciones futuras.
