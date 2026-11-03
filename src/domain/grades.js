export const BASES_NOTA = [5, 10, 100];
export const FRACCION_APROBACION_PREDETERMINADA = 0.6;

export function parsearNumero(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : Number.NaN;
  if (typeof valor !== 'string' || !valor.trim()) return Number.NaN;
  const numero = Number(valor.trim().replace(',', '.'));
  return Number.isFinite(numero) ? numero : Number.NaN;
}

export function formatoNumero(valor) {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
}

export function obtenerPromedioActual(asignatura, notasGuardadas, escala) {
  const notas = notasGuardadas.filter(item => item.asignatura === asignatura);
  if (notas.length === 0) return null;
  const puntos = notas.reduce((total, item) => {
    const nota = parsearNumero(item.nota);
    const porcentaje = parsearNumero(item.porcentaje);
    const base = parsearNumero(item.base) || escala;
    return total + ((nota * escala) / base) * porcentaje;
  }, 0);
  return puntos / 100;
}

export function obtenerResumenAsignatura(asignatura, notasGuardadas, escala, fraccionAprobacion) {
  const notas = notasGuardadas.filter(item => item.asignatura === asignatura);
  const peso = notas.reduce((total, item) => total + parsearNumero(item.porcentaje), 0);
  const promedio = obtenerPromedioActual(asignatura, notasGuardadas, escala);
  const puntos = promedio === null ? 0 : promedio * 100;
  const restante = Math.max(0, 100 - peso);
  const notaAprobatoria = escala * fraccionAprobacion;

  if (notas.length === 0) return `Te falta sacar un ${formatoNumero(notaAprobatoria)} en el 100% restante para ganar la materia.`;
  if (restante === 0) return puntos / 100 >= notaAprobatoria ? 'Ya alcanzas la nota para ganar la materia.' : 'Ya no alcanza el porcentaje restante para ganar la materia.';

  const necesaria = (notaAprobatoria * 100 - puntos) / restante;
  if (necesaria <= 0) return 'Con lo que llevas ya alcanzas la nota para ganar la materia.';
  if (necesaria <= escala) return `Te falta sacar un ${formatoNumero(necesaria)} en el ${formatoNumero(restante)}% restante para ganar la materia.`;
  return `No alcanza el porcentaje restante: necesitarías ${formatoNumero(necesaria)} y la nota máxima es ${formatoNumero(escala)}.`;
}

export function normalizarRespaldo(respaldo) {
  if (!respaldo || respaldo.app !== 'Focus Grades' || (respaldo.schemaVersion != null && respaldo.schemaVersion !== 1)) {
    throw new Error('El archivo no pertenece a una versión compatible de Focus Grades.');
  }

  const escala = Number(respaldo.escala);
  const fraccionAprobacion = Number(respaldo.fraccionAprobacion ?? FRACCION_APROBACION_PREDETERMINADA);
  if (!BASES_NOTA.includes(escala) || !Number.isFinite(fraccionAprobacion) || fraccionAprobacion <= 0 || fraccionAprobacion > 1) {
    throw new Error('La escala o la nota mínima del respaldo no es válida.');
  }

  if (!Array.isArray(respaldo.asignaturas) || !Array.isArray(respaldo.notasGuardadas)) {
    throw new Error('El respaldo no contiene listas válidas de asignaturas y notas.');
  }

  const asignaturas = respaldo.asignaturas.map(nombre => typeof nombre === 'string' ? nombre.trim() : '');
  const nombres = new Set();
  for (const nombre of asignaturas) {
    const clave = nombre.toLocaleLowerCase();
    if (!nombre || nombres.has(clave)) throw new Error('El respaldo tiene asignaturas vacías o repetidas.');
    nombres.add(clave);
  }

  const identificadores = new Set();
  const notasGuardadas = respaldo.notasGuardadas.map((item, indice) => {
    const asignatura = typeof item?.asignatura === 'string' ? item.asignatura.trim() : '';
    if (!item || !asignaturas.includes(asignatura)) {
      throw new Error('Hay una nota asociada a una asignatura que no existe.');
    }
    const nota = parsearNumero(item.nota);
    const porcentaje = parsearNumero(item.porcentaje);
    const base = item.base == null ? escala : parsearNumero(item.base);
    if (!BASES_NOTA.includes(base) || !Number.isFinite(nota) || nota < 0 || nota > base || !Number.isFinite(porcentaje) || porcentaje <= 0 || porcentaje > 100) {
      throw new Error(`La nota o el porcentaje de “${item.asignatura}” no es válido.`);
    }
    let id = item.id == null ? `importada-${indice + 1}` : String(item.id).trim();
    if (!id) id = `importada-${indice + 1}`;
    while (identificadores.has(id)) id = `${id}-${indice + 1}`;
    identificadores.add(id);
    return { id, asignatura, nota: String(nota), porcentaje: String(porcentaje), base };
  });

  const pesos = new Map(asignaturas.map(nombre => [nombre, 0]));
  for (const item of notasGuardadas) pesos.set(item.asignatura, pesos.get(item.asignatura) + parsearNumero(item.porcentaje));
  if ([...pesos.values()].some(peso => peso > 100)) throw new Error('El total de porcentajes de una asignatura supera el 100%.');

  return { escala, fraccionAprobacion, asignaturas, notasGuardadas };
}
