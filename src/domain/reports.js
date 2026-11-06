import { formatoNumero, obtenerEstadoAsignatura } from './grades';

function campoCsv(valor) {
  const texto = String(valor ?? '');
  return `"${texto.replace(/"/g, '""')}"`;
}

export function crearCsvNotas(asignaturas, notas, escala, fraccionAprobacion, decimales = 1) {
  const filas = [['Asignatura', 'Nota', 'Base', 'Porcentaje', 'Promedio acumulado', 'Evaluado', 'Pendiente', 'Nota necesaria', 'Estado']];
  for (const asignatura of asignaturas) {
    const estado = obtenerEstadoAsignatura(asignatura, notas, escala, fraccionAprobacion);
    const notasMateria = notas.filter(item => item.asignatura === asignatura);
    const registros = notasMateria.length ? notasMateria : [null];
    for (const nota of registros) {
      filas.push([
        asignatura,
        nota ? formatoNumero(nota.nota, decimales) : '',
        nota?.base ?? '',
        nota ? formatoNumero(nota.porcentaje, decimales) : '',
        estado.promedio == null ? '' : formatoNumero(estado.promedio, decimales),
        formatoNumero(estado.evaluado, decimales),
        formatoNumero(estado.pendiente, decimales),
        Number.isFinite(estado.notaNecesaria) ? formatoNumero(estado.notaNecesaria, decimales) : 'Imposible',
        estado.etiqueta,
      ]);
    }
  }
  return `\uFEFF${filas.map(fila => fila.map(campoCsv).join(';')).join('\r\n')}`;
}

export function crearInformeTexto(asignaturas, notas, escala, fraccionAprobacion, decimales = 1) {
  const lineas = [`FOCUS GRADES · Resumen de asignaturas`, `Escala: 0–${escala}`, `Nota mínima: ${formatoNumero(escala * fraccionAprobacion, decimales)} / ${escala}`, ''];
  if (!asignaturas.length) lineas.push('No hay asignaturas registradas.');
  for (const asignatura of asignaturas) {
    const estado = obtenerEstadoAsignatura(asignatura, notas, escala, fraccionAprobacion);
    lineas.push(asignatura);
    lineas.push(`Estado: ${estado.etiqueta}`);
    lineas.push(`Promedio acumulado: ${estado.promedio == null ? 'Sin notas' : `${formatoNumero(estado.promedio, decimales)} / ${escala}`}`);
    lineas.push(`Evaluado: ${formatoNumero(estado.evaluado, decimales)}% · Pendiente: ${formatoNumero(estado.pendiente, decimales)}%`);
    if (estado.tipo === 'no_alcanza' && estado.pendiente === 0) lineas.push('Completaste todas las evaluaciones, pero no alcanzaste la nota mínima.');
    else if (estado.tipo === 'no_alcanza') lineas.push(`No se puede aprobar: necesitarías ${Number.isFinite(estado.notaNecesaria) ? formatoNumero(estado.notaNecesaria, decimales) : 'una nota imposible'} y el máximo es ${escala}.`);
    else if (Number.isFinite(estado.notaNecesaria)) lineas.push(`Nota necesaria en lo pendiente: ${formatoNumero(estado.notaNecesaria, decimales)} / ${escala}`);
    lineas.push('');
  }
  return lineas.join('\n');
}
