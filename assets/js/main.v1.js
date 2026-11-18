/* AM CARTEL: меню, аккордеон, подбор направления, чек-лист, заявка */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  /* меню */
  var drawer = $('drawer'), burger = $('burger'), closeBtn = $('drawerClose'), lastFocus = null;
  function openD() {
    lastFocus = document.activeElement;
    drawer.setAttribute('data-open', 'true');
    document.body.classList.add('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    var f = drawer.querySelector('a,button'); if (f) f.focus();
  }
  function closeD() {
    if (!drawer) return;
    drawer.setAttribute('data-open', 'false');
    document.body.classList.remove('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (burger) burger.addEventListener('click', openD);
  if (closeBtn) closeBtn.addEventListener('click', closeD);
  if (drawer) {
    drawer.addEventListener('click', function (e) { if (e.target === drawer) closeD(); });
    document.addEventListener('keydown', function (e) {
      if (drawer.getAttribute('data-open') !== 'true') return;
      if (e.key === 'Escape') { closeD(); return; }
      if (e.key === 'Tab') {
        var f = drawer.querySelectorAll('a,button');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1099 && drawer.getAttribute('data-open') === 'true') closeD();
    });
  }

  /* аккордеон */
  document.querySelectorAll('.faq__q').forEach(function (b) {
    b.addEventListener('click', function () {
      var it = b.parentElement, open = it.getAttribute('data-open') === 'true';
      document.querySelectorAll('.faq__i').forEach(function (x) { x.setAttribute('data-open', 'false'); });
      it.setAttribute('data-open', open ? 'false' : 'true');
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  /* подбор направления */
  var DIR = {
    korea: { n: 'Южная Корея', t: '30–50 дней', tags: ['аукционы Encar и KCar', 'отчёт по VIN', '3–7 лет'],
      w: 'Корея сильна выбором в среднем бюджете: аукционные листы, история и реальный пробег. Хорошо подходит для кроссоверов, минивэнов и гибридов.' },
    china: { n: 'Китай', t: '30–45 дней', tags: ['электро и гибриды', 'до 3 лет', 'богатая комплектация'],
      w: 'Китай — про свежий год и электронику: Zeekr, Li, BYD, Xiaomi, Lixiang. Проверяем батарею и сервисную поддержку.' },
    uae: { n: 'ОАЭ', t: '40–55 дней', tags: ['премиум', 'внедорожники', 'кузов без реагентов'],
      w: 'Дубай даёт премиальные бренды и большие внедорожники в богатых комплектациях. Маршрут самый длинный, бюджет выше.' },
    europe: { n: 'Европа', t: '20–35 дней', tags: ['дизель и универсалы', 'сервисная история', 'ближе всех'],
      w: 'Европа — короткий маршрут и история обслуживания: Германия, Польша, Литва. Часто самый быстрый вариант доставки.' },
    kyrgyz: { n: 'Кыргызстан', t: '25–40 дней', tags: ['хаб ЕАЭС', 'альтернативное оформление'],
      w: 'Кыргызстан работает как хаб для авто из Кореи и Китая: иногда выгоднее по растаможке, но требует проверки документов.' }
  };

  function pickDir(budget, type, age, goal) {
    var sc = { korea: 0, china: 0, uae: 0, europe: 0, kyrgyz: 0 };
    if (type === 'ev') { sc.china += 3; sc.korea += 1; }
    if (type === 'premium') { sc.uae += 3; sc.europe += 2; }
    if (type === 'van') { sc.europe += 3; }
    if (type === 'suv') { sc.korea += 2; sc.uae += 1; }
    if (type === 'ice') { sc.europe += 2; sc.korea += 1; }
    if (age === 'new') { sc.china += 2; sc.uae += 1; }
    if (age === 'mid') { sc.korea += 1; sc.europe += 1; }
    if (age === 'old') { sc.europe += 2; sc.kyrgyz += 2; }
    if (budget === 'low') { sc.europe += 2; sc.kyrgyz += 2; sc.korea += 1; }
    if (budget === 'mid') { sc.korea += 1; sc.china += 1; }
    if (budget === 'high') { sc.uae += 1; sc.china += 1; sc.korea += 1; }
    if (budget === 'top') { sc.uae += 2; sc.china += 1; }
    if (goal === 'price') { sc.europe += 2; sc.kyrgyz += 2; }
    if (goal === 'fast') { sc.europe += 3; }
    if (goal === 'fresh') { sc.china += 2; sc.uae += 1; }
    if (goal === 'history') { sc.korea += 2; sc.europe += 1; }
    var order = Object.keys(sc).sort(function (a, b) { return sc[b] - sc[a]; });
    return { best: order[0], second: order[1], scores: sc };
  }

  function warnFor(budget, type, age) {
    if (type === 'premium' && (budget === 'low' || budget === 'mid')) return 'Премиум в таком бюджете — это автомобиль старше или с большим пробегом. Покажем варианты честно, без «идеальных» фото.';
    if (type === 'ev' && age === 'old') return 'Электромобиль старше 7 лет — отдельная проверка батареи и её ресурса. Считаем риски заранее.';
    if (type === 'van' && age === 'new') return 'Новый коммерческий транспорт везём в основном из Европы или Китая, срок и цена уточняются по модели.';
    return '';
  }

  var out = $('pickOut');
  if (out && $('pBudget')) {
    var goal = 'fast';
    document.querySelectorAll('#pGoal button').forEach(function (b) {
      b.addEventListener('click', function () {
        goal = b.getAttribute('data-g');
        document.querySelectorAll('#pGoal button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        render();
      });
    });
    ['pBudget', 'pType', 'pAge'].forEach(function (id) { $(id).addEventListener('change', render); });
    function render() {
      var r = pickDir($('pBudget').value, $('pType').value, $('pAge').value, goal);
      var d = DIR[r.best], s = DIR[r.second];
      var tags = '<span class="tag">' + d.t + '</span>' + d.tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('');
      var w = warnFor($('pBudget').value, $('pType').value, $('pAge').value);
      out.innerHTML = '<span class="mono">Результат подбора</span><h3>' + d.n + '</h3>' +
        '<p style="color:#2C3037;font-size:15.5px">' + d.w + '</p>' +
        '<div class="pick__meta">' + tags + '</div>' +
        (w ? '<div class="note"><b>Важно:</b> ' + w + '</div>' : '') +
        '<p style="color:#5D6067;font-size:14.5px">Ещё смотрим: ' + s.n + ' (' + s.t + ').</p>' +
        '<a class="btn" href="https://wa.me/375291383820?text=' + encodeURIComponent('Здравствуйте! Подбор: ' + d.n + ', бюджет ' + $('pBudget').selectedOptions[0].textContent + ', ' + $('pType').selectedOptions[0].textContent.toLowerCase() + ', ' + $('pAge').selectedOptions[0].textContent + '.') + '" target="_blank" rel="noopener">Обсудить подборку</a>';
    }
    render();
  }

  /* чек-лист перед оплатой */
  var chk = $('payCheck'), chkOut = $('checkOut');
  if (chk && chkOut) {
    var boxes = chk.querySelectorAll('input');
    function upd() {
      var picked = [];
      boxes.forEach(function (b) { if (b.checked) picked.push(b.value); });
      var n = picked.length, total = boxes.length;
      chkOut.innerHTML = '<span class="mono">Понятно</span><h3>' + n + ' из ' + total + '</h3>' +
        '<p style="color:#2C3037;font-size:15.5px">' + (n === total
          ? 'Все пункты закрыты — можно подписывать договор. Пришлите заявку, и мы подготовим его к просмотру.'
          : 'Отметьте пункты выше. Что осталось непонятным — обсудим до подписания, без обязательств.') + '</p>' +
        (picked.length ? '<div class="pick__meta">' + picked.map(function (p) { return '<span class="tag">' + p + '</span>'; }).join('') + '</div>' : '') +
        '<a class="btn ' + (n === total ? '' : 'btn--ghost') + '" href="https://wa.me/375291383820?text=' + encodeURIComponent('Здравствуйте! Вопрос по договору. Понятно: ' + (picked.join(', ') || 'пока ничего')) + '" target="_blank" rel="noopener">Задать вопрос</a>';
    }
    boxes.forEach(function (b) { b.addEventListener('change', upd); });
    upd();
  }

  /* форма */
  var form = $('reqForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (id) { var el = $(id); return el && el.value ? el.value.trim() : ''; };
      if (!g('fName') || !g('fTel')) {
        if (!g('fName')) { $('fName').focus(); } else { $('fTel').focus(); }
        return;
      }
      var text = 'Заявка с сайта AM CARTEL\nИмя: ' + g('fName') + '\nТелефон: ' + g('fTel') +
        (g('fCar') ? '\nАвто и бюджет: ' + g('fCar') : '') +
        (g('fMsg') ? '\nПожелания: ' + g('fMsg') : '');
      window.open('https://wa.me/375291383820?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }
})();
