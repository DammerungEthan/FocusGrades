import { Alert, Animated, Linking, PanResponder, Pressable, ScrollView, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BASES_NOTA, FRACCION_APROBACION_PREDETERMINADA, formatoNumero, normalizarRespaldo, obtenerEstadoAsignatura, obtenerPromedioActual, obtenerResumenAsignatura, parsearNumero } from './src/domain/grades';
import { describirLanzamiento, esVersionMasNueva, seleccionarApk } from './src/domain/releases';
import { crearCsvNotas, crearInformeTexto } from './src/domain/reports';
import SubjectsScreen from './src/screens/SubjectsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SubjectDetailModal from './src/components/SubjectDetailModal';
import createStyles from './src/theme/createStyles';

// Colores base y temas que se pueden elegir en Configuración.
const COLORS = {
  background: '#111318',
  panel: '#191c23',
  panel2: '#20242d',
  border: '#2a2f3a',
  text: '#f1f3f8',
  muted: '#9299a8',
  onAccent: '#111318',
};

const LIGHT_COLORS = { background: '#f4f6fb', panel: '#ffffff', panel2: '#edf0f6', border: '#d8deea', text: '#202534', muted: '#5d6678', onAccent: '#202534' };

const THEME_OPTIONS = [
  { id: 'purple', name: 'Morado', accent: '#9b8cff', pressed: '#2b2641' },
  { id: 'blue', name: 'Azul', accent: '#66a9ff', pressed: '#1f3551' },
  { id: 'orange', name: 'Naranja', accent: '#ff9b67', pressed: '#493022' },
  { id: 'cyan', name: 'Turquesa', accent: '#49d2d0', pressed: '#1d3b3b' },
  { id: 'rose', name: 'Rosa', accent: '#f181b1', pressed: '#45283a' },
];

// Datos de la versión y claves usadas para guardar la información en el dispositivo.
const GITHUB_OWNER = 'DammerungEthan';
const GITHUB_REPOSITORY = 'FocusGrades';
const APK_ASSET_NAME = 'Focus-Grades.apk';
const APP_VERSION = Constants.expoConfig?.version ?? '2.0.0';
const APP_YEAR = new Date().getFullYear();
const THEME_STORAGE_KEY = 'focus-grades-theme';
const GRADE_SCALE_STORAGE_KEY = 'focus-grades-scale';
const PASS_FRACTION_STORAGE_KEY = 'focus-grades-pass-fraction';
const APP_DATA_STORAGE_KEY = 'focus-grades-data';
const COLOR_MODE_STORAGE_KEY = 'focus-grades-color-mode';
const DECIMAL_PLACES_STORAGE_KEY = 'focus-grades-decimal-places';
const AUTO_UPDATE_STORAGE_KEY = 'focus-grades-auto-update';

