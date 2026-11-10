// MoonCard principal de cada personaje (la que el admin marca en la galería)
import { sb } from './supabase-sesion.js';
export const clave = n => String(n || '').trim().replace(/\s+/g, ' ').toLowerCase();
export async function cargarPrincipales(){
  try {
    const { data } = await sb.from('mooncards').select('id,personaje,personaje_key,titulo,img_path').eq('principal', true).eq('aprobada', true);
    const m = new Map();
    (data || []).forEach(r => m.set(r.personaje_key, { ...r, url: sb.storage.from('mooncards').getPublicUrl(r.img_path).data.publicUrl }));
    return m;
  } catch (e) { return new Map(); }
}
// Recorte redondo de la foto del personaje (la foto va en un círculo de 320px en una tarjeta de 1000x620)
export const avatarCss = (url, px) => { const k = px / 320; return `width:${px}px;height:${px}px;background:url('${url}') no-repeat;background-size:${(1000 * k).toFixed(1)}px auto;background-position:${(-70 * k).toFixed(1)}px ${(-150 * k).toFixed(1)}px;`; };

// Para exportar a imagen (canvas): carga la foto y dibuja el recorte redondo del personaje
export function cargaImagen(url){
  return new Promise(res => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => res(null); im.src = url; });
}
export function dibujaAvatar(c, im, cx, cy, d){
  if (!im) return;
  const s = im.naturalWidth / 1000;
  c.save(); c.beginPath(); c.arc(cx, cy, d / 2, 0, Math.PI * 2); c.clip();
  c.drawImage(im, 70 * s, 150 * s, 320 * s, 320 * s, cx - d / 2, cy - d / 2, d, d);
  c.restore();
  c.beginPath(); c.arc(cx, cy, d / 2, 0, Math.PI * 2); c.strokeStyle = 'rgba(217,195,131,.8)'; c.lineWidth = 1.4; c.stroke();
}
