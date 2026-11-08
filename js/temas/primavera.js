// Tema de Primavera. Lo carga temporadas.js cuando la temporada está activa.
(function(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var G = ['🌸'], N = innerWidth < 600 ? 10 : 20;
  function hacer(){
    var box = document.createElement('div'); box.className = 'fx fx-primavera'; box.setAttribute('aria-hidden', 'true'); var fr = document.createDocumentFragment();
    for (var i = 0; i < N; i++){
      var s = document.createElement('span'), r = Math.random; var z = (8 + r() * 8).toFixed(0); s.style.cssText = 'left:' + (r() * 100).toFixed(1) + '%;width:' + z + 'px;height:' + z + 'px;animation-duration:' + (10 + r() * 9).toFixed(1) + 's,' + (3 + r() * 3).toFixed(1) + 's;animation-delay:-' + (r() * 18).toFixed(1) + 's,0s';
      fr.appendChild(s);
    }
    box.appendChild(fr); document.body.appendChild(box);
  }
  if (document.body) hacer(); else document.addEventListener('DOMContentLoaded', hacer);
})();
