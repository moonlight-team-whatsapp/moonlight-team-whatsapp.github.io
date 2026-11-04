// Decoración de Navidad: del 1 de diciembre al 6 de enero (o con ?navidad=1 para verla fuera de fechas)
(function(){
  var d = new Date(), m = d.getMonth(), day = d.getDate();
  var on = m === 11 || (m === 0 && day <= 6) || /[?&]navidad=1\b/.test(location.search);
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
