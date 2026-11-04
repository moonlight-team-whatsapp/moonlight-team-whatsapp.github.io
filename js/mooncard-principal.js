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
