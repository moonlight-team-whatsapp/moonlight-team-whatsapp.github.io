// Avisos de anónimos para admins en cualquier página: contador de sin leer + animación al llegar uno nuevo.
// Solo actúa con sesión de admin (la tabla `anonimos` es solo-admin por RLS). Nunca muestra el contenido.
import { sb } from './supabase-sesion.js';
import { miPerfil } from './carnet.js';
if (!/anonimos\.html$/.test(location.pathname)) {
  const ADM = { furina: ['Furina', '#62aaff', '#7fe3ff'], neuvillette: ['Neuvillette', '#4fd9c8', '#6fe7a8'], kazuha: ['Kazuha', '#f0904a', '#f8cf8a'] };
  // Si el carnet de este dispositivo es de un admin (su personaje es Furina/Neuvillette/Kazuha), avisa solo de los suyos.
  let porCarnet = null;
  const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const carnetListo = miPerfil().then(p => { const k = p ? Object.keys(ADM).filter(x => (p.nombres || []).some(n => norm(n) === norm(ADM[x][0]))) : []; porCarnet = k.length ? k : null; }).catch(() => {});
  const misClaves = () => { if (porCarnet) return porCarnet; return claveLocal(); };
  const claveLocal = () => { try { const g = JSON.parse(localStorage.getItem('anon-aviso') || 'null'); if (Array.isArray(g)) return g.filter(k => ADM[k]); } catch (e) {} return Object.keys(ADM); };
  const leido = (m, k) => 'leido_por' in m ? (m.leido_por || []).includes(k) : !!m.leido;
  let chan = null;

  const css = document.createElement('style');
  css.textContent = `
  #anPill{position:fixed;right:14px;bottom:14px;z-index:9000;display:none;align-items:center;gap:8px;padding:9px 15px;border-radius:999px;background:rgba(20,24,52,.92);border:1px solid rgba(217,195,131,.55);color:#f1e0a8;font:600 .95rem 'Crimson Pro',serif;text-decoration:none;box-shadow:0 6px 24px rgba(0,0,0,.45)}
  #anPill.on{display:inline-flex}#anPill b{background:#f1e0a8;color:#1a2150;border-radius:999px;padding:0 8px;font-size:.85rem}
  #anFx{position:fixed;inset:0;z-index:9500;display:grid;place-items:center;background:radial-gradient(circle at 50% 45%,color-mix(in srgb,var(--c) 38%,transparent),rgba(5,7,20,.82) 70%);opacity:0;animation:anIn .5s forwards;cursor:pointer;overflow:hidden}
  #anFx.out{animation:anOut .6s forwards}
  #anFx .env{font-size:min(30vw,150px);filter:drop-shadow(0 0 28px var(--c));animation:anDrop 1.1s cubic-bezier(.2,1.4,.4,1) both,anFloat 2.4s 1.1s ease-in-out infinite}
  #anFx .tx{margin-top:6px;text-align:center;color:#fff;font:italic 600 clamp(1.3rem,5vw,2rem) 'Cormorant',serif;text-shadow:0 0 18px var(--c)}
  #anFx .tx small{display:block;font:500 .95rem 'Crimson Pro',serif;opacity:.75;margin-top:4px}
  #anFx .sp{position:absolute;width:6px;height:6px;border-radius:50%;background:var(--c2);box-shadow:0 0 10px var(--c);animation:anSp var(--d) ease-out forwards;opacity:0}
  #anFx .ring{position:absolute;width:40px;height:40px;border-radius:50%;border:2px solid var(--c);animation:anRing 1.8s ease-out infinite}
  @keyframes anIn{to{opacity:1}}@keyframes anOut{to{opacity:0}}
  @keyframes anDrop{from{transform:translateY(-90vh) rotate(-25deg) scale(.4)}to{transform:none}}
  @keyframes anFloat{50%{transform:translateY(-12px) rotate(3deg)}}
  @keyframes anSp{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:translate(var(--x),var(--y)) scale(.3)}}
  @keyframes anRing{from{transform:scale(1);opacity:.9}to{transform:scale(18);opacity:0}}
  @media (prefers-reduced-motion:reduce){#anFx .env,#anFx .ring,#anFx .sp{animation:none!important;opacity:1}}`;
  document.head.appendChild(css);
  const pill = document.createElement('a'); pill.id = 'anPill'; pill.href = 'anonimos.html'; document.body.appendChild(pill);

  async function contar(){
    const mias = misClaves();
    const { data, error } = await sb.from('anonimos').select('para,leido,leido_por');
    if (error || !data) { pill.classList.remove('on'); return; }
    const n = data.filter(m => (m.para || []).some(k => mias.includes(k) && !leido(m, k))).length;
    pill.innerHTML = '🌙 Anónimos <b>' + n + '</b>'; pill.classList.toggle('on', n > 0);
  }
  function anima(para){
    const k = para.find(x => ADM[x]) || 'furina', [, c, c2] = ADM[k];
    const quien = para.filter(x => ADM[x]).map(x => ADM[x][0]).join(', ');
    document.getElementById('anFx')?.remove();
    const d = document.createElement('div'); d.id = 'anFx'; d.style.setProperty('--c', c); d.style.setProperty('--c2', c2);
    let h = '<span class="ring"></span><span class="ring" style="animation-delay:.6s"></span>';
    for (let i = 0; i < 26; i++) { const a = Math.random() * 6.28, r = 90 + Math.random() * 190; h += `<i class="sp" style="--x:${Math.cos(a) * r}px;--y:${Math.sin(a) * r}px;--d:${1.2 + Math.random()}s;animation-delay:${0.8 + Math.random() * .4}s"></i>`; }
    d.innerHTML = h + `<div><div class="env" style="text-align:center">💌</div><div class="tx">Ha llegado un anónimo<small>Para: ${quien}</small></div></div>`;
    const cerrar = () => { d.classList.add('out'); setTimeout(() => d.remove(), 600); };
    d.addEventListener('click', () => { cerrar(); location.href = 'anonimos.html'; });
    document.body.appendChild(d); setTimeout(cerrar, 4500);
  }
  function sesion(user){
    if (user && !chan) {
      carnetListo.then(contar);
      chan = sb.channel('anon-alertas').on('postgres_changes', { event: '*', schema: 'public', table: 'anonimos' }, (p) => {
        if (p.eventType === 'INSERT' && (p.new.para || []).some(k => claveLocal().includes(k))) anima(p.new.para);
        contar();
      }).subscribe();
    } else if (!user && chan) { sb.removeChannel(chan); chan = null; pill.classList.remove('on'); }
  }
  sb.auth.onAuthStateChange((ev, ses) => { setTimeout(() => sesion(ses && ses.user), 0); });
}
