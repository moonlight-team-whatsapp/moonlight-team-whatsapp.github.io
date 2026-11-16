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
  #anPill{position:fixed;left:50%;bottom:20px;transform:translate(-50%,20px);background:#141b37;border:1px solid rgba(217,195,131,.5);color:#ece7d8;padding:9px 16px;border-radius:8px;opacity:0;transition:all .3s;z-index:9000;pointer-events:none;max-width:90vw;text-align:center;text-decoration:none;font:1rem 'Crimson Pro',serif}
  #anPill.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}
  #anFx{position:fixed;inset:0;z-index:9500;overflow:hidden;opacity:0;animation:anIn .6s forwards;cursor:pointer;background:radial-gradient(ellipse at 50% 20%,#1a2150 0%,#080b1f 70%)}
  #anFx.out{animation:anOut .7s forwards}
  #anFx .st{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;animation:anTw 2.2s ease-in-out infinite alternate}
  #anFx .suelo{position:absolute;left:-40%;right:-40%;bottom:-70vh;height:100vh;border-radius:50%;overflow:hidden;box-shadow:0 -2px 3px rgba(255,250,235,.9),0 -14px 70px rgba(230,225,200,.35)}
  #anFx .suelo svg{position:absolute;inset:0;width:100%;height:100%}
  #anFx .carta{position:absolute;left:50%;bottom:25vh;width:min(46vw,200px);margin-left:calc(min(46vw,200px) / -2);filter:drop-shadow(0 0 22px var(--c));animation:anVuela 2.4s cubic-bezier(.25,.8,.3,1) forwards;transform-origin:50% 100%}
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
    pill.textContent = '🌙 Tienes ' + n + (n === 1 ? ' anónimo sin leer' : ' anónimos sin leer');
    clearTimeout(contar.t); pill.classList.toggle('on', n > 0 && n !== contar.n); contar.n = n; contar.t = setTimeout(() => pill.classList.remove('on'), 4500);
  }
  function anima(para){
    const k = para.find(x => ADM[x]) || 'furina', [, c, c2] = ADM[k];
    const quien = para.filter(x => ADM[x]).map(x => ADM[x][0]).join(', ');
    document.getElementById('anFx')?.remove();
    const d = document.createElement('div'); d.id = 'anFx'; d.style.setProperty('--c', c); d.style.setProperty('--c2', c2);
    let h = '';
    for (let i = 0; i < 60; i++) h += `<i class="st" style="top:${Math.random() * 70}%;left:${Math.random() * 100}%;animation-delay:${Math.random() * 2}s;transform:scale(${0.6 + Math.random()})"></i>`;
    const cr = [[.30,.24,.07],[.62,.30,.10],[.80,.16,.045],[.18,.50,.12],[.48,.58,.06],[.72,.62,.14],[.90,.45,.07],[.40,.80,.10],[.10,.78,.05]].map(([x, y, r], i) => `<g transform="translate(${x * 1000} ${y * 1000}) scale(1 .42)"><circle r="${r * 1000}" fill="url(#cf)" /><circle r="${r * 1000}" fill="none" stroke="#f3eedd" stroke-opacity=".55" stroke-width="${r * 40}" stroke-dasharray="${r * 900} ${r * 700}" transform="rotate(200)"/><circle r="${r * 1000}" fill="none" stroke="#3b3a36" stroke-opacity=".35" stroke-width="${r * 30}"/></g>`).join('');
    const roc = Array.from({ length: 28 }, () => { const x = Math.random() * 1000, y = 40 + Math.random() * 900, w = 4 + Math.random() * 14; return `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * .5}" fill="#6f6c64"/><ellipse cx="${x - w * .2}" cy="${y - w * .2}" rx="${w * .7}" ry="${w * .3}" fill="#d8d3c2" opacity=".7"/>`; }).join('');
    h += `<div class="suelo"><svg viewBox="0 0 1000 1000" preserveAspectRatio="none"><defs>
      <filter id="rg" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="4" seed="7"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .1  0 0 0 0 .09  0 0 0 .55 -.05"/></filter>
      <filter id="mr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".004 .01" numOctaves="3" seed="3"/><feColorMatrix values="0 0 0 0 .25  0 0 0 0 .24  0 0 0 0 .22  0 0 0 1.6 -.55"/></filter>
      <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9d4c2"/><stop offset=".25" stop-color="#a9a595"/><stop offset="1" stop-color="#4a4843"/></linearGradient>
      <radialGradient id="cf" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#8d8a7c"/><stop offset=".7" stop-color="#6a675d"/><stop offset="1" stop-color="#4f4d46"/></radialGradient></defs>
      <rect width="1000" height="1000" fill="url(#gb)"/><rect width="1000" height="1000" filter="url(#mr)" opacity=".7"/>${cr}${roc}<rect width="1000" height="1000" filter="url(#rg)" opacity=".8"/></svg></div>`;
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
