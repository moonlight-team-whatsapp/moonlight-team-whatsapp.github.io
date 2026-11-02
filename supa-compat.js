// Capa de compatibilidad: las páginas siguen usando la misma API que Firestore/Firebase Auth,
// pero los datos viven en Supabase (una tabla por colección: id text + data jsonb) y el login es el de Supabase.
import { sb } from "./supabase-sesion.js";

// ---------- Timestamps ----------
const TSKEYS = ['createdAt', 'updatedAt', 'importadoEn'];   // campos que antes eran Timestamp de Firestore
export class Timestamp {
  constructor(ms){ this._ms = ms; }
  toMillis(){ return this._ms; }
  toDate(){ return new Date(this._ms); }
  get seconds(){ return Math.floor(this._ms / 1000); }
  valueOf(){ return this._ms; }
  toJSON(){ return new Date(this._ms).toISOString(); }
  static now(){ return new Timestamp(Date.now()); }
  static fromDate(d){ return new Timestamp(d.getTime()); }
  static fromMillis(ms){ return new Timestamp(ms); }
}

// ---------- Valores especiales ----------
class Op { constructor(kind, arg){ this.kind = kind; this.arg = arg; } }
export const serverTimestamp = () => new Op('ts');
export const arrayUnion = (...a) => new Op('union', a);
export const arrayRemove = (...a) => new Op('remove', a);
export const increment = (n) => new Op('inc', n);
export const deleteField = () => new Op('del');

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const toRow = (v) => {            // valor de la app -> JSON guardable
  if (v instanceof Timestamp) return v.toJSON();
  if (v instanceof Date) return v.toISOString();
  if (v instanceof Op) return v.kind === 'ts' ? new Date().toISOString() : undefined;
  if (Array.isArray(v)) return v.map(toRow);
  if (v && typeof v === 'object'){ const o = {}; for (const k in v){ const x = toRow(v[k]); if (x !== undefined) o[k] = x; } return o; }
  return v;
};
const fromRow = (d) => {          // JSON guardado -> datos para la app
  const o = { ...(d || {}) };
  for (const k of TSKEYS) if (typeof o[k] === 'string' && !isNaN(Date.parse(o[k]))) o[k] = new Timestamp(Date.parse(o[k]));
  return o;
};
const setPath = (obj, path, val) => {
  const ks = path.split('.'); let o = obj;
  ks.slice(0, -1).forEach(k => { if (!o[k] || typeof o[k] !== 'object') o[k] = {}; o = o[k]; });
  if (val === undefined) delete o[ks[ks.length - 1]]; else o[ks[ks.length - 1]] = val;
};
const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const applyUpdate = (existing, upd) => {   // aplica un updateDoc (con arrayUnion, increment...) sobre los datos actuales
  const out = JSON.parse(JSON.stringify(existing || {}));
  for (const k in upd){
    const v = upd[k], cur = getPath(out, k);
    if (v instanceof Op){
      if (v.kind === 'union'){ const arr = Array.isArray(cur) ? [...cur] : []; v.arg.map(toRow).forEach(x => { if (!arr.some(y => same(y, x))) arr.push(x); }); setPath(out, k, arr); }
      else if (v.kind === 'remove'){ const rm = v.arg.map(toRow); setPath(out, k, (Array.isArray(cur) ? cur : []).filter(y => !rm.some(x => same(x, y)))); }
      else if (v.kind === 'inc') setPath(out, k, (typeof cur === 'number' ? cur : 0) + v.arg);
      else if (v.kind === 'ts') setPath(out, k, new Date().toISOString());
      else if (v.kind === 'del') setPath(out, k, undefined);
    } else setPath(out, k, toRow(v));
  }
  return out;
};
const deepMerge = (a, b) => {
  const out = { ...a };
  for (const k in b){ out[k] = (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) ? deepMerge(a[k], b[k]) : b[k]; }
  return out;
};

