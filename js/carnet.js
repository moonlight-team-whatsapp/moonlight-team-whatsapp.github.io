// Carnet de miembro: el enlace lleva un token secreto (?c=...). Solo se guarda su huella SHA-256 en Supabase.
import { sb } from './supabase-sesion.js';
const KEY = 'mc_carnet';
export async function sha256(t){
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
export function nuevoToken(){
  const a = new Uint8Array(24); crypto.getRandomValues(a);
  return [...a].map(x => x.toString(36).padStart(2, '0')).join('').slice(0, 32);
}
export function tokenActual(){
  try {
    const u = new URLSearchParams(location.search).get('c');
    if (u){ localStorage.setItem(KEY, u); history.replaceState(null, '', location.pathname + location.search.replace(/[?&]c=[^&]*/, '').replace(/^&/, '?')); return u; }
    return localStorage.getItem(KEY);
  } catch (e) { return null; }
}
export async function miMiembro(){
  const t = tokenActual(); if (!t) return null;
  const { data, error } = await sb.rpc('carnet_miembro', { token: t });
  return error || !data ? null : data;
}
export function olvidarCarnet(){ try { localStorage.removeItem(KEY); } catch (e) {} }
