// Decoración de Navidad: del 1 de noviembre al 6 de enero (o con ?navidad=1 para verla fuera de fechas)
(function(){
  var d = new Date(), m = d.getMonth(), day = d.getDate();
  var on = m >= 10 || (m === 0 && day <= 6) || /[?&]navidad=1\b/.test(location.search);
  if (/[?&]navidad=0\b/.test(location.search)) on = false;
  if (!on) return;
  document.documentElement.classList.add('navidad');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function nieve(){
    var box = document.createElement('div'); box.className = 'nieve'; box.setAttribute('aria-hidden', 'true');
    var n = innerWidth < 600 ? 18 : 34, fr = document.createDocumentFragment();
    for (var i = 0; i < n; i++){
      var s = document.createElement('span'), z = (Math.random() * 3 + 2).toFixed(1);
      s.style.cssText = 'left:' + (Math.random() * 100).toFixed(1) + '%;width:' + z + 'px;height:' + z + 'px;animation-duration:' + (Math.random() * 9 + 9).toFixed(1) + 's,' + (Math.random() * 3 + 3).toFixed(1) + 's;animation-delay:-' + (Math.random() * 18).toFixed(1) + 's,-' + (Math.random() * 5).toFixed(1) + 's;opacity:' + (Math.random() * .5 + .35).toFixed(2);
      fr.appendChild(s);
    }
    box.appendChild(fr); document.body.appendChild(box);
  }
  if (document.body) nieve(); else document.addEventListener('DOMContentLoaded', nieve);
})();

// ---------- Más Navidad: guirnalda, gorro de Papá Noel y trineo volando ----------
(function(){
  if (!document.documentElement.classList.contains('navidad')) return;
  var NS = 'http://www.w3.org/2000/svg', COL = ['#ff4d4d', '#ffd24d', '#4dff88', '#4db8ff', '#ff7ad9'];
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function guirnalda(){
    var old = document.getElementById('luces'); if (old) old.remove();
    var w = innerWidth, seg = innerWidth < 600 ? 110 : 170, sag = 15, svg = document.createElementNS(NS, 'svg');
    svg.id = 'luces'; svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('width', w); svg.setAttribute('height', 44); svg.setAttribute('viewBox', '0 0 ' + w + ' 44');
    var d = 'M-10 3', k = 0, n = Math.ceil((w + 20) / seg), bulbs = '';
    for (var i = 0; i < n; i++){
      var x0 = -10 + i * seg, x1 = x0 + seg, cx = (x0 + x1) / 2;
      d += ' Q' + cx + ' ' + (3 + sag * 2) + ' ' + x1 + ' 3';
      for (var j = 1; j <= 3; j++){
        var t = j / 4, x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1, y = (1 - t) * (1 - t) * 3 + 2 * (1 - t) * t * (3 + sag * 2) + t * t * 3, c = COL[k++ % COL.length];
        bulbs += '<g class="bl" style="animation-delay:-' + ((k * .37) % 3).toFixed(2) + 's"><rect x="' + (x - 2) + '" y="' + (y - 1) + '" width="4" height="5" fill="#2a2a2a"/><ellipse cx="' + x.toFixed(1) + '" cy="' + (y + 9).toFixed(1) + '" rx="4.2" ry="6" fill="' + c + '" style="filter:drop-shadow(0 0 5px ' + c + ')"/></g>';
      }
    }
    svg.innerHTML = '<path d="' + d + '" fill="none" stroke="#1c2a22" stroke-width="2"/>' + bulbs;
    document.body.appendChild(svg);
  }
  function gorro(){
    var h = document.querySelector('.title-wrap') || document.querySelector('h1'); if (!h || h.querySelector('.gorro')) return;
    h.classList.add('con-gorro');
    var s = document.createElement('span'); s.className = 'gorro'; s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<svg viewBox="0 0 64 56" width="100%" height="100%"><path d="M8 46 C10 20 26 6 50 8 C44 14 44 26 52 34 L56 46 Z" fill="#e0262f"/><path d="M6 44 Q32 54 58 44 L58 54 Q32 62 6 54 Z" fill="#fff"/><circle cx="52" cy="10" r="7" fill="#fff"/></svg>';
    h.appendChild(s);
  }
  function trineo(){
    if (rm || !document.body.classList.contains('page-index')) return;
    var t = document.createElement('img'); t.src = 'trineo-vuelo.png'; t.alt = ''; t.className = 'trineo-vuelo'; t.setAttribute('aria-hidden', 'true'); document.body.appendChild(t);
  }
  function todo(){ guirnalda(); gorro(); trineo(); var tm; addEventListener('resize', function(){ clearTimeout(tm); tm = setTimeout(guirnalda, 200); }); }
  if (document.body) todo(); else document.addEventListener('DOMContentLoaded', todo);
})();
