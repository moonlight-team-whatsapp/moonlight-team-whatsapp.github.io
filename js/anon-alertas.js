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
  #anFx{position:fixed;inset:0;z-index:9500;overflow:hidden;opacity:0;animation:anIn .6s forwards;cursor:pointer;background:radial-gradient(ellipse at 50% 20%,#1a2150 0%,#080b1f 70%)}
  #anFx.out{animation:anOut .7s forwards}
  #anFx .st{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;animation:anTw 2.2s ease-in-out infinite alternate}
  #anFx .suelo{position:absolute;left:-30%;right:-30%;bottom:-62vh;height:90vh;border-radius:50%;background:radial-gradient(ellipse at 50% 0%,#e9e2cb 0%,#b9b49f 45%,#7d7a72 100%);box-shadow:0 -10px 60px rgba(241,224,168,.35)}
  #anFx .cr{position:absolute;border-radius:50%;background:radial-gradient(ellipse at 40% 35%,#8c887a,#a8a391);box-shadow:inset 3px 4px 8px rgba(0,0,0,.25)}
  #anFx .carta{position:absolute;left:50%;bottom:23vh;width:min(46vw,200px);margin-left:calc(min(46vw,200px) / -2);filter:drop-shadow(0 0 22px var(--c));animation:anVuela 2.4s cubic-bezier(.25,.8,.3,1) forwards;transform-origin:50% 100%}
  #anFx .carta svg{display:block;width:100%;height:auto}
  #anFx .polvo{position:absolute;left:50%;bottom:21vh;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:rgba(241,224,168,.6);animation:anPolvo 1.3s 2.2s ease-out both}
  #anFx .tx{position:absolute;left:0;right:0;top:14vh;text-align:center;color:#fff;font:italic 600 clamp(1.4rem,5vw,2.1rem) 'Cormorant',serif;text-shadow:0 0 18px var(--c);opacity:0;animation:anIn .8s 2.3s forwards}
  #anFx .tx small{display:block;font:500 1rem 'Crimson Pro',serif;opacity:.8;margin-top:4px;color:var(--c2)}
  @keyframes anIn{to{opacity:1}}@keyframes anOut{to{opacity:0}}
  @keyframes anTw{from{opacity:.25}to{opacity:1}}
  @keyframes anVuela{0%{transform:translate(32vw,-62vh) scale(.04) rotate(-35deg);opacity:0}12%{opacity:1}70%{transform:translate(-6vw,-6vh) scale(1.05) rotate(7deg)}100%{transform:translate(0,0) scale(1) rotate(-3deg)}}
  @keyframes anPolvo{0%{transform:scale(1);opacity:.9;box-shadow:0 0 0 0 rgba(241,224,168,.5)}100%{transform:scale(18,5);opacity:0}}
  @media (prefers-reduced-motion:reduce){#anFx .carta,#anFx .polvo,#anFx .tx{animation:none!important;opacity:1}}`;
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
    let h = '';
    for (let i = 0; i < 60; i++) h += `<i class="st" style="top:${Math.random() * 70}%;left:${Math.random() * 100}%;animation-delay:${Math.random() * 2}s;transform:scale(${0.6 + Math.random()})"></i>`;
    h += '<div class="suelo"></div>';
    [[18, 78, 60], [70, 84, 90], [44, 90, 40], [86, 76, 46], [8, 88, 70]].forEach(([x, y, w]) => { h += `<i class="cr" style="left:${x}%;top:${y}%;width:${w}px;height:${w * .45}px"></i>`; });
    const sobre = `<svg viewBox="0 0 200 140"><rect x="4" y="10" width="192" height="126" rx="10" fill="#f4ecd2" stroke="#d9c383" stroke-width="3"/><path d="M6 14 L100 82 L194 14" fill="none" stroke="#d9c383" stroke-width="3"/><path d="M6 134 L78 70 M194 134 L122 70" stroke="#e3d6aa" stroke-width="2.5"/><circle cx="100" cy="84" r="17" fill="${c}" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><path d="M93 84 a9 9 0 1 0 12 -8 a7 7 0 0 1 -12 8z" fill="#fff" fill-opacity=".85"/></svg>`;
    d.innerHTML = h + `<div class="carta">${sobre}</div><span class="polvo"></span><div class="tx">Ha llegado un anónimo<small>Para: ${quien}</small></div>`;
    const cerrar = () => { d.classList.add('out'); setTimeout(() => d.remove(), 600); };
    d.addEventListener('click', () => { cerrar(); location.href = 'anonimos.html'; });
    document.body.appendChild(d); setTimeout(cerrar, 6000);
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
