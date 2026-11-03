import { Alert, Animated, KeyboardAvoidingView, Linking, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BASES_NOTA, FRACCION_APROBACION_PREDETERMINADA, formatoNumero, normalizarRespaldo, obtenerPromedioActual, obtenerResumenAsignatura, parsearNumero } from './src/domain/grades';
import { describirLanzamiento, esVersionMasNueva, seleccionarApk } from './src/domain/releases';

const COLORS = {
  background: '#111318',
  panel: '#191c23',
  panel2: '#20242d',
  border: '#2a2f3a',
  text: '#f1f3f8',
  muted: '#9299a8',
};

const THEME_OPTIONS = [
  { id: 'purple', name: 'Morado', accent: '#9b8cff', pressed: '#2b2641' },
  { id: 'blue', name: 'Azul', accent: '#66a9ff', pressed: '#1f3551' },
  { id: 'orange', name: 'Naranja', accent: '#ff9b67', pressed: '#493022' },
  { id: 'cyan', name: 'Turquesa', accent: '#49d2d0', pressed: '#1d3b3b' },
  { id: 'rose', name: 'Rosa', accent: '#f181b1', pressed: '#45283a' },
];

const GITHUB_OWNER = 'DammerungEthan';
const GITHUB_REPOSITORY = 'FocusGrades';
const APK_ASSET_NAME = 'Focus-Grades.apk';
const APP_VERSION = Constants.expoConfig?.version ?? '1.0.2';
const APP_YEAR = new Date().getFullYear();
const THEME_STORAGE_KEY = 'focus-grades-theme';
const GRADE_SCALE_STORAGE_KEY = 'focus-grades-scale';
const PASS_FRACTION_STORAGE_KEY = 'focus-grades-pass-fraction';
const APP_DATA_STORAGE_KEY = 'focus-grades-data';

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
  const [edicionNotaId, setEdicionNotaId] = useState(null);
  const [notasGuardadas, setNotasGuardadas] = useState([]);
  const [edicionAsignatura, setEdicionAsignatura] = useState(false);
  const [nuevoNombreAsignatura, setNuevoNombreAsignatura] = useState('');
  const [baseNota, setBaseNota] = useState(5);
  const [fraccionAprobacion, setFraccionAprobacion] = useState(FRACCION_APROBACION_PREDETERMINADA);
  const [notaMinimaTexto, setNotaMinimaTexto] = useState('3');
  const [temaId, setTemaId] = useState('purple');
  const [datosListos, setDatosListos] = useState(false);
  const [errorCarga, setErrorCarga] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(false);
  const [reintentoGuardado, setReintentoGuardado] = useState(0);
  const busquedaActualizacionActiva = useRef(false);
  const colaGuardado = useRef(Promise.resolve());
  const [buscandoActualizacion, setBuscandoActualizacion] = useState(false);
  const [selectorTemaAbierto, setSelectorTemaAbierto] = useState(false);
  const temaActual = THEME_OPTIONS.find(tema => tema.id === temaId) ?? THEME_OPTIONS[0];
  const styles = useMemo(() => createStyles(temaActual), [temaActual]);

  const verificarActualizacion = async (mostrarResultado = true) => {
    if (!GITHUB_OWNER || !GITHUB_REPOSITORY) {
      if (mostrarResultado) Alert.alert('Comprobador pendiente', 'Falta conectar el repositorio público de GitHub.');
      return;
    }
    if (busquedaActualizacionActiva.current) return;
    busquedaActualizacionActiva.current = true;
    setBuscandoActualizacion(true);
    try {
      const respuesta = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
      if (respuesta.status === 404) {
        if (mostrarResultado) Alert.alert('Todavía no hay APK publicado', 'Cuando publiques una versión en Releases de GitHub, podrás descargarla desde aquí.');
        return;
      }
      if (!respuesta.ok) throw new Error('No se pudo consultar el lanzamiento más reciente.');
      const lanzamiento = await respuesta.json();
      const versionNueva = String(lanzamiento.tag_name || '').replace(/^[vV]/, '');
      if (!versionNueva) throw new Error('El lanzamiento no tiene una versión.');
      if (!esVersionMasNueva(versionNueva, APP_VERSION)) {
        if (mostrarResultado) Alert.alert('Ya tienes la versión más reciente', `Focus Grades ${APP_VERSION} está actualizado.`);
        return;
      }
      const apk = seleccionarApk(lanzamiento, APK_ASSET_NAME);
      if (!apk?.browser_download_url) throw new Error(`El lanzamiento ${versionNueva} no contiene el APK.`);
      Alert.alert(`Focus Grades ${versionNueva}`, describirLanzamiento(lanzamiento, apk), [
        { text: 'Más tarde', style: 'cancel' },
        { text: 'Descargar', onPress: () => Linking.openURL(apk.browser_download_url).catch(() => Alert.alert('No se pudo abrir el enlace', 'Revisa tu conexión e inténtalo otra vez.')) },
      ]);
    } catch {
      if (mostrarResultado) Alert.alert('No se pudo comprobar', 'Revisa tu conexión y vuelve a intentarlo.');
    } finally {
      busquedaActualizacionActiva.current = false;
      setBuscandoActualizacion(false);
    }
  };

  useEffect(() => {
    if (GITHUB_OWNER && GITHUB_REPOSITORY) verificarActualizacion(false);
  }, []);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(THEME_STORAGE_KEY), AsyncStorage.getItem(GRADE_SCALE_STORAGE_KEY), AsyncStorage.getItem(PASS_FRACTION_STORAGE_KEY), AsyncStorage.getItem(APP_DATA_STORAGE_KEY)]).then(([temaGuardado, escalaGuardada, fraccionGuardada, datosGuardados]) => {
      if (THEME_OPTIONS.some(tema => tema.id === temaGuardado)) setTemaId(temaGuardado);
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

  useEffect(() => {
    if (!datosListos || errorCarga) return undefined;
    let activo = true;
    const valores = [
      [THEME_STORAGE_KEY, temaId],
      [GRADE_SCALE_STORAGE_KEY, String(baseNota)],
      [PASS_FRACTION_STORAGE_KEY, String(fraccionAprobacion)],
      [APP_DATA_STORAGE_KEY, JSON.stringify({ asignaturas, notasGuardadas })],
    ];
    const temporizador = setTimeout(() => {
      colaGuardado.current = colaGuardado.current.catch(() => {}).then(() => AsyncStorage.multiSet(valores)).then(() => {
        if (activo) setErrorGuardado(false);
      }).catch(() => {
        if (activo) setErrorGuardado(true);
      });
    }, 350);
    return () => { activo = false; clearTimeout(temporizador); };
  }, [temaId, baseNota, fraccionAprobacion, asignaturas, notasGuardadas, datosListos, errorCarga, reintentoGuardado]);

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
    setEdicionAsignatura(false);
    setNuevoNombreAsignatura('');
    setSeleccionada(null);
  };

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

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>FG</Text></View>
        <View><Text style={styles.nombreApp}>FOCUS GRADES</Text><Text style={styles.brandCaption}>CONTROL DE NOTAS</Text></View>
      </View>
      {errorCarga ? <View accessibilityRole="alert" style={styles.storageWarning}><Text style={styles.storageWarningText}>No pude leer los datos guardados. Para evitar sobrescribirlos, los cambios nuevos no se guardarán. Restaura una copia desde Configuración.</Text><Pressable onPress={() => setPestana('configuracion')} accessibilityRole="button"><Text style={styles.storageRetryText}>Abrir copias de seguridad</Text></Pressable></View> : null}
      {errorGuardado ? <View accessibilityRole="alert" style={styles.storageWarning}><Text style={styles.storageWarningText}>No se pudieron guardar los últimos cambios. Revisa el espacio disponible.</Text><Pressable onPress={() => setReintentoGuardado(numero => numero + 1)} accessibilityRole="button"><Text style={styles.storageRetryText}>Reintentar guardado</Text></Pressable></View> : null}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenContent}>
        {pestana === 'asignaturas' ? (
          <>
            <View style={styles.greeting}>
              <Text style={styles.title}>Tus asignaturas</Text>
              <Text style={styles.subtitle}>Organiza tus cursos y lleva el control de tus calificaciones.</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionEyebrow}>NUEVA ASIGNATURA</Text>
              <View style={styles.inputRow}>
                <TextInput value={texto} onChangeText={setTexto} onSubmitEditing={agregarAsignatura} returnKeyType="done" accessibilityLabel="Nombre de la nueva asignatura" placeholder="Escribe el nombre" placeholderTextColor={COLORS.muted} style={styles.campo} />
                <Pressable onPress={agregarAsignatura} accessibilityRole="button" accessibilityLabel="Agregar asignatura" style={({ pressed }) => [styles.botonAgregar, pressed && styles.pressed]}><Text style={styles.textoBoton}>+</Text></Pressable>
              </View>
            </View>

            <View style={styles.sectionHeading}><View><Text style={styles.sectionEyebrow}>TU ESPACIO DE ESTUDIO</Text><Text style={styles.listTitle}>Mis asignaturas</Text></View><View style={styles.countBadge}><Text style={styles.countText}>{asignaturas.length}</Text></View></View>

            {asignaturas.length === 0 ? (
              <View style={styles.emptyCard}><View style={styles.emptyIcon}><Text style={styles.emptyIconText}>＋</Text></View><Text style={styles.emptyTitle}>Aún no tienes asignaturas</Text><Text style={styles.emptySubtitle}>Agrégalas arriba y registra tus notas y porcentajes.</Text></View>
            ) : asignaturas.map((asignatura, indice) => (
              <View key={`${asignatura}-${indice}`} style={styles.elementoLista}>
                <View style={styles.subjectIcon}><Text style={styles.subjectIconText}>{asignatura.charAt(0).toUpperCase()}</Text></View>
                <View style={styles.subjectCopy}><Text style={styles.textoAsignatura}>{asignatura}</Text><Text style={styles.subjectDetail}>{obtenerResumenAsignatura(asignatura, notasGuardadas, baseNota, fraccionAprobacion)}</Text></View>
                <Pressable onPress={() => setSeleccionada(asignatura)} accessibilityRole="button" accessibilityLabel={`Ver detalles de ${asignatura}`} style={({ pressed }) => [styles.elementoCaja, pressed && styles.pressed]}><Text style={styles.infoButtonText}>Ver</Text></Pressable>
              </View>
            ))}
          </>
        ) : pestana === 'estadisticas' ? (
          <>
            <View style={styles.greeting}><Text style={styles.title}>Estadísticas</Text><Text style={styles.subtitle}>Aporte acumulado de tus notas a la materia.</Text></View>
            <View style={styles.calculationHint}><Text style={styles.calculationHintTitle}>Cómo leer el promedio</Text><Text style={styles.calculationHintText}>La barra muestra cuánto aportan tus notas al total de la materia. Por ejemplo, una nota máxima en el 10% aporta el 10% de la escala; el porcentaje no se trata como si ya hubieras evaluado el 100%.</Text></View>
            {asignaturas.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyTitle}>Todavía no hay asignaturas</Text><Text style={styles.emptySubtitle}>Cuando registres notas, verás aquí tus promedios.</Text></View> : asignaturas.map((asignatura, indice) => {
              const promedio = obtenerPromedioActual(asignatura, notasGuardadas, baseNota);
              const porcentajeBarra = promedio === null ? 0 : Math.max(0, Math.min(100, promedio / baseNota * 100));
              const pesoEvaluado = notasGuardadas.filter(item => item.asignatura === asignatura).reduce((total, item) => total + parsearNumero(item.porcentaje), 0);
              return <View key={`${asignatura}-${indice}`} style={styles.statCard}><View style={styles.statHeader}><Text style={styles.statName}>{asignatura}</Text><Text style={styles.statAverage}>{promedio === null ? '—' : `${formatoNumero(promedio)} / ${baseNota}`}</Text></View><View style={styles.chartTrack}><View style={[styles.chartFill, { width: `${porcentajeBarra}%` }]} /></View><Text style={styles.statCaption}>{promedio === null ? 'Sin notas registradas' : `Nota acumulada sobre el 100% · ${formatoNumero(pesoEvaluado)}% evaluado`}</Text></View>;
            })}
          </>
        ) : (
          <>
            <View style={styles.greeting}>
              <Text style={styles.title}>Configuración</Text>
              <Text style={styles.subtitle}>Elige tu escala de notas y personaliza la apariencia.</Text>
            </View>

            <View style={styles.scaleCard}>
              <Text style={styles.cardTitle}>Base de las notas</Text>
              <Text style={styles.cardDescription}>La nota mínima se adapta proporcionalmente a la escala seleccionada.</Text>
              <View style={styles.scaleOptions}>{BASES_NOTA.map(base => {
                const activa = baseNota === base;
                return <Pressable key={base} onPress={() => cambiarEscala(base)} accessibilityRole="radio" accessibilityState={{ selected: activa }} style={[styles.scaleOption, activa && styles.scaleOptionActive]}><Text style={[styles.scaleValue, activa && styles.scaleValueActive]}>0–{base}</Text><Text style={[styles.scaleCaption, activa && styles.scaleCaptionActive]}>Aprueba con {formatoNumero(base * fraccionAprobacion)}</Text></Pressable>;
              })}</View>
              <View style={styles.passGradeRow}><View style={styles.passGradeCopy}><Text style={styles.passGradeTitle}>Nota mínima para aprobar</Text><Text style={styles.cardDescription}>Escala actual: 0–{baseNota}</Text></View><TextInput value={notaMinimaTexto} onChangeText={setNotaMinimaTexto} keyboardType="decimal-pad" accessibilityLabel={`Nota mínima en escala de 0 a ${baseNota}`} style={styles.passGradeInput} /></View>
              <Pressable onPress={guardarNotaMinima} style={({ pressed }) => [styles.passGradeSaveButton, pressed && styles.pressed]}><Text style={styles.passGradeSaveText}>Guardar nota mínima</Text></Pressable>
            </View>

            <View style={styles.appearanceCard}>
              <View style={styles.appearanceHeader}><View style={[styles.themeColorDot, { backgroundColor: temaActual.accent }]} /><View style={styles.appearanceCopy}><Text style={styles.cardTitle}>Color de la app</Text><Text style={styles.cardDescription}>Actual: {temaActual.name}</Text></View><Pressable onPress={() => setSelectorTemaAbierto(abierto => !abierto)} style={({ pressed }) => [styles.themeChangeButton, pressed && styles.pressed]}><Text style={styles.themeChangeButtonText}>{selectorTemaAbierto ? 'Cerrar' : 'Cambiar'}</Text></Pressable></View>
              {selectorTemaAbierto ? <View style={styles.themeOptions}>{THEME_OPTIONS.map(tema => {
                const seleccionado = temaId === tema.id;
                return <Pressable key={tema.id} accessibilityRole="button" accessibilityLabel={`Usar tema ${tema.name}`} accessibilityState={{ selected: seleccionado }} onPress={() => { setTemaId(tema.id); setSelectorTemaAbierto(false); }} style={[styles.themeOption, seleccionado && styles.themeOptionSelected]}><View style={[styles.themeSwatch, { backgroundColor: tema.accent }]}>{seleccionado ? <Text style={styles.themeSwatchCheck}>✓</Text> : null}</View><Text style={[styles.themeOptionName, seleccionado && styles.themeOptionNameSelected]}>{tema.name}</Text></Pressable>;
              })}</View> : null}
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}><View style={styles.infoMark}><Text style={styles.infoMarkText}>i</Text></View><Text style={styles.cardTitle}>Información de la app</Text></View>
              <View style={styles.appDetailRow}><Text style={styles.appDetailLabel}>Nombre</Text><Text style={styles.appDetailValue}>Focus Grades</Text></View>
              <View style={styles.appDetailRow}><Text style={styles.appDetailLabel}>Versión</Text><Text style={styles.appDetailValue}>{APP_VERSION}</Text></View>
              <View style={styles.appDetailRow}><Text style={styles.appDetailLabel}>Año</Text><Text style={styles.appDetailValue}>{APP_YEAR}</Text></View>
              <View style={styles.appDetailRow}><Text style={styles.appDetailLabel}>Contenido</Text><Text style={styles.appDetailValue}>Asignaturas, notas y porcentajes</Text></View>
              <View style={styles.appDetailRow}><Text style={styles.appDetailLabel}>Costo</Text><Text style={styles.appDetailValue}>Gratis</Text></View>
              <View style={styles.appDetailRow}><Text style={styles.appDetailLabel}>Licencia</Text><Text style={styles.appDetailValue}>MIT</Text></View>
              <View style={styles.appDetailRow}><Text style={styles.appDetailLabel}>Creador</Text><Text style={styles.appDetailValue}>DammerungEthan</Text></View>
              <Pressable onPress={() => Linking.openURL('https://github.com/DammerungEthan/FocusGrades')} accessibilityRole="link" style={styles.githubLink}><Text style={styles.githubLinkText}>Código fuente en GitHub ↗</Text></Pressable>
              <View style={styles.appDetailRow}><Text style={styles.appDetailLabel}>Guardado</Text><Text style={styles.appDetailValue}>En este dispositivo</Text></View>
              <Text style={styles.infoText}>Focus Grades te ayuda a organizar tus calificaciones de forma sencilla.</Text>
              <Text style={styles.appCopyright}>© {APP_YEAR} Focus Grades · Controla tu progreso</Text>
            </View>
            <View style={styles.updateCard}><Text style={styles.cardTitle}>Actualizaciones</Text><Text style={styles.cardDescription}>Versión instalada: {APP_VERSION}. Focus Grades revisa GitHub al abrirse.</Text><Pressable onPress={() => verificarActualizacion(true)} disabled={buscandoActualizacion} style={({ pressed }) => [styles.updateButton, pressed && styles.pressed, buscandoActualizacion && styles.buttonDisabled]}><Text style={styles.updateButtonText}>{buscandoActualizacion ? 'Buscando…' : 'Buscar actualización'}</Text></Pressable></View>
            <View style={styles.backupCard}><Text style={styles.cardTitle}>Copia de seguridad</Text><Text style={styles.cardDescription}>Guarda tus datos o restaura una copia anterior de Focus Grades.</Text><View style={styles.backupActions}><Pressable onPress={exportarRespaldo} style={({ pressed }) => [styles.backupButton, pressed && styles.pressed]}><Text style={styles.backupButtonText}>Exportar</Text></Pressable><Pressable onPress={importarRespaldo} style={({ pressed }) => [styles.restoreButton, pressed && styles.pressed]}><Text style={styles.restoreButtonText}>Restaurar</Text></Pressable></View></View>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable onPress={() => setPestana('asignaturas')} accessibilityRole="tab" accessibilityState={{ selected: pestana === 'asignaturas' }} style={styles.navItem}>
          <Text style={[styles.navIcon, pestana === 'asignaturas' && styles.navIconActive]}>▦</Text><Text style={[styles.navLabel, pestana === 'asignaturas' && styles.navLabelActive]}>Asignaturas</Text>
        </Pressable>
        <Pressable onPress={() => setPestana('estadisticas')} accessibilityRole="tab" accessibilityState={{ selected: pestana === 'estadisticas' }} style={styles.navItem}>
          <Text style={[styles.navIcon, pestana === 'estadisticas' && styles.navIconActive]}>▥</Text><Text style={[styles.navLabel, pestana === 'estadisticas' && styles.navLabelActive]}>Estadísticas</Text>
        </Pressable>
        <Pressable onPress={() => setPestana('configuracion')} accessibilityRole="tab" accessibilityState={{ selected: pestana === 'configuracion' }} style={styles.navItem}>
          <Text style={[styles.navIcon, pestana === 'configuracion' && styles.navIconActive]}>⚙</Text><Text style={[styles.navLabel, pestana === 'configuracion' && styles.navLabelActive]}>Configuración</Text>
        </Pressable>
      </View>

      <Modal visible={seleccionada !== null} transparent animationType="slide" onShow={() => { setDetalleExpandido(false); desplazamientoModal.setValue(0); }} onRequestClose={cerrarDetalle} statusBarTranslucent navigationBarTranslucent>
        <KeyboardAvoidingView style={styles.modalKeyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.fondoModal}>
          <View {...controlVentana.panHandlers} style={StyleSheet.absoluteFillObject} />
          <Animated.View style={[styles.contenidoModal, { maxHeight: detalleExpandido ? '100%' : '92%', paddingBottom: Math.max(insets.bottom, 16), transform: [{ translateY: desplazamientoModal }] }]}>
            <View {...controlVentana.panHandlers} accessibilityRole="adjustable" accessibilityLabel="Arrastra hacia arriba para expandir o hacia abajo para cerrar" style={styles.modalHandleArea}><View style={styles.modalHandle} /></View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScroll}>
              <Text style={styles.sectionEyebrow}>DETALLE DE ASIGNATURA</Text>
              <Text style={styles.modalTitle}>{seleccionada}</Text>
              {edicionAsignatura ? <View style={styles.renameBox}><TextInput value={nuevoNombreAsignatura} onChangeText={setNuevoNombreAsignatura} autoFocus placeholder="Nombre de la asignatura" placeholderTextColor={COLORS.muted} style={styles.renameInput} /><View style={styles.renameActions}><Pressable onPress={guardarNombreAsignatura} style={styles.renameSaveButton}><Text style={styles.renameSaveText}>Guardar nombre</Text></Pressable><Pressable onPress={() => setEdicionAsignatura(false)} style={styles.renameCancelButton}><Text style={styles.renameCancelText}>Cancelar</Text></Pressable></View></View> : <Pressable onPress={() => { setNuevoNombreAsignatura(seleccionada); setEdicionAsignatura(true); }} style={styles.renameOpenButton}><Text style={styles.renameOpenText}>Editar nombre</Text></Pressable>}
              <View style={styles.formCard}>
                <Text style={styles.sectionEyebrow}>{edicionNotaId ? 'EDITA LA EVALUACIÓN' : 'REGISTRA UNA EVALUACIÓN'}</Text>
                <View style={styles.filaCampos}>
                  <TextInput value={nota} onChangeText={setNota} keyboardType="decimal-pad" accessibilityLabel={`Nota en escala de 0 a ${baseNota}`} style={styles.campoNota} placeholder={`Nota (0–${baseNota})`} placeholderTextColor={COLORS.muted} />
                  <TextInput value={porcentaje} onChangeText={setPorcentaje} keyboardType="decimal-pad" accessibilityLabel="Porcentaje de la evaluación" style={styles.campoPorcentaje} placeholder="Peso (%)" placeholderTextColor={COLORS.muted} />
                  <Pressable onPress={agregarNota} accessibilityRole="button" accessibilityLabel={edicionNotaId ? 'Guardar cambios de la nota' : 'Agregar nota'} style={({ pressed }) => [styles.botonAgregar, styles.notaAddButton, pressed && styles.pressed]}><Text style={styles.textoBoton}>{edicionNotaId ? '✓' : '+'}</Text></Pressable>
                </View>
                {edicionNotaId ? <Pressable onPress={cancelarEdicion} style={styles.cancelEditButton}><Text style={styles.cancelEditText}>Cancelar edición</Text></Pressable> : null}
              </View>

              <View style={styles.savedGradesSection}>
                <View style={styles.sectionHeading}><View><Text style={styles.sectionEyebrow}>REGISTRO</Text><Text style={styles.listTitle}>Notas guardadas</Text></View><View style={styles.countBadge}><Text style={styles.countText}>{notasGuardadas.filter(item => item.asignatura === seleccionada).length}</Text></View></View>
                {notasGuardadas.filter(item => item.asignatura === seleccionada).length === 0 ? <Text style={styles.emptyGradesText}>Todavía no hay notas guardadas para esta asignatura.</Text> : notasGuardadas.filter(item => item.asignatura === seleccionada).map(item => <View key={item.id} style={styles.savedGrade}><View style={styles.savedGradeCopy}><Text style={styles.savedGradeTitle}>Nota {item.nota} / {item.base || baseNota}</Text><Text style={styles.savedGradeSubtitle}>Peso: {item.porcentaje}%</Text></View><View style={styles.gradeActions}><Pressable onPress={() => iniciarEdicion(item)} accessibilityRole="button" accessibilityLabel={`Editar nota ${item.nota}`} style={({ pressed }) => [styles.editGradeButton, pressed && styles.pressed]}><Text style={styles.editGradeButtonText}>Editar</Text></Pressable><Pressable onPress={() => confirmarEliminarNota(item)} accessibilityRole="button" accessibilityLabel={`Eliminar nota ${item.nota}`} style={({ pressed }) => [styles.deleteGradeButton, pressed && styles.pressed]}><Text style={styles.deleteGradeButtonText}>Borrar</Text></Pressable></View></View>)}
              </View>

              <Pressable onPress={confirmarEliminarAsignatura} style={({ pressed }) => [styles.deleteSubjectButton, pressed && styles.pressed]}><Text style={styles.deleteSubjectText}>Eliminar asignatura y sus notas</Text></Pressable>
              <Pressable onPress={cerrarDetalle} style={styles.closeButton}><Text style={styles.closeButtonText}>Cerrar</Text></Pressable>
            </ScrollView>
          </Animated.View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      <StatusBar style="light" />
    </View>
  );
}

