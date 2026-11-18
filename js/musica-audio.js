// Prepara el audio de Música antes de subirlo: mide, recomprime a 128 kbps si hace falta y calcula el hash.
// ffmpeg.wasm (un solo hilo, no necesita cabeceras especiales) se carga solo cuando hace falta.
const MAX_MB = 15, MAX_SEG = 15 * 60, KBPS = 128, MIN_KBPS = 96, TOPE = KBPS * 1.05, MAX_VIDEO_MB = 250;
const T_CARGA = 60000, T_EXEC = 240000;
const CDN = 'https://cdn.jsdelivr.net/npm/';
const URL_FF = CDN + '@ffmpeg/ffmpeg@0.12.10/dist/umd/', URL_CORE = CDN + '@ffmpeg/core@0.12.6/dist/umd/';

let ocupado = false, ff = null, urls = [], cancelado = false;
const err = (codigo, extra) => Object.assign(new Error(codigo), { codigo, extra });
const extDe = n => ((n.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5));
const esVideo = f => /^video\//.test(f.type) || /^(mp4|mov|m4v|webm)$/.test(extDe(f.name));

export const MENSAJES = {
  ocupado: 'Ya se está procesando otro archivo. Espera a que termine.',
  largo: 'Dura más de 15 minutos.',
  grande: 'Pesa más de 15 MB incluso tras recomprimir.',
  grande_video: 'El vídeo pesa más de 250 MB.',
  bajo: 'La calidad es demasiado baja (menos de 96 kbps).',
  timeout: 'El procesado tardó demasiado (más de 60 s al cargar). Inténtalo de nuevo.',
  cancelado: 'Cancelado.',
  formato: 'No se pudo leer el audio de este archivo.',
  carga: 'No se pudo cargar el procesador de audio. Comprueba tu conexión.',
};

function cargaScript(u){ return new Promise((ok, ko) => { if (window.FFmpegWASM) return ok(); const e = document.createElement('script'); e.src = u; e.onload = ok; e.onerror = () => ko(err('carga')); document.head.appendChild(e); }); }
async function blobUrl(u, tipo){ const r = await fetch(u); if (!r.ok) throw err('carga'); const b = URL.createObjectURL(new Blob([await r.arrayBuffer()], { type: tipo })); urls.push(b); return b; }
const conTimeout = (p, ms, c) => { let t; return Promise.race([p, new Promise((_, ko) => { t = setTimeout(() => ko(err(c)), ms); })]).finally(() => clearTimeout(t)); };

async function cargaFF(estado){
  estado('Preparando el procesador de audio…');
  await conTimeout((async () => {
    await cargaScript(URL_FF + 'ffmpeg.js');
    ff = new window.FFmpegWASM.FFmpeg();
    // El worker y el núcleo viven en otro dominio: se cargan como blob para que el navegador los acepte.
    const [classWorkerURL, coreURL, wasmURL] = await Promise.all([blobUrl(URL_FF + '814.ffmpeg.js', 'text/javascript'), blobUrl(URL_CORE + 'ffmpeg-core.js', 'text/javascript'), blobUrl(URL_CORE + 'ffmpeg-core.wasm', 'application/wasm')]);
    await ff.load({ classWorkerURL, coreURL, wasmURL });
  })(), T_CARGA, 'timeout');
}
function liberaFF(){ try { ff && ff.terminate(); } catch (e) {} ff = null; urls.forEach(u => URL.revokeObjectURL(u)); urls = []; }

function metadatos(file){ // duración sin ffmpeg, con el propio navegador
  return new Promise((res, ko) => {
    const u = URL.createObjectURL(file), m = document.createElement(esVideo(file) ? 'video' : 'audio'); m.preload = 'metadata';
    const fin = v => { URL.revokeObjectURL(u); m.removeAttribute('src'); m.load(); v instanceof Error ? ko(v) : res(v); };
    m.onloadedmetadata = () => fin(isFinite(m.duration) ? m.duration : 0); m.onerror = () => fin(err('formato')); m.src = u;
  });
}
export async function hashHex(file){ const h = await crypto.subtle.digest('SHA-256', await file.arrayBuffer()); return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join(''); }

