import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatoNumero } from '../domain/grades';

const STATE_COLORS = {
  sin_notas: { text: '#b7bdc9', background: '#303540' },
  alcanzable: { text: '#78c6ff', background: '#20374b' },
  meta_alcanzada: { text: '#9fe0a3', background: '#233d2b' },
  aprobada: { text: '#9fe0a3', background: '#233d2b' },
  no_alcanza: { text: '#ff9aaa', background: '#40262d' },
};

export default function SubjectCard({ asignatura, indice, escala, estado, tema, palette, decimales, onOpen }) {
  const colorEstado = STATE_COLORS[estado.tipo] || STATE_COLORS.alcanzable;
  const promedioPct = estado.promedio == null ? 0 : Math.max(0, Math.min(100, estado.promedio / escala * 100));
  return (
    <View style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.border }]}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: tema.pressed }]}><Text style={[styles.iconText, { color: tema.accent }]}>{asignatura.charAt(0).toUpperCase()}</Text></View>
        <Text accessibilityRole="header" style={[styles.name, { color: palette.text }]}>{asignatura}</Text>
        <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`Ver detalles de ${asignatura}`} style={({ pressed }) => [styles.openButton, { backgroundColor: tema.accent }, pressed && styles.pressed]}><Text style={[styles.openText, { color: palette.onAccent }]}>Ver</Text></Pressable>
      </View>
      <View style={[styles.progressArea, { borderTopColor: palette.border }]}>
        <View style={styles.stats}>
          <Text style={[styles.muted, { color: palette.muted }]}>Promedio acumulado</Text>
          <Text style={[styles.average, { color: tema.accent }]}>{estado.promedio == null ? '—' : `${formatoNumero(estado.promedio, decimales)} / ${escala}`}</Text>
        </View>
        <View accessibilityRole="progressbar" accessibilityLabel={`Promedio acumulado de ${asignatura}`} accessibilityValue={{ min: 0, max: escala, now: estado.promedio ?? 0 }} style={[styles.track, { backgroundColor: palette.panel2 }]}><View style={[styles.fill, { width: `${promedioPct}%`, backgroundColor: tema.accent }]} /></View>
        <View style={styles.statusRow}>
          <Text style={[styles.caption, { color: palette.muted }]}>Evaluado {formatoNumero(estado.evaluado, decimales)}% · Pendiente {formatoNumero(estado.pendiente, decimales)}%</Text>
          <View style={[styles.badge, { backgroundColor: colorEstado.background }]}><Text style={[styles.badgeText, { color: colorEstado.text }]}>{estado.etiqueta}</Text></View>
        </View>
        <Text accessibilityLiveRegion="polite" style={[styles.detail, { color: tema.accent }]}>{estado.tipo === 'aprobada' ? 'Ya completaste y aprobaste todas las evaluaciones.' : estado.tipo === 'meta_alcanzada' ? `Ya alcanzaste la nota mínima; te queda ${formatoNumero(estado.pendiente, decimales)}% por evaluar.` : estado.tipo === 'no_alcanza' && estado.pendiente === 0 ? 'Completaste todas las evaluaciones, pero no alcanzaste la nota mínima.' : estado.tipo === 'no_alcanza' ? `Necesitarías ${Number.isFinite(estado.notaNecesaria) ? formatoNumero(estado.notaNecesaria, decimales) : 'una nota imposible'}; la nota máxima es ${escala}.` : `Te falta sacar ${formatoNumero(estado.notaNecesaria, decimales)} / ${escala} en el ${formatoNumero(estado.pendiente, decimales)}% restante.`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10, padding: 13, borderRadius: 15, borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 10 },
  icon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 16, fontWeight: '900' },
  name: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: '800' },
  openButton: { minWidth: 48, minHeight: 44, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  openText: { fontSize: 11, fontWeight: '900' },
  progressArea: { marginTop: 12, paddingTop: 11, borderTopWidth: 1 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  muted: { fontSize: 11, fontWeight: '700' },
  average: { fontSize: 15, fontWeight: '900' },
  track: { height: 9, overflow: 'hidden', marginTop: 10, borderRadius: 5 },
  fill: { height: '100%', borderRadius: 5 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 9 },
  caption: { fontSize: 10 },
  badge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  detail: { fontSize: 11, lineHeight: 17, fontWeight: '700', marginTop: 8 },
  pressed: { opacity: 0.75 },
});
