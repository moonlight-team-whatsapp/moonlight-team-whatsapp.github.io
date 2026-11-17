// Sustitutos de alert / confirm / prompt con un emergente propio (mcAviso, mcConfirm, mcPrompt). Todos devuelven promesas.
(function(){
  const css = document.createElement('style');
  css.textContent = `#mcDlg{border:1px solid rgba(217,195,131,.5);border-radius:12px;background:#141b37;color:#eef0fb;padding:0;max-width:min(92vw,420px);font-family:'Crimson Pro',serif}
  #mcDlg::backdrop{background:rgba(0,0,0,.6)} #mcDlg .in{padding:20px} #mcDlg p{margin:0 0 14px;line-height:1.45;font-size:1.05rem;white-space:pre-line}
  #mcDlg input{width:100%;box-sizing:border-box;padding:8px 10px;margin:0 0 14px;font:inherit;color:#eef0fb;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.2);border-radius:8px}
  #mcDlg .ac{display:flex;gap:8px;justify-content:flex-end} #mcDlg button{padding:7px 16px;border-radius:999px;font:italic 600 1rem 'Cormorant',serif;cursor:pointer;color:#d9c383;border:1px solid rgba(217,195,131,.5);background:rgba(217,195,131,.08)}
  #mcDlg button.ok{background:#d9c383;color:#141b37}`;
  document.head.appendChild(css);
  function abre(texto, { input, valor = '', ok = 'Aceptar', cancel = true } = {}){
    return new Promise(res => {
      document.getElementById('mcDlg')?.remove();
      const d = document.createElement('dialog'); d.id = 'mcDlg';
      d.innerHTML = '<div class="in"><p></p>' + (input ? '<input type="text">' : '') + '<div class="ac">' + (cancel ? '<button type="button" class="no">Cancelar</button>' : '') + '<button type="button" class="ok"></button></div></div>';
      d.querySelector('p').textContent = texto; d.querySelector('.ok').textContent = ok;
      const inp = d.querySelector('input'); if (inp) inp.value = valor;
      let r = cancel ? (input ? null : false) : true;
      const fin = v => { r = v; d.close(); };
      d.querySelector('.ok').onclick = () => fin(input ? inp.value : true);
      const no = d.querySelector('.no'); if (no) no.onclick = () => fin(input ? null : false);
      if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') fin(inp.value); });
      d.addEventListener('close', () => { d.remove(); res(r); });
      document.body.appendChild(d); d.showModal(); (inp || d.querySelector('.ok')).focus();
    });
  }
  window.mcAviso = (t) => abre(t, { cancel: false });
  window.mcConfirm = (t, ok) => abre(t, { ok: ok || 'Aceptar' });
  window.mcPrompt = (t, valor) => abre(t, { input: true, valor });
})();
