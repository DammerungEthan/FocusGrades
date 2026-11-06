import { Animated, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SubjectDetailModal({
  visible, seleccionada, detalleExpandido, desplazamientoModal, controlVentana, insets, cerrarDetalle, reiniciarDetalle,
  edicionAsignatura, nuevoNombreAsignatura, setNuevoNombreAsignatura, guardarNombreAsignatura,
  setEdicionAsignatura, notaSimulada, setNotaSimulada, porcentajeSimulado, setPorcentajeSimulado,
  resultadoSimulacion, simularNota, baseNota, nota, setNota, porcentaje, setPorcentaje, edicionNotaId,
  agregarNota, cancelarEdicion, notasGuardadas, iniciarEdicion, confirmarEliminarNota,
  confirmarEliminarAsignatura, styles, placeholderColor,
}) {
  const notasMateria = notasGuardadas.filter(item => item.asignatura === seleccionada);
  return (
    <Modal visible={visible} transparent animationType="slide" onShow={reiniciarDetalle} onRequestClose={cerrarDetalle} statusBarTranslucent navigationBarTranslucent>
      <KeyboardAvoidingView style={styles.modalKeyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.fondoModal}>
          <View {...controlVentana.panHandlers} style={StyleSheet.absoluteFillObject} />
          <Animated.View style={[styles.contenidoModal, { maxHeight: detalleExpandido ? '100%' : '92%', paddingBottom: Math.max(insets.bottom, 16), transform: [{ translateY: desplazamientoModal }] }]}>
            <View {...controlVentana.panHandlers} accessibilityRole="adjustable" accessibilityLabel="Desliza hacia arriba para expandir o hacia abajo para cerrar" style={styles.modalHandleArea}><View style={styles.modalHandle} /></View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScroll}>
              <Text accessibilityRole="header" style={styles.modalTitle}>{seleccionada}</Text>
              {edicionAsignatura ? <View style={styles.renameBox}><TextInput value={nuevoNombreAsignatura} onChangeText={setNuevoNombreAsignatura} autoFocus accessibilityLabel="Nuevo nombre de la asignatura" placeholder="Nombre de la asignatura" placeholderTextColor={placeholderColor} style={styles.renameInput} /><View style={styles.renameActions}><Pressable onPress={guardarNombreAsignatura} accessibilityRole="button" style={styles.renameSaveButton}><Text style={styles.renameSaveText}>Guardar nombre</Text></Pressable><Pressable onPress={() => setEdicionAsignatura(false)} accessibilityRole="button" style={styles.renameCancelButton}><Text style={styles.renameCancelText}>Cancelar</Text></Pressable></View></View> : <Pressable onPress={() => { setNuevoNombreAsignatura(seleccionada); setEdicionAsignatura(true); }} accessibilityRole="button" style={styles.renameOpenButton}><Text style={styles.renameOpenText}>Editar nombre</Text></Pressable>}
              <View style={styles.simulationCard}>
                <Text style={styles.cardTitle}>Simular una nota</Text><Text style={styles.cardDescription}>Prueba una calificación sin guardarla en tus notas.</Text>
                <View style={styles.filaCampos}><TextInput value={notaSimulada} onChangeText={valor => { setNotaSimulada(valor); setResultadoSimulacion(''); }} keyboardType="decimal-pad" accessibilityLabel={`Nota simulada en escala de 0 a ${baseNota}`} style={styles.campoNota} placeholder={`Nota (0–${baseNota})`} placeholderTextColor={placeholderColor} /><TextInput value={porcentajeSimulado} onChangeText={valor => { setPorcentajeSimulado(valor); setResultadoSimulacion(''); }} keyboardType="decimal-pad" accessibilityLabel="Porcentaje simulado" style={styles.campoPorcentaje} placeholder="Peso (%)" placeholderTextColor={placeholderColor} /></View>
                <Pressable onPress={simularNota} accessibilityRole="button" style={({ pressed }) => [styles.simulationButton, pressed && styles.pressed]}><Text style={styles.simulationButtonText}>Calcular simulación</Text></Pressable>
                {resultadoSimulacion ? <View accessibilityLiveRegion="polite" style={styles.simulationResult}><Text style={styles.simulationResultText}>{resultadoSimulacion}</Text></View> : null}
              </View>
              <View style={styles.formCard}>
                <Text style={styles.sectionEyebrow}>{edicionNotaId ? 'EDITA LA EVALUACIÓN' : 'REGISTRA UNA EVALUACIÓN'}</Text>
                <View style={styles.filaCampos}><TextInput value={nota} onChangeText={setNota} keyboardType="decimal-pad" accessibilityLabel={`Nota en escala de 0 a ${baseNota}`} style={styles.campoNota} placeholder={`Nota (0–${baseNota})`} placeholderTextColor={placeholderColor} /><TextInput value={porcentaje} onChangeText={setPorcentaje} keyboardType="decimal-pad" accessibilityLabel="Porcentaje de la evaluación" style={styles.campoPorcentaje} placeholder="Peso (%)" placeholderTextColor={placeholderColor} /><Pressable onPress={agregarNota} accessibilityRole="button" accessibilityLabel={edicionNotaId ? 'Guardar cambios de la nota' : 'Agregar nota'} style={({ pressed }) => [styles.botonAgregar, styles.notaAddButton, pressed && styles.pressed]}><Text style={styles.textoBoton}>{edicionNotaId ? '✓' : '+'}</Text></Pressable></View>
                {edicionNotaId ? <Pressable onPress={cancelarEdicion} accessibilityRole="button" style={styles.cancelEditButton}><Text style={styles.cancelEditText}>Cancelar edición</Text></Pressable> : null}
              </View>
              <View style={styles.savedGradesSection}>
                <View style={styles.sectionHeading}><View><Text style={styles.sectionEyebrow}>REGISTRO</Text><Text style={styles.listTitle}>Notas guardadas</Text></View><View style={styles.countBadge}><Text style={styles.countText}>{notasMateria.length}</Text></View></View>
                {!notasMateria.length ? <Text style={styles.emptyGradesText}>Todavía no hay notas guardadas para esta asignatura.</Text> : notasMateria.map(item => <View key={item.id} style={styles.savedGrade}><View style={styles.savedGradeCopy}><Text style={styles.savedGradeTitle}>Nota {item.nota} / {item.base || baseNota}</Text><Text style={styles.savedGradeSubtitle}>Peso: {item.porcentaje}%</Text></View><View style={styles.gradeActions}><Pressable onPress={() => iniciarEdicion(item)} accessibilityRole="button" accessibilityLabel={`Editar nota ${item.nota}`} style={({ pressed }) => [styles.editGradeButton, pressed && styles.pressed]}><Text style={styles.editGradeButtonText}>Editar</Text></Pressable><Pressable onPress={() => confirmarEliminarNota(item)} accessibilityRole="button" accessibilityLabel={`Eliminar nota ${item.nota}`} style={({ pressed }) => [styles.deleteGradeButton, pressed && styles.pressed]}><Text style={styles.deleteGradeButtonText}>Borrar</Text></Pressable></View></View>)}
              </View>
              <Pressable onPress={confirmarEliminarAsignatura} accessibilityRole="button" style={({ pressed }) => [styles.deleteSubjectButton, pressed && styles.pressed]}><Text style={styles.deleteSubjectText}>Eliminar asignatura y sus notas</Text></Pressable>
              <Pressable onPress={cerrarDetalle} accessibilityRole="button" style={styles.closeButton}><Text style={styles.closeButtonText}>Cerrar</Text></Pressable>
            </ScrollView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
