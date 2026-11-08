// Tema de Verano. Lo carga temporadas.js cuando la temporada está activa.
(function(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var G = [], N = innerWidth < 600 ? 10 : 22;
  function hacer(){
    var box = document.createElement('div'); box.className = 'fx fx-verano'; box.setAttribute('aria-hidden', 'true'); var fr = document.createDocumentFragment();
    for (var i = 0; i < N; i++){
      var s = document.createElement('span'), r = Math.random; s.style.cssText = 'left:' + (r() * 96).toFixed(1) + '%;top:' + (8 + r() * 84).toFixed(1) + '%;--dx:' + ((r() - .5) * 140).toFixed(0) + 'px;--dy:' + ((r() - .5) * 90).toFixed(0) + 'px;animation-duration:' + (6 + r() * 7).toFixed(1) + 's,' + (2 + r() * 3).toFixed(1) + 's;animation-delay:-' + (r() * 9).toFixed(1) + 's,-' + (r() * 4).toFixed(1) + 's';
      fr.appendChild(s);
    }
    box.appendChild(fr); document.body.appendChild(box);
  }
  if (document.body) hacer(); else document.addEventListener('DOMContentLoaded', hacer);
})();