function createStyles(theme) {
return StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  storageWarning: { marginHorizontal: 16, marginTop: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#845c32', backgroundColor: '#34281d' },
  storageWarningText: { color: '#ffdfb0', fontSize: 11, lineHeight: 16 },
  storageRetryText: { color: '#ffd08a', fontSize: 11, fontWeight: '800', marginTop: 8 },
  brandMark: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: COLORS.background, fontSize: 14, fontWeight: '900', letterSpacing: -1 },
  nombreApp: { color: COLORS.text, fontSize: 12, fontWeight: '900', letterSpacing: 1.1 },
  brandCaption: { color: COLORS.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginTop: 3 },
  screenContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  greeting: { marginTop: 14, marginBottom: 18 },
  title: { color: COLORS.text, fontSize: 25, fontWeight: '900', letterSpacing: -0.4 },
  subtitle: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  formCard: { padding: 14, borderRadius: 16, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.border },
  sectionEyebrow: { color: COLORS.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginBottom: 9 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  campo: { flex: 1, minWidth: 0, height: 48, color: COLORS.text, backgroundColor: COLORS.panel2, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 13 },
  botonAgregar: { minWidth: 48, minHeight: 46, paddingHorizontal: 15, borderRadius: 12, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' },
  textoBoton: { color: COLORS.background, textAlign: 'center', fontSize: 18, fontWeight: '900' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25, marginBottom: 11 },
  listTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginTop: 2 },
  countBadge: { minWidth: 30, height: 30, borderRadius: 10, backgroundColor: COLORS.panel2, alignItems: 'center', justifyContent: 'center' },
  countText: { color: theme.accent, fontSize: 12, fontWeight: '900' },
  emptyCard: { alignItems: 'center', padding: 22, borderRadius: 17, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.border },
  emptyIcon: { width: 50, height: 50, borderRadius: 17, backgroundColor: theme.pressed, alignItems: 'center', justifyContent: 'center' },
  emptyIconText: { color: theme.accent, fontSize: 25, fontWeight: '700' },
  emptyTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  emptySubtitle: { color: COLORS.muted, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 5 },
  elementoLista: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 10, padding: 13, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.border, borderRadius: 15 },
  subjectIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: theme.pressed, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  subjectIconText: { color: theme.accent, fontSize: 16, fontWeight: '900' },
  subjectCopy: { flex: 1, minWidth: 0 },
  textoAsignatura: { color: COLORS.text, fontSize: 13, fontWeight: '800' },
  subjectDetail: { color: theme.accent, fontSize: 10, lineHeight: 15, fontWeight: '700', marginTop: 5 },
  elementoCaja: { paddingHorizontal: 12, paddingVertical: 9, backgroundColor: theme.accent, borderRadius: 9 },
  infoButtonText: { color: COLORS.background, fontSize: 10, fontWeight: '900' },
  pressed: { opacity: 0.75 },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  infoCard: { marginTop: 14, padding: 15, borderRadius: 16, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.border },
  infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 12, marginBottom: 2, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoMark: { width: 27, height: 27, borderRadius: 9, backgroundColor: theme.pressed, alignItems: 'center', justifyContent: 'center' },
  infoMarkText: { color: theme.accent, fontSize: 14, fontWeight: '900' },
  appDetailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  appDetailLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700' },
  appDetailValue: { flexShrink: 1, color: COLORS.text, fontSize: 10, fontWeight: '800', textAlign: 'right' },
  githubLink: { alignSelf: 'flex-start', paddingVertical: 8 },
  githubLinkText: { color: '#8daaff', fontSize: 11, fontWeight: '800' },
  infoText: { color: COLORS.muted, fontSize: 10, lineHeight: 16, marginTop: 10 },
  appCopyright: { color: COLORS.muted, fontSize: 9, marginTop: 10 },
  bottomNav: { minHeight: 64, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.background },
  navItem: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', gap: 3 },
  navIcon: { color: COLORS.muted, fontSize: 19, lineHeight: 21 },
  navIconActive: { color: theme.accent },
  navLabel: { color: COLORS.muted, fontSize: 9, fontWeight: '700' },
  navLabelActive: { color: theme.accent },
  fondoModal: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.72)' },
  modalKeyboard: { flex: 1 },
  contenidoModal: { width: '100%', maxHeight: '92%', paddingTop: 11, backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: COLORS.border },
  modalScroll: { paddingHorizontal: 20, paddingBottom: 30 },
  modalHandleArea: { width: '100%', height: 34, alignItems: 'center', justifyContent: 'center' },
  modalHandle: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#626a7a' },
  modalTitle: { color: COLORS.text, fontSize: 21, fontWeight: '900', marginBottom: 18 },
  filaCampos: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 5 },
  campoNota: { flex: 1, minWidth: 0, height: 44, color: COLORS.text, backgroundColor: COLORS.panel2, borderWidth: 1, borderColor: COLORS.border, borderRadius: 11, paddingHorizontal: 9, fontSize: 11 },
  campoPorcentaje: { flex: 1, minWidth: 0, height: 44, color: COLORS.text, backgroundColor: COLORS.panel2, borderWidth: 1, borderColor: COLORS.border, borderRadius: 11, paddingHorizontal: 9, fontSize: 11 },
  notaAddButton: { minWidth: 44, minHeight: 44, paddingHorizontal: 10 },
  cancelEditButton: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 4 },
  cancelEditText: { color: COLORS.muted, fontSize: 10, fontWeight: '700' },
  savedGradesSection: { marginTop: 8 },
  savedGrade: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.panel },
  savedGradeCopy: { flex: 1 },
  savedGradeTitle: { color: COLORS.text, fontSize: 12, fontWeight: '800' },
  savedGradeSubtitle: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  editGradeButton: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 9, backgroundColor: theme.pressed },
  editGradeButtonText: { color: theme.accent, fontSize: 10, fontWeight: '900' },
  emptyGradesText: { color: COLORS.muted, fontSize: 11, lineHeight: 17, padding: 12, borderRadius: 11, backgroundColor: COLORS.panel },
  closeButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: 16, borderRadius: 12, backgroundColor: COLORS.panel2 },
  closeButtonText: { color: COLORS.text, fontSize: 12, fontWeight: '800' },
  scaleCard: { marginBottom: 14, padding: 15, borderRadius: 16, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.border },
  scaleOptions: { flexDirection: 'row', gap: 7, marginTop: 14 },
  scaleOption: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 66, padding: 6, borderRadius: 11, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.panel2 },
  scaleOptionActive: { backgroundColor: theme.pressed, borderColor: theme.accent },
  scaleValue: { color: COLORS.text, fontSize: 14, fontWeight: '900' },
  scaleValueActive: { color: theme.accent },
  scaleCaption: { color: COLORS.muted, fontSize: 8, fontWeight: '700', marginTop: 5, textAlign: 'center' },
  scaleCaptionActive: { color: COLORS.text },
  passGradeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  passGradeCopy: { flex: 1 },
  passGradeTitle: { color: COLORS.text, fontSize: 11, fontWeight: '800' },
  passGradeInput: { width: 82, height: 42, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.panel2, color: COLORS.text, textAlign: 'center', fontSize: 14, fontWeight: '800' },
  passGradeSaveButton: { alignItems: 'center', justifyContent: 'center', minHeight: 40, marginTop: 10, borderRadius: 10, backgroundColor: theme.pressed },
  passGradeSaveText: { color: theme.accent, fontSize: 10, fontWeight: '900' },
  appearanceCard: { marginBottom: 14, padding: 14, borderRadius: 16, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.border },
  appearanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  themeColorDot: { width: 30, height: 30, borderRadius: 10 },
  appearanceCopy: { flex: 1 },
  cardDescription: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  themeChangeButton: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 9, backgroundColor: theme.pressed },
  themeChangeButtonText: { color: theme.accent, fontSize: 10, fontWeight: '900' },
  themeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  themeOption: { minWidth: '30%', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 9, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.panel2 },
  themeOptionSelected: { borderColor: theme.accent, backgroundColor: theme.pressed },
  themeSwatch: { width: 17, height: 17, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  themeSwatchCheck: { color: COLORS.background, fontSize: 11, fontWeight: '900' },
  themeOptionName: { color: COLORS.muted, fontSize: 10, fontWeight: '700' },
  themeOptionNameSelected: { color: COLORS.text },
  statCard: { marginBottom: 11, padding: 14, borderRadius: 15, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.border },
  statHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  statName: { flex: 1, color: COLORS.text, fontSize: 13, fontWeight: '800' },
  statAverage: { color: theme.accent, fontSize: 14, fontWeight: '900' },
  chartTrack: { height: 9, overflow: 'hidden', marginTop: 13, borderRadius: 5, backgroundColor: COLORS.panel2 },
  chartFill: { height: '100%', borderRadius: 5, backgroundColor: theme.accent },
  statCaption: { color: COLORS.muted, fontSize: 10, marginTop: 8 },
  calculationHint: { marginBottom: 14, padding: 13, borderRadius: 13, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.border },
  calculationHintTitle: { color: COLORS.text, fontSize: 11, fontWeight: '800', marginBottom: 5 },
  calculationHintText: { color: COLORS.muted, fontSize: 10, lineHeight: 15 },
  backupCard: { marginTop: 14, padding: 15, borderRadius: 16, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.border },
  updateCard: { marginTop: 14, padding: 15, borderRadius: 16, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.border },
  updateButton: { alignItems: 'center', justifyContent: 'center', minHeight: 43, marginTop: 13, paddingHorizontal: 12, borderRadius: 11, backgroundColor: theme.accent },
  updateButtonText: { color: COLORS.background, fontSize: 11, fontWeight: '900' },
  buttonDisabled: { opacity: 0.55 },
  backupActions: { flexDirection: 'row', gap: 9, marginTop: 13 },
  backupButton: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 43, paddingHorizontal: 12, borderRadius: 11, backgroundColor: theme.accent },
  backupButtonText: { color: COLORS.background, fontSize: 11, fontWeight: '900' },
  restoreButton: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 43, paddingHorizontal: 12, borderRadius: 11, borderWidth: 1, borderColor: theme.accent, backgroundColor: theme.pressed },
  restoreButtonText: { color: theme.accent, fontSize: 11, fontWeight: '900' },
  renameOpenButton: { alignSelf: 'flex-start', marginTop: -9, marginBottom: 14, paddingVertical: 5 },
  renameOpenText: { color: theme.accent, fontSize: 11, fontWeight: '800' },
  renameBox: { marginTop: -7, marginBottom: 14, padding: 12, borderRadius: 12, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.border },
  renameInput: { minHeight: 43, paddingHorizontal: 11, borderRadius: 9, backgroundColor: COLORS.panel2, color: COLORS.text },
  renameActions: { flexDirection: 'row', gap: 9, marginTop: 9 },
  renameSaveButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9, backgroundColor: theme.accent },
  renameSaveText: { color: COLORS.background, fontSize: 10, fontWeight: '900' },
  renameCancelButton: { justifyContent: 'center', paddingHorizontal: 10 },
  renameCancelText: { color: COLORS.muted, fontSize: 10, fontWeight: '700' },
  gradeActions: { flexDirection: 'row', gap: 6 },
  deleteGradeButton: { paddingHorizontal: 9, paddingVertical: 8, borderRadius: 9, backgroundColor: '#3a2028' },
  deleteGradeButtonText: { color: '#ff9aaa', fontSize: 10, fontWeight: '900' },
  deleteSubjectButton: { alignItems: 'center', paddingVertical: 12, marginTop: 14, borderRadius: 11, borderWidth: 1, borderColor: '#613440', backgroundColor: '#2c1c23' },
  deleteSubjectText: { color: '#ff9aaa', fontSize: 11, fontWeight: '800' },
});
}

export default function App() {
  return <SafeAreaProvider><Index /></SafeAreaProvider>;
}
