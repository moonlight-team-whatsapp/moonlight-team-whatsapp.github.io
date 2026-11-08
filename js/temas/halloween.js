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
  var BAT = '<svg viewBox="0 0 64 32" width="1em" height="0.5em" style="width:2.2em;height:1.1em"><path fill="#2c2145" stroke="#9a84d4" stroke-width="1.2" stroke-linejoin="round" d="M32 8 L35 2 L36 9 Q40 8 44 10 Q52 4 62 8 Q58 12 58 18 Q54 15 51 19 Q48 15 44 20 Q40 14 36 18 L34 26 L32 20 L30 26 L28 18 Q24 14 20 20 Q16 15 13 19 Q10 15 6 18 Q6 12 2 8 Q12 4 20 10 Q24 8 28 9 L29 2 Z"/><circle cx="30" cy="11" r="1" fill="#ffb36b"/><circle cx="34" cy="11" r="1" fill="#ffb36b"/></svg>';
  function murcielagos(){
    var n = innerWidth < 600 ? 3 : 6;
    for (var i = 0; i < n; i++){
      var b = document.createElement('span'); b.className = 'murci'; b.innerHTML = BAT; b.setAttribute('aria-hidden', 'true');
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