// ---------- Referencias y consultas ----------
export const initializeApp = () => ({});
export const getFirestore = () => ({});
export const collection = (db, name) => ({ __col: true, name });
const rid = () => Array.from({ length: 20 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('');
export const doc = (a, b, c) => {
  if (a && a.__col) return { __doc: true, col: a.name, id: b || rid() };
  return { __doc: true, col: b, id: c };
};
export const orderBy = (field, dir = 'asc') => ({ t: 'order', field, dir });
export const where = (field, op, value) => ({ t: 'where', field, op, value });
export const limit = (n) => ({ t: 'limit', n });
export const query = (col, ...cons) => ({ __q: true, name: col.name, cons });

class DocSnap {
  constructor(col, id, data){ this.id = id; this._d = data; this.ref = { __doc: true, col, id }; }
  exists(){ return this._d !== null && this._d !== undefined; }
  data(){ return this._d == null ? undefined : fromRow(this._d); }
  get(f){ return getPath(this.data() || {}, f); }
}
class QuerySnap {
  constructor(docs){ this.docs = docs; this.size = docs.length; this.empty = docs.length === 0; }
  forEach(fn){ this.docs.forEach(fn); }
  docChanges(){ return this.docs.map(d => ({ type: 'added', doc: d })); }
}

// ---------- Lectura ----------
async function fetchAll(table){
  const out = []; const STEP = 1000;
  for (let from = 0; ; from += STEP){
    const { data, error } = await sb.from(table).select('id,data').range(from, from + STEP - 1);
    if (error) throw error;
    out.push(...data);
    if (data.length < STEP) break;
  }
  return out;
}
const cmpVal = (x, y) => {
  if (x instanceof Timestamp || typeof x === 'string' && !isNaN(Date.parse(x)) && /^\d{4}-\d\d-\d\dT/.test(x)) { x = +new Date(x); y = +new Date(y); }
  return x < y ? -1 : x > y ? 1 : 0;
};
function runQuery(table, rows, cons){
  let list = rows.map(r => ({ id: r.id, data: r.data || {} }));
  for (const c of cons.filter(c => c.t === 'where')){
    list = list.filter(r => {
      const v = getPath(r.data, c.field);
      switch (c.op){
        case '==': return same(v, c.value);
        case '!=': return !same(v, c.value);
        case 'array-contains': return Array.isArray(v) && v.some(x => same(x, c.value));
        case 'in': return c.value.some(x => same(x, v));
        case '>': return v > c.value; case '>=': return v >= c.value;
        case '<': return v < c.value; case '<=': return v <= c.value;
        default: return true;
      }
    });
  }
  const ord = cons.filter(c => c.t === 'order');
  if (ord.length){
    list = list.filter(r => ord.every(o => { const v = getPath(r.data, o.field); return v !== undefined && v !== null; }));   // como Firestore: sin el campo no entra
    list.sort((a, b) => { for (const o of ord){ const r = cmpVal(getPath(a.data, o.field), getPath(b.data, o.field)); if (r) return o.dir === 'desc' ? -r : r; } return a.id < b.id ? -1 : 1; });
  } else list.sort((a, b) => a.id < b.id ? -1 : 1);
  const lim = cons.find(c => c.t === 'limit'); if (lim) list = list.slice(0, lim.n);
  return list;
}
export async function getDocs(q){
  const name = q.name, cons = q.cons || [];
  return new QuerySnap(runQuery(name, await fetchAll(name), cons).map(r => new DocSnap(name, r.id, r.data)));
}
export async function getDoc(ref){
  const { data, error } = await sb.from(ref.col).select('id,data').eq('id', ref.id).maybeSingle();
  if (error) throw error;
  return new DocSnap(ref.col, ref.id, data ? (data.data || {}) : null);
}

// ---------- Escritura ----------
const subs = new Map();      // tabla -> oyentes {run}; tras una escritura propia se refrescan ANTES de que la escritura "termine",
                             // como en Firestore (así el código que escribe y vuelve a mirar sus datos no se queda con datos viejos)
const notify = (table) => Promise.all([...(subs.get(table) || [])].map(s => s.run()));
async function readRow(ref){
  const { data, error } = await sb.from(ref.col).select('data').eq('id', ref.id).maybeSingle();
  if (error) throw error;
  return data ? (data.data || {}) : null;
}
async function writeRow(ref, data){
  const { error } = await sb.from(ref.col).upsert({ id: ref.id, data }, { onConflict: 'id' });
  if (error) throw error;
}
export async function setDoc(ref, data, opts){
  const fresh = applyUpdate({}, data);
  if (opts && opts.merge){ const cur = await readRow(ref); await writeRow(ref, cur ? deepMerge(cur, fresh) : fresh); }
  else await writeRow(ref, fresh);
  await notify(ref.col);
}
export async function updateDoc(ref, upd){
  const cur = await readRow(ref);
  if (cur === null){ const e = new Error('No document to update: ' + ref.col + '/' + ref.id); e.code = 'not-found'; throw e; }
  await writeRow(ref, applyUpdate(cur, upd));
  await notify(ref.col);
}
export async function addDoc(colRef, data){
  const ref = { __doc: true, col: colRef.name, id: rid() };
  await writeRow(ref, applyUpdate({}, data));
  await notify(ref.col);
  return ref;
}
export async function deleteDoc(ref){
  const { error } = await sb.from(ref.col).delete().eq('id', ref.id);
  if (error) throw error;
  await notify(ref.col);
}
export function writeBatch(){
  const ops = [], tables = new Set();
  const b = {
    set(ref, data, opts){ tables.add(ref.col); ops.push(async () => { const fresh = applyUpdate({}, data); if (opts && opts.merge){ const cur = await readRow(ref); await writeRow(ref, cur ? deepMerge(cur, fresh) : fresh); } else await writeRow(ref, fresh); }); return b; },
    update(ref, upd){ tables.add(ref.col); ops.push(async () => { const cur = await readRow(ref); if (cur === null){ const e = new Error('No document to update: ' + ref.col + '/' + ref.id); e.code = 'not-found'; throw e; } await writeRow(ref, applyUpdate(cur, upd)); }); return b; },
    delete(ref){ tables.add(ref.col); ops.push(async () => { const { error } = await sb.from(ref.col).delete().eq('id', ref.id); if (error) throw error; }); return b; },
    async commit(){ try { for (const f of ops) await f(); } finally { await Promise.all([...tables].map(notify)); } }
  };
  return b;
}

// ---------- Tiempo real ----------
export function onSnapshot(target, next, error){
  const isDoc = !!target.__doc, table = isDoc ? target.col : target.name;
  let alive = true, timer = null, chain = Promise.resolve();
  const doRun = async () => {
    try { const snap = isDoc ? await getDoc(target) : await getDocs(target); if (alive) next(snap); }
    catch (e) { if (alive && error) error(e); }
  };
  const run = () => (chain = chain.then(doRun));   // lecturas en orden: quien espera a run() ya tiene los datos nuevos entregados
  const again = () => { clearTimeout(timer); timer = setTimeout(run, 40); };
  const sub = { run };
  if (!subs.has(table)) subs.set(table, new Set());
  subs.get(table).add(sub);
  run();
  const ch = sb.channel('rt-' + table + '-' + rid()).on('postgres_changes', { event: '*', schema: 'public', table }, again).subscribe();
  return () => { alive = false; clearTimeout(timer); subs.get(table).delete(sub); sb.removeChannel(ch); };
}

// ---------- Sesión (Firebase Auth -> Supabase Auth) ----------
export const getAuth = () => ({});
export async function signInWithEmailAndPassword(auth, email, password){
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error){ const e = new Error(error.message); e.code = 'auth/invalid-credential'; throw e; }
  return { user: data.user };
}
export async function signOut(){ await sb.auth.signOut(); }
export function onAuthStateChanged(auth, cb){
  sb.auth.getSession().then(({ data }) => cb(data.session ? data.session.user : null));
  const { data } = sb.auth.onAuthStateChange((ev, ses) => { if (ev === 'INITIAL_SESSION') return; setTimeout(() => cb(ses ? ses.user : null), 0); });
  return () => data.subscription.unsubscribe();
}
