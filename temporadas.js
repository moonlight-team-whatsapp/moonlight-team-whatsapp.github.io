// Cargador de temporadas (Navidad, Halloween…). Las fechas y el modo (auto / siempre / apagado) se gestionan en temporadas.html.
(function(){
  var SB = 'https://stedlptzaukqewtkzotg.supabase.co', KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0ZWRscHR6YXVrcWV3dGt6b3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MzY3NzQsImV4cCI6MjEwODMxMjc3NH0.XArszBzP49sWHka1xIXJVTQQiC-QEHczafQ8G3mF7qc';
  var TEMAS = {
    navidad:   { n: 'Navidad',   ico: '❄️', d: '11-01', h: '01-06' },
    halloween: { n: 'Halloween', ico: '🎃', d: '10-15', h: '11-02' }
  };
  window.MoonTemas = { TEMAS: TEMAS, KEY: KEY, SB: SB };
  function md(d){ return ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function enRango(h, d, hh){ return d <= hh ? (h >= d && h <= hh) : (h >= d || h <= hh); }
  function activa(id, cfg){
    var c = cfg && cfg[id], T = TEMAS[id], modo = (c && c.modo) || 'auto';
    if (modo === 'on') return true; if (modo === 'off') return false;
    return enRango(md(new Date()), (c && c.desde) || T.d, (c && c.hasta) || T.h);
  }
  window.MoonTemas.activa = activa;
  var q = location.search, forzado = (q.match(/[?&]tema=([a-z0-9_-]+)/) || [])[1] || (/[?&]navidad=1\b/.test(q) ? 'navidad' : '');
  var cache = null; try { cache = JSON.parse(localStorage.getItem('mc_temporadas') || 'null'); } catch (e) {}
  function pedir(){
    return fetch(SB + '/rest/v1/temporadas?select=id,modo,desde,hasta', { headers: { apikey: KEY } }).then(function(r){ return r.json(); }).then(function(rows){
      if (!Array.isArray(rows)) return null; var o = {}; rows.forEach(function(r){ o[r.id] = r; });
      try { localStorage.setItem('mc_temporadas', JSON.stringify(o)); } catch (e) {} return o;
    }).catch(function(){ return null; });
  }
  function elegir(cfg){ if (forzado === 'off') return []; if (forzado && TEMAS[forzado]) return [forzado]; var r = []; for (var id in TEMAS) if (activa(id, cfg)) r.push(id); return r; }
  function arrancar(cfg){
    var ids = elegir(cfg); if (!ids.length) return;
    var off = false; try { off = localStorage.getItem('mc_deco') === 'off'; } catch (e) {}
    if (forzado) off = false;
    boton(ids, off);
    if (off) return;
    ids.forEach(function(id){ document.documentElement.classList.add(id); var s = document.createElement('script'); s.src = 'tema-' + id + '.js'; document.head.appendChild(s); });
  }
  function boton(ids, off){
    function crear(){
      var b = document.createElement('button'); b.type = 'button'; b.id = 'decoBtn'; b.className = 'deco-btn';
      b.setAttribute('aria-pressed', String(!off)); b.title = (off ? 'Activar' : 'Apagar') + ' la decoración de ' + ids.map(function(i){ return TEMAS[i].n; }).join(' y ');
      b.innerHTML = '<span aria-hidden="true">' + ids.map(function(i){ return TEMAS[i].ico; }).join('') + '</span> ' + (off ? 'Decoración: no' : 'Decoración: sí');
      b.onclick = function(){ try { localStorage.setItem('mc_deco', off ? 'on' : 'off'); } catch (e) {} location.reload(); };
      document.body.appendChild(b);
    }
    if (document.body) crear(); else document.addEventListener('DOMContentLoaded', crear);
  }
  if (cache){ arrancar(cache); pedir(); }
  else { var hecho = false, go = function(c){ if (hecho) return; hecho = true; arrancar(c); }; pedir().then(go); setTimeout(function(){ go(null); }, 900); }
})();
