export function esVersionMasNueva(remota, instalada) {
  const convertir = version => String(version).replace(/^[vV]/, '').split('.').map(parte => Number.parseInt(parte, 10) || 0);
  const nueva = convertir(remota);
  const actual = convertir(instalada);
  for (let indice = 0; indice < Math.max(nueva.length, actual.length); indice += 1) {
    if ((nueva[indice] || 0) !== (actual[indice] || 0)) return (nueva[indice] || 0) > (actual[indice] || 0);
  }
  return false;
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
