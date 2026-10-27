/* contact-form.js — formulario de contacto Sapport -> HubSpot (Forms API v3)
   Uso: <div id="sapport-contact" data-lang="es|en"></div> + <script src="/js/contact-form.js" defer></script> */
(function () {
  var PORTAL = '51844342', FORM = 'eb2a3eeb-a70c-48ed-8873-a82d09e668f5';
  var box = document.getElementById('sapport-contact');
  if (!box) return;
  var en = box.getAttribute('data-lang') === 'en';
  var T = en ? {
    name: 'Name', email: 'Work email', company: 'Company', phone: 'Phone (optional)',
    msg: 'How can we help? (project, profile, timing)', consent: 'I agree to the processing of my data under the',
    policy: 'privacy policy', send: 'Send', sending: 'Sending…',
    ok: 'Thanks! We will contact you within one business day.',
    err: 'We could not send the form. Please write to contacto@sapport.cl',
    req: 'Please complete name, work email, company and consent.', privacy: '/en/privacidad'
  } : {
    name: 'Nombre', email: 'Correo de empresa', company: 'Empresa', phone: 'Teléfono (opcional)',
    msg: '¿En qué te podemos ayudar? (proyecto, perfil, plazos)', consent: 'Acepto el tratamiento de mis datos según la',
    policy: 'política de privacidad', send: 'Enviar', sending: 'Enviando…',
    ok: '¡Gracias! Te contactamos dentro de un día hábil.',
    err: 'No pudimos enviar el formulario. Escríbenos a contacto@sapport.cl',
    req: 'Completa nombre, correo de empresa, empresa y la aceptación.', privacy: '/privacidad'
  };
  var css = document.createElement('style');
  css.textContent = '.sc-form{max-width:560px;margin:28px auto 0;background:#fff;border-radius:16px;padding:26px 24px;text-align:left;box-shadow:0 18px 40px rgba(0,0,0,.18);color:#0F172A}'
    + '.sc-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:560px){.sc-row{grid-template-columns:1fr}}'
    + '.sc-form label{display:block;font-size:13px;font-weight:600;color:#334155;margin:0 0 5px}'
    + '.sc-form input,.sc-form textarea{width:100%;box-sizing:border-box;border:1px solid #CBD5E1;border-radius:10px;padding:11px 12px;font:inherit;font-size:15px;color:#0F172A;background:#fff;margin-bottom:12px}'
    + '.sc-form textarea{min-height:96px;resize:vertical}'
    + '.sc-form .sc-consent{display:flex;gap:8px;align-items:flex-start;font-size:12.5px;color:#64748b;margin:2px 0 14px}'
    + '.sc-form .sc-consent input{width:auto;margin:3px 0 0}.sc-form .sc-consent a{color:#E46A25}'
    + '.sc-form button{width:100%;background:#E46A25;color:#fff;border:0;border-radius:10px;padding:13px;font:inherit;font-weight:700;font-size:15px;cursor:pointer}'
    + '.sc-form button[disabled]{opacity:.6;cursor:default}.sc-msg{font-size:14px;margin-top:10px;color:#B91C1C}.sc-ok{text-align:center;font-weight:600;color:#0F2D4A;padding:18px 4px}';
  document.head.appendChild(css);
  box.innerHTML = '<form class="sc-form" novalidate>'
    + '<div class="sc-row"><div><label for="sc-n">' + T.name + '</label><input id="sc-n" name="firstname" autocomplete="name" required></div>'
    + '<div><label for="sc-c">' + T.company + '</label><input id="sc-c" name="company" autocomplete="organization" required></div></div>'
    + '<div class="sc-row"><div><label for="sc-e">' + T.email + '</label><input id="sc-e" name="email" type="email" autocomplete="email" required></div>'
    + '<div><label for="sc-p">' + T.phone + '</label><input id="sc-p" name="phone" type="tel" autocomplete="tel"></div></div>'
    + '<label for="sc-m">' + T.msg + '</label><textarea id="sc-m" name="message"></textarea>'
    + '<label class="sc-consent"><input type="checkbox" id="sc-ok" required><span>' + T.consent + ' <a href="' + T.privacy + '">' + T.policy + '</a>.</span></label>'
    + '<button type="submit">' + T.send + '</button><div class="sc-msg" aria-live="polite"></div></form>';
  var f = box.querySelector('form'), msg = f.querySelector('.sc-msg'), btn = f.querySelector('button');
  function utm() {
    var p = new URLSearchParams(location.search), o = {};
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) { if (p.get(k)) o[k] = p.get(k); });
    return o;
  }
  function cookie(n) { var m = document.cookie.match('(?:^|; )' + n + '=([^;]*)'); return m ? decodeURIComponent(m[1]) : null; }
  f.addEventListener('submit', function (e) {
    e.preventDefault(); msg.textContent = '';
    var v = function (id) { return (f.querySelector(id).value || '').trim(); };
    var name = v('#sc-n'), email = v('#sc-e'), company = v('#sc-c');
    if (!name || !company || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !f.querySelector('#sc-ok').checked) { msg.textContent = T.req; return; }
    btn.disabled = true; btn.textContent = T.sending;
    var u = utm(), extra = Object.keys(u).map(function (k) { return k + '=' + u[k]; }).join(' ');
    var fields = [
      { name: 'firstname', value: name }, { name: 'email', value: email }, { name: 'company', value: company },
      { name: 'phone', value: v('#sc-p') }, { name: 'marca', value: 'Sapport' },
      { name: 'message', value: v('#sc-m') + (extra ? '\n[' + extra + ']' : '') }
    ].filter(function (x) { return x.value; });
    var ctx = { pageUri: location.href, pageName: document.title }; var hut = cookie('hubspotutk'); if (hut) ctx.hutk = hut;
    fetch('https://api.hsforms.com/submissions/v3/integration/submit/' + PORTAL + '/' + FORM, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: fields, context: ctx,
        legalConsentOptions: { consent: { consentToProcess: true, text: T.consent + ' ' + T.policy } } })
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      if (typeof gtag === 'function') gtag('event', 'lead_contact', u);
      box.innerHTML = '<div class="sc-form"><div class="sc-ok">' + T.ok + '</div></div>';
    }).catch(function () { btn.disabled = false; btn.textContent = T.send; msg.textContent = T.err; });
  });
})();
