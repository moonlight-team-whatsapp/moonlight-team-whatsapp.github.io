// Tema de Invierno. Lo carga temporadas.js cuando la temporada está activa.
(function(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var G = ['❄','❅','❆','❄'], N = innerWidth < 600 ? 9 : 16;
  function hacer(){
    var box = document.createElement('div'); box.className = 'fx fx-invierno'; box.setAttribute('aria-hidden', 'true'); var fr = document.createDocumentFragment();
    for (var i = 0; i < N; i++){
      var s = document.createElement('span'), r = Math.random; s.textContent = G[i % G.length]; s.style.cssText = 'left:' + (r() * 100).toFixed(1) + '%;font-size:' + (10 + r() * 14).toFixed(0) + 'px;animation-duration:' + (12 + r() * 10).toFixed(1) + 's,' + (3 + r() * 3).toFixed(1) + 's;animation-delay:-' + (r() * 18).toFixed(1) + 's,0s';
      fr.appendChild(s);
    }
    box.appendChild(fr); document.body.appendChild(box);
  }
  if (document.body) hacer(); else document.addEventListener('DOMContentLoaded', hacer);
})();
