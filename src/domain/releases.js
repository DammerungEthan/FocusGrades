function analizarVersion(version) {
  const coincidencia = String(version).trim().match(/^[vV]?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/);
  return coincidencia ? { numeros: coincidencia.slice(1, 4).map(Number), previa: coincidencia[4] || null } : null;
}

export function compararVersiones(izquierda, derecha) {
  const a = analizarVersion(izquierda);
  const b = analizarVersion(derecha);
  if (!a || !b) return 0;
  for (let indice = 0; indice < 3; indice += 1) {
    if (a.numeros[indice] !== b.numeros[indice]) return a.numeros[indice] > b.numeros[indice] ? 1 : -1;
  }
  if (a.previa === b.previa) return 0;
  if (a.previa === null) return 1;
  if (b.previa === null) return -1;
  return a.previa.localeCompare(b.previa, undefined, { numeric: true });
}

export function esVersionMasNueva(remota, instalada) {
  return compararVersiones(remota, instalada) > 0;
}

export function seleccionarApk(lanzamiento, nombreEstable) {
  const apks = (lanzamiento.assets || []).filter(asset => typeof asset.name === 'string' && asset.name.toLowerCase().endsWith('.apk') && asset.browser_download_url);
  return apks.find(asset => asset.name === nombreEstable)
    || apks.find(asset => /^focus-grades-v\d+(\.\d+)*\.apk$/i.test(asset.name))
    || (apks.length === 1 ? apks[0] : null);
}

export function describirLanzamiento(lanzamiento, apk) {
  const partes = [];
  const notas = String(lanzamiento.body || '').replace(/[#*`_]/g, '').trim().replace(/\s+/g, ' ');
  if (notas) partes.push(`Novedades: ${notas.slice(0, 240)}${notas.length > 240 ? '…' : ''}`);
  if (lanzamiento.published_at) {
    const fecha = new Date(lanzamiento.published_at);
    if (!Number.isNaN(fecha.getTime())) partes.push(`Publicado: ${fecha.toLocaleDateString()}`);
  }
  if (Number.isFinite(apk.size) && apk.size > 0) partes.push(`Descarga: ${(apk.size / (1024 * 1024)).toFixed(1)} MB`);
  partes.push('Después de descargar, abre el APK para instalar la actualización.');
  return partes.join('\n');
}
