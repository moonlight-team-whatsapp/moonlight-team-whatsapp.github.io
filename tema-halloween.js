// Tema de Halloween. Lo carga temporadas.js cuando la temporada está activa.
(function(){
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function web(lado){
    var s = document.createElement('div'); s.className = 'tela ' + lado; s.setAttribute('aria-hidden', 'true');
    var p = ''; for (var i = 1; i <= 5; i++) p += '<path d="M0 0 L' + (i * 24) + ' 0 M0 0 L0 ' + (i * 24) + ' M' + (i * 24) + ' 0 Q' + (i * 9) + ' ' + (i * 9) + ' 0 ' + (i * 24) + '" />';
    p += '<path d="M0 0 L120 120 M0 0 L84 130 M0 0 L130 84"/>';
    s.innerHTML = '<svg viewBox="0 0 130 130" width="130" height="130" fill="none" stroke="rgba(235,235,245,.55)" stroke-width="1">' + p + '</svg><span class="ara">🕷️</span>';
    document.body.appendChild(s);
  }
  function murcielagos(){
    var n = innerWidth < 600 ? 3 : 6;
    for (var i = 0; i < n; i++){
      var b = document.createElement('span'); b.className = 'murci'; b.textContent = '🦇'; b.setAttribute('aria-hidden', 'true');
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
