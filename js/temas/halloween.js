// Tema de Halloween. Lo carga temporadas.js cuando la temporada está activa.
(function(){
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function web(lado){
    var s = document.createElement('div'); s.className = 'tela ' + lado; s.setAttribute('aria-hidden', 'true');
    // Telaraña de esquina: radios en abanico y anillos que se hunden entre radios
    var R = 124, ang = [0, 20, 40, 60, 80, 90], pt = function(r, a){ return [(r * Math.cos(a * Math.PI / 180)).toFixed(1), (r * Math.sin(a * Math.PI / 180)).toFixed(1)]; }, p = '';
    ang.forEach(function(a){ var q = pt(R, a); p += 'M0 0 L' + q[0] + ' ' + q[1] + ' '; });
    [22, 40, 58, 76, 96, 118].forEach(function(r){ for (var k = 0; k < ang.length - 1; k++){ var q1 = pt(r, ang[k]), q2 = pt(r, ang[k + 1]), m = pt(r * .86, (ang[k] + ang[k + 1]) / 2); p += (k ? 'L' : 'M') + q1[0] + ' ' + q1[1] + ' Q' + m[0] + ' ' + m[1] + ' ' + q2[0] + ' ' + q2[1] + ' '; } });
    s.innerHTML = '<svg viewBox="-2 -2 130 130" width="130" height="130" fill="none" stroke="rgba(235,235,245,.6)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="' + p + '"/></svg><span class="ara"><i class="hilo"></i>🕷️</span>';
    document.body.appendChild(s);
  }
  function murcielagos(){
    var n = innerWidth < 600 ? 3 : 6;
    for (var i = 0; i < n; i++){
      var b = document.createElement('span'); b.className = 'murci'; b.innerHTML = '<span class="mv">🦇</span>'; b.setAttribute('aria-hidden', 'true');
      b.style.cssText = 'top:' + (6 + Math.random() * 40).toFixed(0) + 'vh;font-size:' + (16 + Math.random() * 18).toFixed(0) + 'px;animation-duration:' + (14 + Math.random() * 16).toFixed(1) + 's,' + (.5 + Math.random() * .5).toFixed(2) + 's;animation-delay:-' + (Math.random() * 24).toFixed(1) + 's,0s';
      document.body.appendChild(b);
    }
  }
  function calabazas(){
    var c = document.createElement('div'); c.className = 'calabazas'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = '<span>🎃</span><span>🎃</span>'; document.body.appendChild(c);
  }
  function todo(){ web('izq'); web('der'); calabazas(); if (!rm) murcielagos(); }
  if (document.body) todo(); else document.addEventListener('DOMContentLoaded', todo);
})();
