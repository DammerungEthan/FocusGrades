/**
 * BANCO DE CÓDIGO: React Native + Expo (JavaScript)
 *
 * Este archivo es un catálogo de ejemplos. No es una pantalla de la app.
 * Busca un objeto por su título y copia el texto de su propiedad "codigo".
 * El campo "importar" muestra las líneas exactas que van al inicio de App.js.
 * Si "pegarEn" dice componente completo, esos imports ya están en "codigo";
 * si dice fragmento, agrega los imports arriba del archivo.
 * Si ya tienes un import del mismo paquete, suma los nombres entre llaves.
 * Ejemplo: import { Alert, Button } from 'react-native';
 * Si ya importas Button, modifica esa línea para sumar Alert; no repitas el paquete.
 * Si "pegarEn" dice dentro, pega el fragmento en el lugar indicado.
 *
 * El proyecto actual usa React Native 0.86 y Expo SDK 57.
 * Los ejemplos marcados con dependencia necesitan instalar ese paquete primero.
 */

const repositorioReactNative = [

  // 01 · INICIO: crea una pantalla simple con un texto centrado.
  {
    id: 'pantalla-minima',
    titulo: 'Pantalla mínima con texto',
    categoria: 'Inicio',
    pegarEn: 'Reemplaza el contenido de App.js.',
    importar: `import { StyleSheet, Text, View } from 'react-native';`,
    notas: 'View organiza elementos; Text muestra texto. Esta es una pantalla completa.',
    codigo: `import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.texto}>Hola, mundo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  texto: {
    color: '#222222',
    fontSize: 24,
  },
});`,
  },



  // 02 · TEXTO: muestra títulos, párrafos, varias líneas y texto copiable.
  {
    id: 'texto-formato',
    titulo: 'Texto con formato y varias líneas',
    categoria: 'Texto',
    pegarEn: 'Dentro del View principal del return.',
    importar: `import { Text } from 'react-native';`,
    notas: 'Text puede contener otro Text para dar formato a una parte de la frase.',
    codigo: `<Text style={styles.titulo}>Título de la pantalla</Text>
<Text style={styles.parrafo}>
  Este es un párrafo. <Text style={styles.negrita}>Esta parte va en negrita.</Text>
</Text>
<Text numberOfLines={2} ellipsizeMode="tail">
  Este texto largo se recorta después de dos líneas.
</Text>
<Text selectable>Este texto se puede seleccionar y copiar.</Text>`,
  },



  // 03 · ESTILOS DE TEXTO: define apariencia reutilizable para títulos y párrafos.
  {
    id: 'estilos-texto',
    titulo: 'Estilos útiles para texto',
    categoria: 'Texto',
    pegarEn: 'Dentro del objeto pasado a StyleSheet.create.',
    importar: `import { StyleSheet } from 'react-native';`,
    notas: 'Agrega este import si StyleSheet aún no está importado. fontSize es un número; fontWeight controla el grosor y textAlign la alineación.',
    codigo: `titulo: {
  color: '#111827',
  fontSize: 28,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 12,
},
parrafo: {
  color: '#4b5563',
  fontSize: 16,
  lineHeight: 24,
},
negrita: {
  fontWeight: 'bold',
  color: '#2563eb',
},`,
  },



  // 04 · EDITOR DE TEXTO: permite escribir, ver, contar y borrar texto.
  {
    id: 'editar-texto',
    titulo: 'Escribir, modificar y borrar texto',
    categoria: 'Texto y campos',
    pegarEn: 'Componente completo o adapta sus estados y JSX a App.js.',
    importar: `import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';`,
    notas: 'useState guarda lo escrito. onChangeText actualiza el estado al escribir.',
    codigo: `import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function EditorTexto() {
  const [texto, setTexto] = useState('');

  return (
    <View style={styles.contenedor}>
      <Text>Escribe algo:</Text>
      <TextInput value={texto} onChangeText={setTexto} placeholder="Escribe aquí" style={styles.campo} />
      <Text>Vista previa: {texto || 'Todavía no has escrito nada'}</Text>
      <Text>Caracteres: {texto.length}</Text>
      <Pressable onPress={() => setTexto('')} style={styles.boton}>
        <Text style={styles.textoBoton}>Borrar texto</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 24, gap: 12 },
  campo: { borderWidth: 1, borderColor: '#999999', borderRadius: 8, padding: 12 },
  boton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8 },
  textoBoton: { color: '#ffffff', textAlign: 'center' },
});`,
  },



  // 05 · CAMPO MULTILÍNEA: captura una descripción o un texto largo.
  {
    id: 'campo-multilinea',
    titulo: 'Campo de texto de varias líneas',
    categoria: 'Texto y campos',
    pegarEn: 'Dentro del View del return; agrega useState y TextInput a los imports.',
    importar: `import { useState } from 'react';
import { TextInput } from 'react-native';`,
    notas: 'multiline permite escribir párrafos. textAlignVertical coloca el texto arriba en Android.',
    codigo: `<TextInput
  value={descripcion}
  onChangeText={setDescripcion}
  placeholder="Escribe una descripción"
  multiline
  maxLength={300}
  textAlignVertical="top"
  style={{ minHeight: 120, borderWidth: 1, padding: 12, borderRadius: 8 }}
/>`,
  },



  // 06 · BOTÓN BÁSICO: ejecuta una acción y muestra un aviso.
  {
    id: 'boton-simple',
    titulo: 'Botón básico de React Native',
    categoria: 'Botones',
    pegarEn: 'Dentro del View del return; importa Button.',
    importar: `import { Alert, Button } from 'react-native';`,
    notas: 'onPress recibe la función que se ejecuta al tocar. No uses la etiqueta HTML <button>.',
    codigo: `<Button title="Guardar" onPress={() => Alert.alert('Guardado', 'El cambio se guardó.')} />`,
  },



  // 07 · BOTÓN PERSONALIZADO: cambia de aspecto al tocarse o deshabilitarse.
  {
    id: 'boton-personalizado',
    titulo: 'Botón con apariencia personalizada',
    categoria: 'Botones',
    pegarEn: 'Usa Pressable y Text dentro del View; importa Pressable y Text.',
    importar: `import { Pressable, Text } from 'react-native';`,
    notas: 'pressed permite cambiar el aspecto mientras se mantiene presionado.',
    codigo: `<Pressable
  onPress={guardar}
  disabled={guardando}
  accessibilityRole="button"
  style={({ pressed }) => [
    styles.boton,
    pressed && styles.botonPresionado,
    guardando && styles.botonDesactivado,
  ]}
>
  <Text style={styles.textoBoton}>
    {guardando ? 'Guardando...' : 'Guardar'}
  </Text>
</Pressable>

// Estilos para agregar a StyleSheet.create:
boton: { backgroundColor: '#2563eb', padding: 14, borderRadius: 10 },
botonPresionado: { opacity: 0.7 },
botonDesactivado: { backgroundColor: '#9ca3af' },
textoBoton: { color: '#ffffff', textAlign: 'center', fontWeight: 'bold' },`,
  },



  // 08 · CONTADOR: aumenta un número o lo reinicia con botones.
  {
    id: 'contador',
    titulo: 'Contador con aumentar y reiniciar',
    categoria: 'Botones y estado',
    pegarEn: 'Componente completo.',
    importar: `import { useState } from 'react';
import { Button, Text, View } from 'react-native';`,
    notas: 'Cada llamada a setContador vuelve a dibujar la pantalla con el valor nuevo.',
    codigo: `import { useState } from 'react';
import { Button, Text, View } from 'react-native';

export default function Contador() {
  const [contador, setContador] = useState(0);

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text>Toques: {contador}</Text>
      <Button title="Aumentar" onPress={() => setContador(valor => valor + 1)} />
      <Button title="Reiniciar" onPress={() => setContador(0)} />
    </View>
  );
}`, 
  },



  // 09 · MOSTRAR U OCULTAR: enseña contenido según un estado booleano.
  {
    id: 'mostrar-ocultar',
    titulo: 'Mostrar y ocultar contenido',
    categoria: 'Interacción',
    pegarEn: 'Estados dentro del componente; JSX dentro del View.',
    importar: `import { useState } from 'react';
import { Button, Text } from 'react-native';`,
    notas: 'La condición decide si React Native dibuja ese elemento.',
    codigo: `const [visible, setVisible] = useState(false);

<Button title={visible ? 'Ocultar detalle' : 'Mostrar detalle'} onPress={() => setVisible(actual => !actual)} />

{visible && <Text>Este contenido aparece cuando visible es true.</Text>}`, 
  },



  // 10 · INTERRUPTOR: activa o desactiva una opción Sí/No.
  {
    id: 'switch',
    titulo: 'Interruptor Sí/No',
    categoria: 'Interacción',
    pegarEn: 'Estado dentro del componente; JSX dentro del View. Importa Switch.',
    importar: `import { useState } from 'react';
import { Switch, Text, View } from 'react-native';`,
    notas: 'value controla la posición; onValueChange recibe el nuevo valor booleano.',
    codigo: `const [activado, setActivado] = useState(false);

<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
  <Text>{activado ? 'Activado' : 'Desactivado'}</Text>
  <Switch value={activado} onValueChange={setActivado} />
</View>`,
  },



  // 11 · VENTANA MODAL: abre contenido encima de la pantalla y permite cerrarlo.
  {
    id: 'modal',
    titulo: 'Ventana modal',
    categoria: 'Ventanas',
    pegarEn: 'Componente completo o integra estado, Modal y contenido en tu pantalla.',
    importar: `import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';`,
    notas: 'Modal se muestra por encima de la pantalla. onRequestClose atiende el botón atrás en Android.',
    codigo: `import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

export default function PantallaConModal() {
  const [abierto, setAbierto] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Pressable onPress={() => setAbierto(true)}><Text>Abrir ventana</Text></Pressable>

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#00000088' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Ventana</Text>
            <Text>Este es el contenido del modal.</Text>
            <Pressable onPress={() => setAbierto(false)}><Text style={{ color: '#2563eb', marginTop: 20 }}>Cerrar</Text></Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}`, 
  },



  // 12 · CONFIRMACIÓN: pide aceptar o cancelar una acción destructiva.
  {
    id: 'alerta-confirmacion',
    titulo: 'Alerta con Cancelar y Confirmar',
    categoria: 'Ventanas',
    pegarEn: 'Agrega Alert a los imports; define esta función dentro del componente.',
    importar: `import { Alert } from 'react-native';`,
    notas: 'Alert.alert es una alerta nativa y suele ser más sencilla que crear un Modal.',
    codigo: `const confirmarBorrado = () => {
  Alert.alert(
    '¿Borrar elemento?',
    'Esta acción no se puede deshacer.',
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: borrarElemento },
    ]
  );
};`,
  },



  // 13 · MOVER ELEMENTOS: desplaza un texto con flechas y transformaciones.
  {
    id: 'mover-con-botones',
    titulo: 'Mover un elemento con flechas',
    categoria: 'Posición y diseño',
    pegarEn: 'Estados y funciones dentro del componente; JSX dentro del View.',
    importar: `import { useState } from 'react';
import { Button, Text, View } from 'react-native';`,
    notas: 'translateX y translateY desplazan el elemento sin cambiar el espacio que ocupa.',
    codigo: `const [posicion, setPosicion] = useState({ x: 0, y: 0 });
const mover = (dx, dy) => {
  setPosicion(actual => ({ x: actual.x + dx, y: actual.y + dy }));
};

<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
  <Text style={{ transform: [
    { translateX: posicion.x },
    { translateY: posicion.y },
  ] }}>
    Muéveme
  </Text>
  <View style={{ flexDirection: 'row', gap: 8 }}>
    <Button title="←" onPress={() => mover(-10, 0)} />
    <Button title="→" onPress={() => mover(10, 0)} />
    <Button title="↑" onPress={() => mover(0, -10)} />
    <Button title="↓" onPress={() => mover(0, 10)} />
  </View>
</View>`,
  },



  // 14 · DISEÑO FLEXBOX: alinea elementos en filas, centros y contenedores.
  {
    id: 'alineacion-flexbox',
    titulo: 'Alinear y ordenar elementos',
    categoria: 'Posición y diseño',
    pegarEn: 'Dentro de JSX y en StyleSheet.create.',
    importar: `import { Text, View } from 'react-native';`,
    notas: 'Flexbox es la forma habitual de posicionar elementos en React Native.',
    codigo: `// Fila horizontal, centrada y con espacio entre elementos
<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
  <Text>Izquierda</Text>
  <Text>Derecha</Text>
</View>

// Caja centrada en toda la pantalla
<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
  <Text>Centro</Text>
</View>

// Espacio interior y esquinas redondeadas
<View style={{ padding: 16, margin: 8, borderRadius: 12, backgroundColor: '#eeeeee' }}>
  <Text>Contenido</Text>
</View>`,
  },



  // 15 · DESPLAZAMIENTO: permite recorrer una pantalla con mucho contenido.
  {
    id: 'scrollview',
    titulo: 'Pantalla con desplazamiento',
    categoria: 'Listas y desplazamiento',
    pegarEn: 'Envuelve el contenido de la pantalla en ScrollView; importa ScrollView.',
    importar: `import { ScrollView, Text } from 'react-native';`,
    notas: 'Usa ScrollView para contenido corto o de cantidad conocida; para listas grandes usa FlatList.',
    codigo: `<ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
  <Text style={{ fontSize: 24 }}>Contenido largo</Text>
  <Text>Agrega aquí los bloques de tu pantalla.</Text>
</ScrollView>`,
  },



  // 16 · LISTA EDITABLE: agrega elementos a una lista y permite eliminarlos.
  {
    id: 'lista-agregar-eliminar',
    titulo: 'Lista donde puedes agregar y eliminar elementos',
    categoria: 'Listas y desplazamiento',
    pegarEn: 'Componente completo.',
    importar: `import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';`,
    notas: 'FlatList reutiliza vistas y es preferible a ScrollView para listas largas.',
    codigo: `import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';

export default function ListaEditable() {
  const [nuevo, setNuevo] = useState('');
  const [elementos, setElementos] = useState([
    { id: '1', nombre: 'Primer elemento' },
  ]);

  const agregar = () => {
    const nombre = nuevo.trim();
    if (!nombre) return;
    setElementos(actuales => [...actuales, { id: String(Date.now()), nombre }]);
    setNuevo('');
  };

  const eliminar = id => {
    setElementos(actuales => actuales.filter(elemento => elemento.id !== id));
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput value={nuevo} onChangeText={setNuevo} placeholder="Nuevo elemento" />
      <Pressable onPress={agregar}><Text>Agregar</Text></Pressable>
      <FlatList
        data={elementos}
        keyExtractor={elemento => elemento.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12 }}>
            <Text>{item.nombre}</Text>
            <Pressable onPress={() => eliminar(item.id)}><Text>Eliminar</Text></Pressable>
          </View>
        )}
        ListEmptyComponent={<Text>La lista está vacía.</Text>}
      />
    </View>
  );
}`, 
  },



  // 17 · BÚSQUEDA: filtra una lista conforme se escribe en el campo.
  {
    id: 'buscar-lista',
    titulo: 'Buscar dentro de una lista',
    categoria: 'Listas y desplazamiento',
    pegarEn: 'Componente completo.',
    importar: `import { useMemo, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';`,
    notas: 'La lista de datos queda fuera del componente; useMemo filtra solo cuando cambia la búsqueda.',
    codigo: `import { useMemo, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';

const datos = ['Manzana', 'Pera', 'Uva', 'Naranja'];

export default function ListaBuscable() {
  const [busqueda, setBusqueda] = useState('');
  const resultados = useMemo(
    () => datos.filter(nombre => nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [busqueda]
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput value={busqueda} onChangeText={setBusqueda} placeholder="Buscar fruta" style={{ borderWidth: 1, padding: 12, marginBottom: 12 }} />
      <FlatList
        data={resultados}
        keyExtractor={nombre => nombre}
        renderItem={({ item }) => <Text style={{ padding: 8 }}>{item}</Text>}
        ListEmptyComponent={<Text>No hay coincidencias.</Text>}
      />
    </View>
  );
}`,
  },



  // 18 · FORMULARIO: valida nombre y correo antes de mostrar confirmación.
  {
    id: 'formulario-validacion',
    titulo: 'Formulario sencillo con validación',
    categoria: 'Formularios',
    pegarEn: 'Componente completo o adapta los estados y funciones.',
    importar: `import { useState } from 'react';
import { Alert, Button, TextInput, View } from 'react-native';`,
    notas: 'trim elimina espacios al inicio y al final. El mensaje explica qué falta.',
    codigo: `import { useState } from 'react';
import { Alert, Button, TextInput, View } from 'react-native';

export default function Formulario() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');

  const enviar = () => {
    if (!nombre.trim()) {
      Alert.alert('Falta el nombre', 'Escribe tu nombre antes de continuar.');
      return;
    }
    if (!correo.includes('@')) {
      Alert.alert('Correo no válido', 'Revisa el correo que escribiste.');
      return;
    }
    Alert.alert('Formulario enviado', 'Los datos son válidos.');
  };

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <TextInput value={nombre} onChangeText={setNombre} placeholder="Nombre" />
      <TextInput value={correo} onChangeText={setCorreo} placeholder="Correo" keyboardType="email-address" autoCapitalize="none" />
      <Button title="Enviar" onPress={enviar} />
    </View>
  );
}`, 
  },



  // 19 · TECLADO: evita que el teclado cubra los campos del formulario.
  {
    id: 'teclado',
    titulo: 'Evitar que el teclado tape el formulario',
    categoria: 'Formularios',
    pegarEn: 'Envuelve el contenido de tu pantalla con KeyboardAvoidingView.',
    importar: `import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';`,
    notas: 'Platform permite usar un comportamiento distinto entre iOS y Android.',
    codigo: `import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
  <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }} keyboardShouldPersistTaps="handled">
    {/* Coloca aquí los campos del formulario. */}
  </ScrollView>
</KeyboardAvoidingView>`,
  },



  // 20 · IMÁGENES: muestra una imagen guardada en el proyecto o desde internet.
  {
    id: 'imagen',
    titulo: 'Mostrar una imagen local o de internet',
    categoria: 'Imágenes',
    pegarEn: 'Dentro de JSX; importa Image.',
    importar: `import { Image } from 'react-native';`,
    notas: 'La imagen local debe existir dentro del proyecto. Para uri se necesita ancho y alto.',
    codigo: `// Imagen que guardaste en assets/foto.png
<Image source={require('./assets/foto.png')} style={{ width: 160, height: 160 }} />

// Imagen desde una dirección web
<Image source={{ uri: 'https://ejemplo.com/foto.jpg' }} style={{ width: 200, height: 140, borderRadius: 12 }} resizeMode="cover" />`,
  },



  // 21 · PANTALLAS: alterna entre dos vistas sencillas para practicar navegación.
  {
    id: 'pantallas-basicas',
    titulo: 'Cambiar entre pantallas sencillas',
    categoria: 'Navegación',
    pegarEn: 'Componente completo; útil para practicar. Para una app grande, usa Expo Router.',
    importar: `import { useState } from 'react';
import { Button, Text, View } from 'react-native';`,
    notas: 'Este ejemplo cambia el contenido con estado; no crea navegación con historial.',
    codigo: `import { useState } from 'react';
import { Button, Text, View } from 'react-native';

export default function App() {
  const [pantalla, setPantalla] = useState('inicio');

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 12 }}>
      {pantalla === 'inicio' ? (
        <>
          <Text style={{ fontSize: 24 }}>Inicio</Text>
          <Button title="Abrir perfil" onPress={() => setPantalla('perfil')} />
        </>
      ) : (
        <>
          <Text style={{ fontSize: 24 }}>Perfil</Text>
          <Button title="Volver al inicio" onPress={() => setPantalla('inicio')} />
        </>
      )}
    </View>
  );
}`, 
  },



  // 22 · CARGA Y ERROR: informa si una operación está cargando o falló.
  {
    id: 'espera-carga',
    titulo: 'Indicador de carga y mensaje de error',
    categoria: 'Estados de pantalla',
    pegarEn: 'Estado y JSX dentro del componente; importa ActivityIndicator.',
    importar: `import { useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';`,
    notas: 'Muestra un estado claro mientras esperas una operación.',
    codigo: `const [cargando, setCargando] = useState(false);
const [error, setError] = useState('');

{cargando && <ActivityIndicator size="large" color="#2563eb" />}
{Boolean(error) && <Text style={{ color: '#b91c1c' }}>{error}</Text>}`, 
  },



  // 23 · FUNCIONES DEL TELÉFONO: comparte texto o abre un enlace externo.
  {
    id: 'compartir-enlace',
    titulo: 'Compartir texto o abrir un enlace',
    categoria: 'Funciones del dispositivo',
    pegarEn: 'Agrega Share y Linking a los imports; usa funciones dentro del componente.',
    importar: `import { Button, Linking, Share } from 'react-native';`,
    notas: 'Share y Linking vienen de React Native; el sistema muestra su hoja de compartir.',
    codigo: `const compartir = async () => {
  await Share.share({ message: 'Mira esta app que estoy creando.' });
};

const abrirSitio = async () => {
  const url = 'https://expo.dev';
  const sePuedeAbrir = await Linking.canOpenURL(url);
  if (sePuedeAbrir) await Linking.openURL(url);
};

<Button title="Compartir" onPress={compartir} />
<Button title="Abrir Expo" onPress={abrirSitio} />`,
  },



  // 24 · ALMACENAMIENTO: guarda y lee texto local usando AsyncStorage.
  {
    id: 'guardar-local',
    titulo: 'Guardar datos sencillos en el teléfono',
    categoria: 'Almacenamiento',
    pegarEn: 'Instala el paquete y adapta el ejemplo al componente.',
    importar: `import AsyncStorage from '@react-native-async-storage/async-storage';`,
    dependencia: 'npx expo install @react-native-async-storage/async-storage',
    notas: 'AsyncStorage guarda texto local sin cifrar. No guardes contraseñas ni secretos aquí.',
    codigo: `import AsyncStorage from '@react-native-async-storage/async-storage';

const guardarNombre = async nombre => {
  try {
    await AsyncStorage.setItem('nombre', nombre);
  } catch (error) {
    console.error('No se pudo guardar:', error);
  }
};

const leerNombre = async () => {
  try {
    return await AsyncStorage.getItem('nombre');
  } catch (error) {
    console.error('No se pudo leer:', error);
    return null;
  }
};`,
  },



  // 25 · GALERÍA: pide permiso, elige una foto y la muestra en pantalla.
  {
    id: 'selector-imagen',
    titulo: 'Elegir una imagen de la galería',
    categoria: 'Funciones del dispositivo',
    pegarEn: 'Instala el paquete y pega el componente completo.',
    importar: `import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';`,
    dependencia: 'npx expo install expo-image-picker',
    notas: 'Expo Go incluye este módulo. El ejemplo solicita permiso, permite cancelar y muestra la imagen elegida.',
    codigo: `import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';

export default function SelectorImagen() {
  const [uriImagen, setUriImagen] = useState(null);

  const elegirImagen = async () => {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert('Permiso necesario', 'Permite el acceso a tus fotos para elegir una imagen.');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!resultado.canceled && resultado.assets?.[0]) {
        setUriImagen(resultado.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('No se pudo abrir la galería', 'Inténtalo de nuevo.');
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 12 }}>
      <Pressable onPress={elegirImagen} style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 8 }}><Text style={{ color: '#ffffff' }}>Elegir imagen</Text></Pressable>
      {uriImagen && <Image source={{ uri: uriImagen }} style={{ width: 240, height: 240, borderRadius: 12 }} />}
    </View>
  );
}`,
  },



  // 26 · TEXTO POR COORDENADAS: fija texto en una posición exacta de la pantalla.
  {
    id: 'texto-posicion-absoluta',
    titulo: 'Poner texto en cualquier posición fija',
    categoria: 'Posición y diseño',
    pegarEn: 'Componente completo; reemplaza App.js.',
    importar: `import { Text, View } from 'react-native';`,
    notas: "position: 'absolute' ubica el texto dentro del contenedor. Ajusta top, bottom, left y right; los números se expresan en unidades dp.",
    codigo: `import { Text, View } from 'react-native';

export default function TextoEnLaPantalla() {
  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <Text style={{ position: 'absolute', top: 30, left: 20 }}>Arriba a la izquierda</Text>
      <Text style={{ position: 'absolute', top: 30, right: 20 }}>Arriba a la derecha</Text>
      <Text style={{ position: 'absolute', top: 140, left: 80 }}>Texto en X: 80, Y: 140</Text>
      <Text style={{ position: 'absolute', bottom: 30, right: 20 }}>Abajo a la derecha</Text>
    </View>
  );
}`,
  },



  // 27 · TEXTO AL TOCAR: mueve una etiqueta al punto que el usuario toca.
  {
    id: 'texto-posicion-toque',
    titulo: 'Colocar texto tocando la pantalla',
    categoria: 'Posición y diseño',
    pegarEn: 'Componente completo; reemplaza App.js.',
    importar: `import { useState } from 'react';
import { Pressable, Text } from 'react-native';`,
    notas: 'locationX y locationY son las coordenadas del toque dentro del Pressable. La esquina superior izquierda del texto se coloca en ese punto.',
    codigo: `import { useState } from 'react';
import { Pressable, Text } from 'react-native';

export default function TextoAlTocar() {
  const [posicion, setPosicion] = useState({ x: 30, y: 70 });

  const colocarTexto = evento => {
    const { locationX, locationY } = evento.nativeEvent;
    setPosicion({ x: locationX, y: locationY });
  };

  return (
    <Pressable onPress={colocarTexto} style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <Text style={{ position: 'absolute', left: posicion.x, top: posicion.y, color: '#2563eb', fontSize: 20 }}>Texto aquí</Text>
    </Pressable>
  );
}`,
  },



  // 28 · TEXTO SOBRE IMAGEN: superpone un título o etiqueta en una foto.
  {
    id: 'texto-sobre-imagen',
    titulo: 'Superponer texto sobre una imagen',
    categoria: 'Imágenes y posición',
    pegarEn: 'Dentro del JSX del componente; reemplaza la ruta de imagen por la tuya.',
    importar: `import { Image, Text, View } from 'react-native';`,
    notas: "El contenedor establece el tamaño de la imagen. position: 'absolute' coloca el texto encima, alineado a la parte inferior izquierda.",
    codigo: `import { Image, Text, View } from 'react-native';

<View style={{ height: 240, position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
  <Image source={require('./assets/fondo.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
  <Text style={{ position: 'absolute', left: 16, bottom: 16, color: '#ffffff', fontSize: 22, fontWeight: 'bold' }}>Título sobre la imagen</Text>
</View>`,
  },
];

export default repositorioReactNative;
