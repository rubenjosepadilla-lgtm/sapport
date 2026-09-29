/* ==========================================================================
   lead-gate.js — descarga de guía PDF con captura de correo corporativo
   Envía el lead a HubSpot (Forms API v3) y luego dispara la descarga.
   Configuración por página en window.LEAD_CONFIG:
     { portalId:'XXXX', formId:'XXXX', privacyUrl:'/privacidad', accent:'#2563EB' }
   Uso: cualquier elemento con class="js-download-guide"
        y atributos data-pdf="/ruta.pdf" data-guide="Nombre de la guía"
   ========================================================================== */
(function () {
  var CFG = window.LEAD_CONFIG || {};
  var FREE = ['gmail.com','googlemail.com','hotmail.com','hotmail.es','outlook.com','outlook.es',
    'live.com','live.cl','msn.com','yahoo.com','yahoo.es','yahoo.cl','icloud.com','me.com','mac.com',
    'aol.com','proton.me','protonmail.com','gmx.com','gmx.es','mail.com','yandex.com','zoho.com','duck.com'];
  var accent = CFG.accent || '#2563EB';
  var privacyUrl = CFG.privacyUrl || '/privacidad';

  // ---- estilos ----
  var css = document.createElement('style');
  css.textContent = ''
    + '.lg-ov{position:fixed;inset:0;background:rgba(15,23,42,.55);display:none;align-items:center;justify-content:center;z-index:9999;padding:18px}'
    + '.lg-ov.open{display:flex}'
    + '.lg-modal{background:#fff;border-radius:16px;max-width:430px;width:100%;padding:28px 26px;box-shadow:0 30px 70px rgba(0,0,0,.3);font-family:inherit}'
    + '.lg-modal h3{margin:0 0 6px;font-size:20px;color:#0F172A;line-height:1.25}'
    + '.lg-modal p.sub{margin:0 0 18px;color:#64748b;font-size:14px}'
    + '.lg-field{margin-bottom:14px}'
    + '.lg-field label{display:block;font-size:12.5px;font-weight:600;color:#334155;margin-bottom:5px}'
    + '.lg-field input[type=email],.lg-field input[type=text]{width:100%;padding:11px 13px;border:1px solid #cbd5e1;border-radius:9px;font-size:14px;font-family:inherit}'
    + '.lg-field input:focus{outline:none;border-color:' + accent + ';box-shadow:0 0 0 3px ' + accent + '22}'
    + '.lg-consent{display:flex;gap:9px;align-items:flex-start;font-size:12px;color:#64748b;margin:6px 0 16px}'
    + '.lg-consent input{margin-top:2px}'
    + '.lg-consent a{color:' + accent + '}'
    + '.lg-btn{width:100%;background:' + accent + ';color:#fff;border:0;border-radius:10px;padding:13px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit}'
    + '.lg-btn:disabled{opacity:.55;cursor:not-allowed}'
    + '.lg-err{color:#dc2626;font-size:12.5px;margin:-6px 0 12px;display:none}'
    + '.lg-close{float:right;background:none;border:0;font-size:22px;color:#94a3b8;cursor:pointer;line-height:1;margin:-6px -4px 0 0}'
    + '.lg-ok{text-align:center;padding:10px 0}'
    + '.lg-ok .ic{font-size:40px}.lg-ok h3{margin:8px 0}'
    + '.lg-foot{font-size:11px;color:#94a3b8;text-align:center;margin-top:14px}';
  document.head.appendChild(css);

  // ---- markup ----
  var ov = document.createElement('div');
  ov.className = 'lg-ov';
  ov.innerHTML = ''
    + '<div class="lg-modal" role="dialog" aria-modal="true">'
    + '  <div class="lg-body">'
    + '    <button class="lg-close" aria-label="Cerrar">&times;</button>'
    + '    <h3>Descarga la guía en PDF</h3>'
    + '    <p class="sub" id="lg-guide">Déjanos tu correo corporativo y te la enviamos al instante.</p>'
    + '    <form id="lg-form" novalidate>'
    + '      <div class="lg-field"><label>Correo corporativo</label>'
    + '        <input type="email" id="lg-email" placeholder="nombre@tuempresa.cl" required></div>'
    + '      <div class="lg-err" id="lg-err"></div>'
    + '      <div class="lg-field"><label>Empresa</label>'
    + '        <input type="text" id="lg-company" placeholder="Nombre de tu empresa" required></div>'
    + '      <label class="lg-consent"><input type="checkbox" id="lg-consent" required>'
    + '        <span>Acepto que me contacten y el tratamiento de mis datos segun la '
    + '        <a href="' + privacyUrl + '" target="_blank" rel="noopener">politica de privacidad</a>.</span></label>'
    + '      <button type="submit" class="lg-btn" id="lg-submit">Descargar guia</button>'
    + '      <div class="lg-foot">Solo correos de empresa. No compartimos tus datos.</div>'
    + '    </form>'
    + '  </div>'
    + '</div>';
  document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(ov); bind(); });

  var current = { pdf: '', guide: '' };

  function open(pdf, guide) {
    current.pdf = pdf; current.guide = guide;
    document.getElementById('lg-guide').textContent = guide
      ? ('Deja tu correo corporativo para descargar: ' + guide + '.')
      : 'Deja tu correo corporativo y te la enviamos al instante.';
    resetForm();
    ov.classList.add('open');
    setTimeout(function(){ var e=document.getElementById('lg-email'); if(e) e.focus(); }, 50);
  }
  function close() { ov.classList.remove('open'); }
  function resetForm() {
    var b = ov.querySelector('.lg-body');
    // el formulario ya está; solo limpiar
    var f = document.getElementById('lg-form'); if (f) f.reset();
    var err = document.getElementById('lg-err'); if (err) err.style.display = 'none';
  }

  function validEmail(v) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Ingresa un correo válido.';
    var dom = v.split('@')[1].toLowerCase();
    if (FREE.indexOf(dom) !== -1) return 'Usa tu correo corporativo (no Gmail, Hotmail, Outlook, etc.).';
    return '';
  }

  function triggerDownload(url) {
    var a = document.createElement('a');
    a.href = url; a.download = ''; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  }

  function showSuccess() {
    ov.querySelector('.lg-body').innerHTML =
      '<div class="lg-ok"><div class="ic">&#10003;</div><h3>&iexcl;Listo!</h3>'
      + '<p class="sub">Tu descarga comenzo. Si no inicia, <a id="lg-manual" href="' + current.pdf + '" target="_blank" rel="noopener">haz clic aqui</a>.</p>'
      + '<button class="lg-btn" id="lg-done">Cerrar</button></div>';
    var d = document.getElementById('lg-done'); if (d) d.addEventListener('click', function(){ location.reload(); });
  }

  function submitHubSpot(email, company) {
    var pid = CFG.portalId, fid = CFG.formId;
    // Sin IDs configurados: no bloquear al usuario; registrar y continuar.
    if (!pid || !fid || /PLACEHOLDER/i.test(pid) || /PLACEHOLDER/i.test(fid)) {
      console.warn('[lead-gate] HubSpot portalId/formId no configurados; se omite el envío.');
      return Promise.resolve(true);
    }
    var url = 'https://api.hsforms.com/submissions/v3/integration/submit/' + pid + '/' + fid;
    var payload = {
      fields: [
        { name: 'email', value: email },
        { name: 'company', value: company }
      ],
      context: { pageUri: location.href, pageName: document.title },
      legalConsentOptions: { consent: {
        consentToProcess: true,
        text: 'Acepto el tratamiento de mis datos según la política de privacidad.'
      } }
    };
    return fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.ok; });
  }

  function bind() {
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    ov.addEventListener('click', function (e) { if (e.target.classList.contains('lg-close')) close(); });

    document.querySelectorAll('.js-download-guide').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        open(btn.getAttribute('data-pdf'), btn.getAttribute('data-guide') || '');
      });
    });

    ov.addEventListener('submit', function (e) {
      if (e.target.id !== 'lg-form') return;
      e.preventDefault();
      var email = document.getElementById('lg-email').value.trim();
      var company = document.getElementById('lg-company').value.trim();
      var consent = document.getElementById('lg-consent').checked;
      var err = document.getElementById('lg-err');
      var msg = validEmail(email);
      if (!company) msg = msg || 'Indica tu empresa.';
      if (!consent) msg = msg || 'Debes aceptar la política de privacidad.';
      if (msg) { err.textContent = msg; err.style.display = 'block'; return; }
      err.style.display = 'none';
      var sub = document.getElementById('lg-submit');
      sub.disabled = true; sub.textContent = 'Enviando…';
      submitHubSpot(email, company).then(function (ok) {
        if (typeof gtag === 'function') gtag('event', 'lead_guide_download', { guide: current.guide });
        triggerDownload(current.pdf);
        showSuccess();
      }).catch(function () {
        triggerDownload(current.pdf); // no penalizar al usuario si falla el envío
        showSuccess();
      });
    });
  }
})();