async function sondea(entrada){ // codec y bitrate reales del audio, leídos del log de ffmpeg
  let log = ''; const f = ({ message }) => { log += message + '\n'; }; ff.on('log', f);
  try { await ff.exec(['-i', entrada], 20000); } catch (e) {} ff.off('log', f);
  const m = /Audio:\s*(\w+)[^\n]*?(\d+)\s*kb\/s/i.exec(log);
  return m ? { codec: m[1].toLowerCase(), kbps: +m[2] } : { codec: '', kbps: 0 };
}

// Devuelve { file, ext, dur, kbps, hash, recomprimido }. Lanza Error con .codigo (ver MENSAJES).
export async function preparaAudio(file, estado = () => {}){
  if (ocupado) throw err('ocupado'); ocupado = true; cancelado = false;
  const nombreIn = 'in.' + (extDe(file.name) || 'bin');
  try {
    const vid = esVideo(file), ext0 = extDe(file.name);
    if (vid && file.size > MAX_VIDEO_MB * 1048576) throw err('grande_video');
    if (!vid && file.size > MAX_MB * 1048576 * 4) throw err('grande');   // freno barato para archivos enormes
    estado('Leyendo el archivo…');
    const dur = await metadatos(file); if (dur > MAX_SEG) throw err('largo');
    const kbpsEst = dur ? file.size * 8 / dur / 1000 : 0;
    const directo = !vid && (ext0 === 'mp3' || ext0 === 'm4a') && dur > 0;
    let out = file, ext = ext0, kbps = Math.round(kbpsEst), recomprimido = false;

    if (directo && kbpsEst <= TOPE){                        // 128 o menos: no se toca
      if (kbpsEst < MIN_KBPS) throw err('bajo');
    } else {                                                // hace falta ffmpeg
      await cargaFF(estado); if (cancelado) throw err('cancelado');
      estado('Procesando el audio…');
      await ff.writeFile(nombreIn, new Uint8Array(await file.arrayBuffer()));
      const sonda = await sondea(nombreIn); if (cancelado) throw err('cancelado');
      const real = sonda.kbps || kbpsEst;
      if (real && real < MIN_KBPS && (vid || sonda.kbps)) throw err('bajo');
      if (!sonda.codec && vid) throw err('formato');
      if (sonda.codec === 'aac' && real && real <= TOPE){   // AAC de 128 o menos: se copia sin recodificar
        await conTimeout(ff.exec(['-i', nombreIn, '-vn', '-map', '0:a:0', '-map_metadata', '0', '-c:a', 'copy', 'out.m4a'], T_EXEC), T_EXEC + 1000, 'timeout');
        ext = 'm4a'; kbps = Math.round(real);
      } else {                                               // una sola pasada a mp3 estéreo 128 kbps
        await conTimeout(ff.exec(['-i', nombreIn, '-vn', '-map', '0:a:0', '-map_metadata', '0', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', KBPS + 'k', '-id3v2_version', '3', 'out.mp3'], T_EXEC), T_EXEC + 1000, 'timeout');
        ext = 'mp3'; kbps = KBPS; recomprimido = true;
      }
      if (cancelado) throw err('cancelado');
      const datos = await ff.readFile('out.' + ext);
      out = new File([datos], file.name.replace(/\.[^.]+$/, '') + '.' + ext, { type: ext === 'm4a' ? 'audio/mp4' : 'audio/mpeg' });
      try { await ff.deleteFile(nombreIn); await ff.deleteFile('out.' + ext); } catch (e) {}
    }
    if (out.size > MAX_MB * 1048576) throw err('grande');
    estado('Comprobando duplicados…');
    return { file: out, ext, dur: Math.round(dur) || null, kbps, hash: await hashHex(out), recomprimido };
  } catch (e) {
    if (cancelado && e.codigo !== 'cancelado') throw err('cancelado');
    throw e.codigo ? e : err('formato');
  } finally { liberaFF(); ocupado = false; }
}
export function cancelaAudio(){ cancelado = true; liberaFF(); }