// Pantalla principal: mantiene los datos y las acciones de Focus Grades.
function Index() {
  const insets = useSafeAreaInsets();
  const [detalleExpandido, setDetalleExpandido] = useState(false);
  const desplazamientoModal = useRef(new Animated.Value(0)).current;
  const [pestana, setPestana] = useState('asignaturas');
  const [texto, setTexto] = useState('');
  const [asignaturas, setAsignaturas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [nota, setNota] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [notaSimulada, setNotaSimulada] = useState('');
  const [porcentajeSimulado, setPorcentajeSimulado] = useState('');
  const [resultadoSimulacion, setResultadoSimulacion] = useState('');
  const [edicionNotaId, setEdicionNotaId] = useState(null);
  const [notasGuardadas, setNotasGuardadas] = useState([]);
  const [edicionAsignatura, setEdicionAsignatura] = useState(false);
  const [nuevoNombreAsignatura, setNuevoNombreAsignatura] = useState('');
  const [baseNota, setBaseNota] = useState(5);
  const [fraccionAprobacion, setFraccionAprobacion] = useState(FRACCION_APROBACION_PREDETERMINADA);
  const [notaMinimaTexto, setNotaMinimaTexto] = useState('3');
  const [temaId, setTemaId] = useState('purple');
  const [colorMode, setColorMode] = useState('dark');
  const [decimales, setDecimales] = useState(1);
  const [comprobarActualizaciones, setComprobarActualizaciones] = useState(true);
  const [datosListos, setDatosListos] = useState(false);
  const [errorCarga, setErrorCarga] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(false);
  const [reintentoGuardado, setReintentoGuardado] = useState(0);
  const busquedaActualizacionActiva = useRef(false);
  const colaGuardado = useRef(Promise.resolve());
  const [buscandoActualizacion, setBuscandoActualizacion] = useState(false);
  const [estadoActualizacion, setEstadoActualizacion] = useState('');
  const [selectorTemaAbierto, setSelectorTemaAbierto] = useState(false);
  const temaActual = THEME_OPTIONS.find(tema => tema.id === temaId) ?? THEME_OPTIONS[0];
  const palette = colorMode === 'light' ? LIGHT_COLORS : COLORS;
  const styles = useMemo(() => createStyles(temaActual, palette), [temaActual, palette]);

  // Consulta GitHub y permite abrir la descarga cuando hay una versión nueva.
  const verificarActualizacion = async (mostrarResultado = true) => {
    if (!GITHUB_OWNER || !GITHUB_REPOSITORY) {
      if (mostrarResultado) Alert.alert('Comprobador pendiente', 'Falta conectar el repositorio público de GitHub.');
      return;
    }
    if (busquedaActualizacionActiva.current) return;
    busquedaActualizacionActiva.current = true;
    setBuscandoActualizacion(true);
    setEstadoActualizacion('Consultando GitHub…');
    try {
      const controlador = new AbortController();
      const temporizador = setTimeout(() => controlador.abort(), 12000);
      const respuesta = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' }, signal: controlador.signal }).finally(() => clearTimeout(temporizador));
      if (respuesta.status === 404) {
        setEstadoActualizacion('Todavía no hay un Release publicado');
        if (mostrarResultado) Alert.alert('Todavía no hay APK publicado', 'Cuando publiques una versión en Releases de GitHub, podrás descargarla desde aquí.');
        return;
      }
      if (!respuesta.ok) throw new Error('No se pudo consultar el lanzamiento más reciente.');
      const lanzamiento = await respuesta.json();
      const versionNueva = String(lanzamiento.tag_name || '').replace(/^[vV]/, '');
      if (!versionNueva) throw new Error('El lanzamiento no tiene una versión.');
      if (!esVersionMasNueva(versionNueva, APP_VERSION)) {
        const versionLocalEsPosterior = esVersionMasNueva(APP_VERSION, versionNueva);
        setEstadoActualizacion(versionLocalEsPosterior ? `Versión local ${APP_VERSION} · aún no publicada` : `Estás al día · ${APP_VERSION}`);
        if (mostrarResultado) Alert.alert(versionLocalEsPosterior ? 'Esta versión todavía no está publicada' : 'Ya tienes la versión más reciente', versionLocalEsPosterior ? `La última versión en GitHub es ${versionNueva}.` : `Focus Grades ${APP_VERSION} está actualizado.`);
        return;
      }
      setEstadoActualizacion(`Disponible · ${versionNueva}`);
      const apk = seleccionarApk(lanzamiento, APK_ASSET_NAME);
      if (!apk?.browser_download_url) throw new Error(`El lanzamiento ${versionNueva} no contiene el APK.`);
      Alert.alert(`Focus Grades ${versionNueva}`, describirLanzamiento(lanzamiento, apk), [
        { text: 'Más tarde', style: 'cancel' },
        { text: 'Descargar', onPress: () => Linking.openURL(apk.browser_download_url).catch(() => Alert.alert('No se pudo abrir el enlace', 'Revisa tu conexión e inténtalo otra vez.')) },
      ]);
    } catch {
      setEstadoActualizacion('No se pudo consultar GitHub');
      if (mostrarResultado) Alert.alert('No se pudo comprobar', 'Revisa tu conexión y vuelve a intentarlo.');
    } finally {
      busquedaActualizacionActiva.current = false;
      setBuscandoActualizacion(false);
    }
  };

  // Comprueba en segundo plano si hay una actualización disponible cuando el usuario lo permite.
  useEffect(() => {
    if (datosListos && comprobarActualizaciones) verificarActualizacion(false);
    else if (datosListos) setEstadoActualizacion('Comprobación automática desactivada');
  }, [datosListos, comprobarActualizaciones]);

  // Carga la configuración, las asignaturas y las notas al iniciar la app.
  useEffect(() => {
    Promise.all([AsyncStorage.getItem(THEME_STORAGE_KEY), AsyncStorage.getItem(GRADE_SCALE_STORAGE_KEY), AsyncStorage.getItem(PASS_FRACTION_STORAGE_KEY), AsyncStorage.getItem(APP_DATA_STORAGE_KEY), AsyncStorage.getItem(COLOR_MODE_STORAGE_KEY), AsyncStorage.getItem(DECIMAL_PLACES_STORAGE_KEY), AsyncStorage.getItem(AUTO_UPDATE_STORAGE_KEY)]).then(([temaGuardado, escalaGuardada, fraccionGuardada, datosGuardados, modoGuardado, decimalesGuardados, autoUpdateGuardado]) => {
      if (THEME_OPTIONS.some(tema => tema.id === temaGuardado)) setTemaId(temaGuardado);
      if (modoGuardado === 'light' || modoGuardado === 'dark') setColorMode(modoGuardado);
      if (Number(decimalesGuardados) === 1 || Number(decimalesGuardados) === 2) setDecimales(Number(decimalesGuardados));
      if (autoUpdateGuardado === 'false') setComprobarActualizaciones(false);
      const escala = BASES_NOTA.includes(Number(escalaGuardada)) ? Number(escalaGuardada) : 5;
      const fraccion = Number(fraccionGuardada);
      const fraccionValida = Number.isFinite(fraccion) && fraccion > 0 && fraccion <= 1 ? fraccion : FRACCION_APROBACION_PREDETERMINADA;
      const datosLocales = datosGuardados ? JSON.parse(datosGuardados) : { asignaturas: [], notasGuardadas: [] };
      const datosNormalizados = normalizarRespaldo({ app: 'Focus Grades', escala, fraccionAprobacion: fraccionValida, ...datosLocales });
      setBaseNota(escala);
      setFraccionAprobacion(fraccionValida);
      setNotaMinimaTexto(formatoNumero(escala * fraccionValida));
      setAsignaturas(datosNormalizados.asignaturas);
      setNotasGuardadas(datosNormalizados.notasGuardadas);
    }).catch(() => setErrorCarga(true)).finally(() => setDatosListos(true));
  }, []);

  // Guarda los cambios con una breve espera para evitar escrituras repetidas.
  useEffect(() => {
    if (!datosListos || errorCarga) return undefined;
    let activo = true;
    const valores = [
      [THEME_STORAGE_KEY, temaId],
      [GRADE_SCALE_STORAGE_KEY, String(baseNota)],
      [PASS_FRACTION_STORAGE_KEY, String(fraccionAprobacion)],
      [APP_DATA_STORAGE_KEY, JSON.stringify({ asignaturas, notasGuardadas })],
      [COLOR_MODE_STORAGE_KEY, colorMode],
      [DECIMAL_PLACES_STORAGE_KEY, String(decimales)],
      [AUTO_UPDATE_STORAGE_KEY, String(comprobarActualizaciones)],
    ];
    const temporizador = setTimeout(() => {
      colaGuardado.current = colaGuardado.current.catch(() => {}).then(() => AsyncStorage.multiSet(valores)).then(() => {
        if (activo) setErrorGuardado(false);
      }).catch(() => {
        if (activo) setErrorGuardado(true);
      });
    }, 350);
    return () => { activo = false; clearTimeout(temporizador); };
  }, [temaId, baseNota, fraccionAprobacion, asignaturas, notasGuardadas, colorMode, decimales, comprobarActualizaciones, datosListos, errorCarga, reintentoGuardado]);

  // Acciones para agregar asignaturas y registrar o editar sus notas.
  const agregarAsignatura = () => {
    const nombre = texto.trim();
    if (!nombre) return;
    if (asignaturas.some(asignatura => asignatura.toLowerCase() === nombre.toLowerCase())) {
      Alert.alert('Asignatura existente', 'Ya tienes una asignatura con ese nombre.');
      return;
    }
    setAsignaturas(actuales => [...actuales, nombre]);
    setTexto('');
  };

  const agregarNota = () => {
    if (!nota.trim() || !porcentaje.trim()) return;
    const valorNota = parsearNumero(nota);
    const valorPorcentaje = parsearNumero(porcentaje);
    if (!Number.isFinite(valorNota) || valorNota < 0 || valorNota > baseNota) {
      Alert.alert('Nota fuera de escala', `Ingresa una nota entre 0 y ${baseNota}.`);
      return;
    }
    if (!Number.isFinite(valorPorcentaje) || valorPorcentaje <= 0 || valorPorcentaje > 100) {
      Alert.alert('Porcentaje no válido', 'Ingresa un porcentaje mayor que 0 y hasta 100.');
      return;
    }
    const pesoRegistrado = notasGuardadas.filter(item => item.asignatura === seleccionada && item.id !== edicionNotaId).reduce((total, item) => total + parsearNumero(item.porcentaje), 0);
    if (pesoRegistrado + valorPorcentaje > 100) {
      Alert.alert('Porcentaje excedido', `Ya registraste ${formatoNumero(pesoRegistrado)}%. El total de evaluaciones no puede pasar del 100%.`);
      return;
    }
    const notaActualizada = { id: edicionNotaId ?? String(Date.now()), asignatura: seleccionada, nota: String(valorNota), base: baseNota, porcentaje: String(valorPorcentaje) };
    if (edicionNotaId) setNotasGuardadas(actuales => actuales.map(item => item.id === edicionNotaId ? notaActualizada : item));
    else setNotasGuardadas(actuales => [...actuales, notaActualizada]);
    cancelarEdicion();
  };

  // Calcula el efecto hipotético de una nota sin añadirla al registro.
  const simularNota = () => {
    const valorNota = parsearNumero(notaSimulada);
    const valorPorcentaje = parsearNumero(porcentajeSimulado);
    if (!Number.isFinite(valorNota) || valorNota < 0 || valorNota > baseNota) {
      Alert.alert('Nota fuera de escala', `Ingresa una nota entre 0 y ${baseNota}.`);
      return;
    }
    if (!Number.isFinite(valorPorcentaje) || valorPorcentaje <= 0 || valorPorcentaje > 100) {
      Alert.alert('Porcentaje no válido', 'Ingresa un porcentaje mayor que 0 y hasta 100.');
      return;
    }
    const pesoRegistrado = notasGuardadas.filter(item => item.asignatura === seleccionada).reduce((total, item) => total + parsearNumero(item.porcentaje), 0);
    if (pesoRegistrado + valorPorcentaje > 100) {
      Alert.alert('Porcentaje excedido', `Queda un ${formatoNumero(100 - pesoRegistrado)}% por evaluar en esta asignatura.`);
      return;
    }
    const notasConSimulacion = [...notasGuardadas, { id: 'simulacion', asignatura: seleccionada, nota: String(valorNota), base: baseNota, porcentaje: String(valorPorcentaje) }];
    const promedio = obtenerPromedioActual(seleccionada, notasConSimulacion, baseNota);
    const resumen = obtenerResumenAsignatura(seleccionada, notasConSimulacion, baseNota, fraccionAprobacion, decimales);
    setResultadoSimulacion(`Nota acumulada estimada: ${formatoNumero(promedio, decimales)} / ${baseNota}. ${resumen}`);
  };

  const iniciarEdicion = item => {
    const notaConvertida = parsearNumero(item.nota) * baseNota / Number(item.base || baseNota);
    setEdicionNotaId(item.id);
    setNota(String(Number(notaConvertida.toFixed(2))));
    setPorcentaje(item.porcentaje);
  };

  const cancelarEdicion = () => {
    setEdicionNotaId(null);
    setNota('');
    setPorcentaje('');
  };

  const cerrarDetalle = () => {
    cancelarEdicion();
    setNotaSimulada('');
    setPorcentajeSimulado('');
    setResultadoSimulacion('');
    setEdicionAsignatura(false);
    setNuevoNombreAsignatura('');
    setSeleccionada(null);
  };

  const reiniciarDetalle = () => {
    setDetalleExpandido(false);
    desplazamientoModal.setValue(0);
  };

  // Controla los gestos para expandir, contraer o cerrar el detalle.
  const controlVentana = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: (_, gesto) => Math.abs(gesto.dy) > 5 && Math.abs(gesto.dy) > Math.abs(gesto.dx),
    onPanResponderMove: (_, gesto) => desplazamientoModal.setValue(Math.max(0, gesto.dy)),
    onPanResponderRelease: (_, gesto) => {
      if (gesto.dy < -45) setDetalleExpandido(true);
      if (gesto.dy > 110) {
        if (detalleExpandido) setDetalleExpandido(false);
        else {
          Animated.timing(desplazamientoModal, { toValue: 500, duration: 160, useNativeDriver: true }).start(cerrarDetalle);
          return;
        }
      }
      Animated.spring(desplazamientoModal, { toValue: 0, useNativeDriver: true, speed: 24, bounciness: 4 }).start();
    },
    onPanResponderTerminate: () => Animated.spring(desplazamientoModal, { toValue: 0, useNativeDriver: true }).start(),
  }), [cerrarDetalle, detalleExpandido, desplazamientoModal]);

  // Cambia nombres y elimina asignaturas o notas relacionadas.
  const guardarNombreAsignatura = () => {
    const nombreNuevo = nuevoNombreAsignatura.trim();
    if (!nombreNuevo) {
      Alert.alert('Nombre vacío', 'Escribe un nombre para la asignatura.');
      return;
    }
    if (asignaturas.some(asignatura => asignatura !== seleccionada && asignatura.toLowerCase() === nombreNuevo.toLowerCase())) {
      Alert.alert('Nombre repetido', 'Ya existe una asignatura con ese nombre.');
      return;
    }
    const nombreAnterior = seleccionada;
    setAsignaturas(actuales => actuales.map(asignatura => asignatura === nombreAnterior ? nombreNuevo : asignatura));
    setNotasGuardadas(actuales => actuales.map(item => item.asignatura === nombreAnterior ? { ...item, asignatura: nombreNuevo } : item));
    setSeleccionada(nombreNuevo);
    setEdicionAsignatura(false);
  };

  const confirmarEliminarAsignatura = () => Alert.alert('Eliminar asignatura', `¿Quieres eliminar “${seleccionada}” y todas sus notas?`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: () => {
      const nombre = seleccionada;
      setAsignaturas(actuales => actuales.filter(asignatura => asignatura !== nombre));
      setNotasGuardadas(actuales => actuales.filter(item => item.asignatura !== nombre));
      cerrarDetalle();
    } },
  ]);

  const confirmarEliminarNota = item => Alert.alert('Eliminar nota', `¿Eliminar la nota ${item.nota} (${item.porcentaje}%)?`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: () => {
      setNotasGuardadas(actuales => actuales.filter(notaGuardada => notaGuardada.id !== item.id));
      if (edicionNotaId === item.id) cancelarEdicion();
    } },
  ]);

  // Crea una copia de seguridad y permite restaurarla desde un archivo JSON.
  const exportarRespaldo = async () => {
    try {
      const contenido = JSON.stringify({ app: 'Focus Grades', schemaVersion: 1, exportado: new Date().toISOString(), escala: baseNota, fraccionAprobacion, asignaturas, notasGuardadas }, null, 2);
      const archivo = `${FileSystem.cacheDirectory}focus-grades-respaldo-${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(archivo, contenido, { encoding: FileSystem.EncodingType.UTF8 });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Copia creada', 'El archivo de respaldo quedó creado, pero este dispositivo no ofrece opciones para compartirlo.');
        return;
      }
      await Sharing.shareAsync(archivo, { mimeType: 'application/json', dialogTitle: 'Guardar copia de seguridad' });
    } catch {
      Alert.alert('No se pudo crear el respaldo', 'Inténtalo de nuevo en unos momentos.');
    }
  };

  // Configura la escala de notas y la nota mínima para aprobar.
  const cambiarEscala = escala => {
    setBaseNota(escala);
    setNotaMinimaTexto(formatoNumero(escala * fraccionAprobacion));
  };

  const guardarNotaMinima = () => {
    const valor = parsearNumero(notaMinimaTexto);
    if (!Number.isFinite(valor) || valor <= 0 || valor > baseNota) {
      Alert.alert('Nota mínima no válida', `Escribe una nota mayor que 0 y hasta ${baseNota}.`);
      return;
    }
    const fraccion = valor / baseNota;
    setFraccionAprobacion(fraccion);
    Alert.alert('Configuración guardada', `Se aprobará con ${formatoNumero(valor)} sobre ${baseNota}.`);
  };

  const importarRespaldo = async () => {
    try {
      const seleccionArchivo = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/json'], copyToCacheDirectory: true });
      if (seleccionArchivo.canceled) return;
      const textoArchivo = await FileSystem.readAsStringAsync(seleccionArchivo.assets[0].uri);
      const respaldo = normalizarRespaldo(JSON.parse(textoArchivo));
      Alert.alert('Restaurar copia', 'Esto reemplazará las asignaturas, notas y configuración actuales de este dispositivo.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Restaurar', style: 'destructive', onPress: () => {
          setAsignaturas(respaldo.asignaturas);
          setNotasGuardadas(respaldo.notasGuardadas);
          setBaseNota(respaldo.escala);
          setFraccionAprobacion(respaldo.fraccionAprobacion);
          setNotaMinimaTexto(formatoNumero(respaldo.escala * respaldo.fraccionAprobacion));
          setErrorCarga(false);
          cerrarDetalle();
          Alert.alert('Copia restaurada', 'Tus asignaturas y notas ya están disponibles.');
        } },
      ]);
    } catch (error) {
      Alert.alert('No se pudo restaurar', error instanceof Error ? error.message : 'El archivo no se pudo abrir. Selecciona una copia JSON válida de Focus Grades.');
    }
  };

  const estadosAsignaturas = useMemo(() => Object.fromEntries(asignaturas.map(asignatura => [asignatura, obtenerEstadoAsignatura(asignatura, notasGuardadas, baseNota, fraccionAprobacion)])), [asignaturas, notasGuardadas, baseNota, fraccionAprobacion]);

  const abrirAsignatura = asignatura => {
    setSeleccionada(asignatura);
    setResultadoSimulacion('');
  };

  const compartirArchivo = async (nombre, contenido, mimeType, dialogTitle) => {
    try {
      const uri = `${FileSystem.cacheDirectory}${nombre}`;
      await FileSystem.writeAsStringAsync(uri, contenido, { encoding: FileSystem.EncodingType.UTF8 });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Archivo creado', `Se creó ${nombre}, pero este dispositivo no ofrece opciones para compartirlo.`);
        return;
      }
      await Sharing.shareAsync(uri, { mimeType, dialogTitle });
    } catch {
      Alert.alert('No se pudo crear el archivo', 'Revisa el espacio disponible e inténtalo de nuevo.');
    }
  };

  const exportarCsv = () => compartirArchivo(`focus-grades-notas-${Date.now()}.csv`, crearCsvNotas(asignaturas, notasGuardadas, baseNota, fraccionAprobacion, decimales), 'text/csv', 'Exportar notas en CSV');
  const compartirInforme = () => compartirArchivo(`focus-grades-informe-${Date.now()}.txt`, crearInformeTexto(asignaturas, notasGuardadas, baseNota, fraccionAprobacion, decimales), 'text/plain', 'Compartir resumen de asignaturas');

  const cargarDatosDemo = () => Alert.alert('Agregar datos de demostración', 'Añadiré tres materias de ejemplo sin reemplazar tus asignaturas actuales. Luego puedes borrarlas individualmente o limpiar todos los datos.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Agregar ejemplos', onPress: () => {
      const ejemplos = [
        { nombre: 'Biología · demo', notas: [[4.2, 30], [3.8, 25]] },
        { nombre: 'Historia · demo', notas: [[3.1, 40], [4.0, 20]] },
        { nombre: 'Matemáticas · demo', notas: [[2.5, 35], [3.0, 25]] },
      ].map(({ nombre, notas }) => {
        let nombreUnico = nombre;
        let sufijo = 2;
        while (asignaturas.some(actual => actual.toLocaleLowerCase() === nombreUnico.toLocaleLowerCase())) nombreUnico = `${nombre} ${sufijo++}`;
        return { nombre: nombreUnico, notas };
      });
      const nuevasAsignaturas = ejemplos.map(ejemplo => ejemplo.nombre);
      const nuevasNotas = ejemplos.flatMap(ejemplo => ejemplo.notas.map(([valor, peso], indice) => ({ id: `demo-${Date.now()}-${indice}-${ejemplo.nombre}`, asignatura: ejemplo.nombre, nota: String(Number((valor * baseNota / 5).toFixed(2))), base: baseNota, porcentaje: String(peso) })));
      setAsignaturas(actuales => [...actuales, ...nuevasAsignaturas]);
      setNotasGuardadas(actuales => [...actuales, ...nuevasNotas]);
      Alert.alert('Ejemplos agregados', 'Las materias de demostración ya aparecen en tu lista.');
    } },
  ]);

  const borrarDatos = () => Alert.alert('Borrar todas las materias', 'Se eliminarán todas las asignaturas y notas de este dispositivo. Los ajustes de apariencia se conservarán.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Borrar todo', style: 'destructive', onPress: () => {
      setAsignaturas([]);
      setNotasGuardadas([]);
      cerrarDetalle();
      Alert.alert('Datos borrados', 'Se eliminaron todas las asignaturas y notas.');
    } },
  ]);

  const restablecerConfiguracion = () => Alert.alert('Restablecer ajustes', 'Se restablecerán la escala, nota mínima, colores, decimales y búsqueda automática. Tus asignaturas y notas se conservarán.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Restablecer', onPress: () => {
      setBaseNota(5);
      setFraccionAprobacion(FRACCION_APROBACION_PREDETERMINADA);
      setNotaMinimaTexto(formatoNumero(5 * FRACCION_APROBACION_PREDETERMINADA, decimales));
      setTemaId('purple');
      setColorMode('dark');
      setDecimales(1);
      setComprobarActualizaciones(true);
      Alert.alert('Ajustes restablecidos', 'Se conservan todas tus materias y notas.');
    } },
  ]);

  // Dibuja las pestañas, sus contenidos y la ventana de detalle.
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>FG</Text></View>
        <View><Text style={styles.nombreApp}>FOCUS GRADES</Text><Text style={styles.brandCaption}>CONTROL DE NOTAS</Text></View>
      </View>
      {errorCarga ? <View accessibilityRole="alert" style={styles.storageWarning}><Text style={styles.storageWarningText}>No pude leer los datos guardados. Para evitar sobrescribirlos, los cambios nuevos no se guardarán. Restaura una copia desde Configuración.</Text><Pressable onPress={() => setPestana('configuracion')} accessibilityRole="button"><Text style={styles.storageRetryText}>Abrir copias de seguridad</Text></Pressable></View> : null}
      {errorGuardado ? <View accessibilityRole="alert" style={styles.storageWarning}><Text style={styles.storageWarningText}>No se pudieron guardar los últimos cambios. Revisa el espacio disponible.</Text><Pressable onPress={() => setReintentoGuardado(numero => numero + 1)} accessibilityRole="button"><Text style={styles.storageRetryText}>Reintentar guardado</Text></Pressable></View> : null}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenContent}>
        {pestana === 'asignaturas' ? <SubjectsScreen asignaturas={asignaturas} estados={estadosAsignaturas} escala={baseNota} texto={texto} setTexto={setTexto} agregarAsignatura={agregarAsignatura} abrirAsignatura={abrirAsignatura} tema={temaActual} styles={styles} palette={palette} decimales={decimales} /> : <SettingsScreen baseNota={baseNota} fraccionAprobacion={fraccionAprobacion} notaMinimaTexto={notaMinimaTexto} setNotaMinimaTexto={setNotaMinimaTexto} cambiarEscala={cambiarEscala} guardarNotaMinima={guardarNotaMinima} temaActual={temaActual} temaId={temaId} setTemaId={setTemaId} colorMode={colorMode} setColorMode={setColorMode} decimales={decimales} setDecimales={setDecimales} comprobarActualizaciones={comprobarActualizaciones} setComprobarActualizaciones={setComprobarActualizaciones} selectorTemaAbierto={selectorTemaAbierto} setSelectorTemaAbierto={setSelectorTemaAbierto} themes={THEME_OPTIONS} appVersion={APP_VERSION} appYear={APP_YEAR} buscandoActualizacion={buscandoActualizacion} estadoActualizacion={estadoActualizacion} verificarActualizacion={verificarActualizacion} exportarRespaldo={exportarRespaldo} importarRespaldo={importarRespaldo} exportarCsv={exportarCsv} compartirInforme={compartirInforme} cargarDatosDemo={cargarDatosDemo} borrarDatos={borrarDatos} restablecerConfiguracion={restablecerConfiguracion} styles={styles} />}
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable onPress={() => setPestana('asignaturas')} accessibilityRole="tab" accessibilityState={{ selected: pestana === 'asignaturas' }} style={styles.navItem}>
          <Text style={[styles.navIcon, pestana === 'asignaturas' && styles.navIconActive]}>▦</Text><Text style={[styles.navLabel, pestana === 'asignaturas' && styles.navLabelActive]}>Asignaturas</Text>
        </Pressable>
        <Pressable onPress={() => setPestana('configuracion')} accessibilityRole="tab" accessibilityState={{ selected: pestana === 'configuracion' }} style={styles.navItem}>
          <Text style={[styles.navIcon, pestana === 'configuracion' && styles.navIconActive]}>⚙</Text><Text style={[styles.navLabel, pestana === 'configuracion' && styles.navLabelActive]}>Configuración</Text>
        </Pressable>
      </View>

      <SubjectDetailModal visible={seleccionada !== null} seleccionada={seleccionada} detalleExpandido={detalleExpandido} desplazamientoModal={desplazamientoModal} controlVentana={controlVentana} insets={insets} cerrarDetalle={cerrarDetalle} reiniciarDetalle={reiniciarDetalle} edicionAsignatura={edicionAsignatura} nuevoNombreAsignatura={nuevoNombreAsignatura} setNuevoNombreAsignatura={setNuevoNombreAsignatura} guardarNombreAsignatura={guardarNombreAsignatura} setEdicionAsignatura={setEdicionAsignatura} notaSimulada={notaSimulada} setNotaSimulada={setNotaSimulada} porcentajeSimulado={porcentajeSimulado} setPorcentajeSimulado={setPorcentajeSimulado} resultadoSimulacion={resultadoSimulacion} simularNota={simularNota} baseNota={baseNota} nota={nota} setNota={setNota} porcentaje={porcentaje} setPorcentaje={setPorcentaje} edicionNotaId={edicionNotaId} agregarNota={agregarNota} cancelarEdicion={cancelarEdicion} notasGuardadas={notasGuardadas} iniciarEdicion={iniciarEdicion} confirmarEliminarNota={confirmarEliminarNota} confirmarEliminarAsignatura={confirmarEliminarAsignatura} styles={styles} placeholderColor={palette.muted} />

      <StatusBar style={colorMode === 'light' ? 'dark' : 'light'} />
    </View>
  );
}



// Provee el espacio seguro de pantalla que usa la interfaz.
export default function App() {
  return <SafeAreaProvider><Index /></SafeAreaProvider>;
}
