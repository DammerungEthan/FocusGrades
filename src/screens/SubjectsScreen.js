import { Pressable, Text, TextInput, View } from 'react-native';
import SubjectCard from '../components/SubjectCard';

export default function SubjectsScreen({ asignaturas, estados, escala, texto, setTexto, agregarAsignatura, abrirAsignatura, tema, styles, palette, decimales }) {
  return (
    <>
      <View style={styles.greeting}><Text accessibilityRole="header" style={styles.title}>Tus asignaturas</Text><Text style={styles.subtitle}>Consulta tu promedio y lo que necesitas para aprobar.</Text></View>
      <View style={styles.formCard}>
        <Text style={styles.sectionEyebrow}>NUEVA ASIGNATURA</Text>
        <View style={styles.inputRow}>
          <TextInput value={texto} onChangeText={setTexto} onSubmitEditing={agregarAsignatura} returnKeyType="done" accessibilityLabel="Nombre de la nueva asignatura" placeholder="Escribe el nombre" placeholderTextColor={palette.muted} style={styles.campo} />
          <Pressable onPress={agregarAsignatura} accessibilityRole="button" accessibilityLabel="Agregar asignatura" style={({ pressed }) => [styles.botonAgregar, pressed && styles.pressed]}><Text style={styles.textoBoton}>+</Text></Pressable>
        </View>
      </View>
      <View style={styles.sectionHeading}><Text accessibilityRole="header" style={styles.listTitle}>Mis asignaturas</Text><View accessibilityLabel={`${asignaturas.length} asignaturas`} style={styles.countBadge}><Text style={styles.countText}>{asignaturas.length}</Text></View></View>
      {asignaturas.length === 0 ? (
        <View style={styles.emptyCard}><View style={styles.emptyIcon}><Text style={styles.emptyIconText}>＋</Text></View><Text style={styles.emptyTitle}>Aún no tienes asignaturas</Text><Text style={styles.emptySubtitle}>Agrégalas arriba o carga datos de ejemplo desde Configuración.</Text></View>
      ) : asignaturas.map((asignatura, indice) => <SubjectCard key={`${asignatura}-${indice}`} asignatura={asignatura} indice={indice} escala={escala} estado={estados[asignatura]} tema={tema} palette={palette} decimales={decimales} onOpen={() => abrirAsignatura(asignatura)} />)}
    </>
  );
}
