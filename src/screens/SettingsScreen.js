import { Linking, Pressable, Text, TextInput, View } from 'react-native';
import { BASES_NOTA, formatoNumero } from '../domain/grades';

function OptionButton({ label, selected, onPress, styles, accessibilityLabel, compact = false }) {
  return <Pressable onPress={onPress} accessibilityRole="radio" accessibilityLabel={accessibilityLabel || label} accessibilityState={{ selected }} style={[styles.settingOption, compact && styles.scaleSettingOption, selected && styles.settingOptionActive]}><Text style={[styles.settingOptionText, selected && styles.settingOptionTextActive]}>{label}</Text></Pressable>;
}

function ActionButton({ label, onPress, styles, kind = 'secondary', accessibilityLabel, disabled = false }) {
  return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={accessibilityLabel || label} accessibilityState={{ disabled }} style={({ pressed }) => [styles.settingAction, kind === 'primary' && styles.settingActionPrimary, kind === 'danger' && styles.settingActionDanger, pressed && styles.pressed, disabled && styles.buttonDisabled]}><Text style={[styles.settingActionText, kind === 'primary' && styles.settingActionTextPrimary, kind === 'danger' && styles.settingActionTextDanger]}>{label}</Text></Pressable>;
}

export default function SettingsScreen({
  baseNota, fraccionAprobacion, notaMinimaTexto, setNotaMinimaTexto, cambiarEscala, guardarNotaMinima,
  temaActual, temaId, setTemaId, colorMode, setColorMode, decimales, setDecimales, comprobarActualizaciones,
  setComprobarActualizaciones, selectorTemaAbierto, setSelectorTemaAbierto, themes, appVersion, appYear,
  buscandoActualizacion, estadoActualizacion, verificarActualizacion, exportarRespaldo, importarRespaldo,
  exportarCsv, compartirInforme, cargarDatosDemo, borrarDatos, restablecerConfiguracion, styles,
}) {
  return (
    <>
      <View style={styles.greeting}><Text accessibilityRole="header" style={styles.title}>Configuración</Text><Text style={styles.subtitle}>Personaliza tus notas, apariencia y datos.</Text></View>

      <View style={styles.scaleCard}>
        <Text style={styles.cardTitle}>Base de las notas</Text><Text style={styles.cardDescription}>La nota mínima para aprobar se adapta a la escala.</Text>
        <View style={styles.scaleOptions}>{BASES_NOTA.map(base => <OptionButton key={base} compact label={`0–${base}`} accessibilityLabel={`Escala de cero a ${base}; aprueba con ${formatoNumero(base * fraccionAprobacion)}`} selected={baseNota === base} onPress={() => cambiarEscala(base)} styles={styles} />)}</View>
        <View style={styles.passGradeRow}><View style={styles.passGradeCopy}><Text style={styles.passGradeTitle}>Nota mínima para aprobar</Text><Text style={styles.cardDescription}>Escala actual: 0–{baseNota}</Text></View><TextInput value={notaMinimaTexto} onChangeText={setNotaMinimaTexto} keyboardType="decimal-pad" accessibilityLabel={`Nota mínima en escala de 0 a ${baseNota}`} style={styles.passGradeInput} /></View>
        <ActionButton label="Guardar nota mínima" onPress={guardarNotaMinima} styles={styles} kind="primary" />
      </View>

      <View style={styles.appearanceCard}>
        <Text style={styles.cardTitle}>Apariencia</Text>
        <Text style={styles.cardDescription}>Elige el modo de color y el acento de la app.</Text>
        <View style={styles.settingOptionsRow}><OptionButton label="Oscuro" selected={colorMode === 'dark'} onPress={() => setColorMode('dark')} styles={styles} /><OptionButton label="Claro" selected={colorMode === 'light'} onPress={() => setColorMode('light')} styles={styles} /></View>
        <View style={styles.appearanceHeader}><View style={[styles.themeColorDot, { backgroundColor: temaActual.accent }]} /><View style={styles.appearanceCopy}><Text style={styles.cardTitle}>Color de acento</Text><Text style={styles.cardDescription}>Actual: {temaActual.name}</Text></View><Pressable onPress={() => setSelectorTemaAbierto(abierto => !abierto)} accessibilityRole="button" style={({ pressed }) => [styles.themeChangeButton, pressed && styles.pressed]}><Text style={styles.themeChangeButtonText}>{selectorTemaAbierto ? 'Cerrar' : 'Cambiar'}</Text></Pressable></View>
        {selectorTemaAbierto ? <View style={styles.themeOptions}>{themes.map(tema => <Pressable key={tema.id} accessibilityRole="radio" accessibilityLabel={`Usar tema ${tema.name}`} accessibilityState={{ selected: temaId === tema.id }} onPress={() => { setTemaId(tema.id); setSelectorTemaAbierto(false); }} style={[styles.themeOption, temaId === tema.id && styles.themeOptionSelected]}><View style={[styles.themeSwatch, { backgroundColor: tema.accent }]}>{temaId === tema.id ? <Text style={styles.themeSwatchCheck}>✓</Text> : null}</View><Text style={[styles.themeOptionName, temaId === tema.id && styles.themeOptionNameSelected]}>{tema.name}</Text></Pressable>)}</View> : null}
      </View>

      <View style={styles.preferencesCard}>
        <Text style={styles.cardTitle}>Preferencias</Text>
        <Text style={styles.cardDescription}>Ajustes guardados en este dispositivo.</Text>
        <Text style={styles.preferenceLabel}>Decimales en los resultados</Text>
        <View style={styles.settingOptionsRow}><OptionButton label="1 decimal" selected={decimales === 1} onPress={() => setDecimales(1)} styles={styles} /><OptionButton label="2 decimales" selected={decimales === 2} onPress={() => setDecimales(2)} styles={styles} /></View>
        <View style={styles.preferenceRow}><View style={styles.preferenceCopy}><Text style={styles.preferenceLabel}>Buscar actualizaciones al abrir</Text><Text style={styles.cardDescription}>Consulta los Releases públicos de GitHub.</Text></View><Pressable onPress={() => setComprobarActualizaciones(valor => !valor)} accessibilityRole="switch" accessibilityLabel="Buscar actualizaciones automáticamente al abrir" accessibilityState={{ checked: comprobarActualizaciones }} style={[styles.switchButton, comprobarActualizaciones && styles.switchButtonOn]}><View style={[styles.switchKnob, comprobarActualizaciones && styles.switchKnobOn]} /></Pressable></View>
        <ActionButton label="Restablecer ajustes" onPress={restablecerConfiguracion} styles={styles} />
      </View>

      <View style={styles.updateCard}>
        <Text style={styles.cardTitle}>Actualizaciones</Text><Text style={styles.cardDescription}>Versión instalada: {appVersion}. La descarga se instala desde Android.</Text>
        {estadoActualizacion ? <Text accessibilityLiveRegion="polite" style={styles.updateStatus}>{estadoActualizacion}</Text> : null}
        <ActionButton label={buscandoActualizacion ? 'Buscando…' : 'Buscar actualización'} onPress={() => verificarActualizacion(true)} styles={styles} kind="primary" disabled={buscandoActualizacion} />
      </View>

      <View style={styles.backupCard}>
        <Text style={styles.cardTitle}>Copia de seguridad</Text><Text style={styles.cardDescription}>Exporta o restaura asignaturas, notas y ajustes de calificación.</Text>
        <View style={styles.backupActions}><ActionButton label="Exportar JSON" onPress={exportarRespaldo} styles={styles} kind="primary" /><ActionButton label="Restaurar JSON" onPress={importarRespaldo} styles={styles} /></View>
        <View style={styles.backupActions}><ActionButton label="Exportar CSV" onPress={exportarCsv} styles={styles} /><ActionButton label="Compartir informe" onPress={compartirInforme} styles={styles} /></View>
      </View>

      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>Datos de ejemplo y limpieza</Text><Text style={styles.cardDescription}>Los datos de ejemplo se agregan sin reemplazar tus materias. Puedes borrar todo desde aquí.</Text>
        <ActionButton label="Agregar datos de demostración" onPress={cargarDatosDemo} styles={styles} />
        <ActionButton label="Borrar todas las asignaturas y notas" onPress={borrarDatos} styles={styles} kind="danger" />
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}><View style={styles.infoMark}><Text style={styles.infoMarkText}>i</Text></View><Text style={styles.cardTitle}>Información de la app</Text></View>
        <View style={styles.appDetailRow}><Text style={styles.appDetailLabel}>Nombre</Text><Text style={styles.appDetailValue}>Focus Grades</Text></View>
        <View style={styles.appDetailRow}><Text style={styles.appDetailLabel}>Versión</Text><Text style={styles.appDetailValue}>{appVersion}</Text></View>
        <View style={styles.appDetailRow}><Text style={styles.appDetailLabel}>Año</Text><Text style={styles.appDetailValue}>{appYear}</Text></View>
        <View style={styles.appDetailRow}><Text style={styles.appDetailLabel}>Licencia</Text><Text style={styles.appDetailValue}>MIT</Text></View>
        <View style={styles.appDetailRow}><Text style={styles.appDetailLabel}>Creador</Text><Text style={styles.appDetailValue}>DammerungEthan</Text></View>
        <Pressable onPress={() => Linking.openURL('https://github.com/DammerungEthan/FocusGrades')} accessibilityRole="link" style={styles.githubLink}><Text style={styles.githubLinkText}>Código fuente en GitHub ↗</Text></Pressable>
        <Text style={styles.infoText}>Tus asignaturas y notas se guardan en este dispositivo.</Text><Text style={styles.appCopyright}>© {appYear} Focus Grades</Text>
      </View>
    </>
  );
}
