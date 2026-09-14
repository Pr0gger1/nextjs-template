# Метрики. Быстрая реализация (Яндекс.Метрика, Adriver)

Ниже смотри подробное объяснение. А еще ниже — гайд по тестированию.

На проекте подключаются **Яндекс.Метрика** и **Adriver** (рекламные показы). ID счётчиков и параметры сверяем с задачей от менеджера/аналитика; идентификаторы выносим в константы.

### Что делаем по шагам

**1. Файл констант метрик**

Создаём файл с константами в директории `shared/config`.

**Идентификаторы.** В начале файла объявляем числовые ID; значения — из задачи от менеджера/аналитика.

```ts
export const METRICS_IDS = {
	yandexMetrika1: 1087008,
	yandexMetrika2: 47142057,
	adriverSid: 224084,
};
```

**Скрипты и URL.** Из этих констант формируем строки скриптов и noscript-картинок:

```ts
export const YANDEX_METRIKA_SCRIPT_1 = `
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

ym(${METRICS_IDS.yandexMetrika1}, "init", {
  clickmap:true,
  trackLinks:true,
  accurateTrackBounce:true,
  webvisor:true,
  trackHash:true
});
`;

export const YANDEX_METRIKA_SCRIPT_2 = `
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

ym(${METRICS_IDS.yandexMetrika2}, "init", {
  clickmap:true,
  trackLinks:true,
  accurateTrackBounce:true,
  trackHash:true
});
`;

const METRIKA_COUNTERS_JSON = JSON.stringify([METRICS_IDS.yandexMetrika1, METRICS_IDS.yandexMetrika2]);

export const ADRIVER_SCRIPT = `
(function(){
  var METRIKA_COUNTERS = ${METRIKA_COUNTERS_JSON};
  var MIN_DELAY_MS = 4000;
  var START_TS = Date.now();

  function probeCounter(counterId, onReady){
    var intervalId = setInterval(function(){
      if (typeof window === 'undefined' || typeof window.ym !== 'function') { return; }
      try {
        window.ym(counterId, 'getClientID', function(){
          clearInterval(intervalId);
          onReady();
        });
      } catch(e) {}
    }, 200);
  }

  function runAdriver(){
    !function(e,n){function o(e,n,o){n=n||"&",o=o||"=";var d=[];for(var r in e)e.hasOwnProperty(r)&&d.push(r+o+encodeURIComponent(e[r]));return d.join(n)}function d(e,n){var o=e.cookie.match("(^|;) ?"+n+"=([^;]*)(;|$)");return o?decodeURIComponent(o[2]):null}var r,t,i,c,u;r=e,t=n,i=document.domain,c={tail256:document.referrer||"unknown"},void 0!==(u=function(e){var n={};if(e){var o=e.split("&");for(var d in o)if(o.hasOwnProperty(d)){var r=o[d].split("=");void 0!==r[0]&&void 0!==r[1]&&(n[r[0]]=decodeURIComponent(r[1]))}}return n}(window.location.search.substring(1))).adrclid&&(r.fsid=u.adrclid),null!==d(document,"adrcid")&&(r.cid=d(document,"adrcid")),t&&t.id&&null!==d(document,t.id)&&(r.suid=i+"_"+encodeURIComponent(d(document,t.id))),t&&t.gid1?r.gid1=t.gid1:null!==d(document,"_ga")&&(r.gid1=encodeURIComponent(d(document,"_ga"))),t&&t.yid1?r.yid1=t.yid1:null!==d(document,"_ym_uid")&&(r.yid1=encodeURIComponent(d(document,"_ym_uid"))),r.loc=encodeURIComponent(window.location.href),r.custom&&(r.custom=o(r.custom,";")),function(e,n){!function(e){if(e=e.split("![rnd]").join(~~(1e6*Math.random())),document.createElement&&document.body){var n=document.createElement("img");n.style.position="absolute",n.style.display="none",n.style.width=n.style.height="0px",n.setAttribute("referrerpolicy","no-referrer-when-downgrade"),n.src=e,document.body.appendChild(n)}else{var o=new Image;o.setAttribute("referrerpolicy","no-referrer-when-downgrade"),o.src=e}}("https://ad.adriver.ru/cgi-bin/rle.cgi?"+e+"&rnd=![rnd]"+(n?"&"+n:""))}(o(r),o(c))}
    ({sid:${METRICS_IDS.adriverSid}, bt:62, sz:'main'},{id:"",gid1:"",yid1:""});
  }

  (function ensureOrder(){
    var remaining = METRIKA_COUNTERS.length;
    function onCounterReady(){
      remaining -= 1;
      if (remaining === 0){
        var elapsed = Date.now() - START_TS;
        var toWait = Math.max(0, MIN_DELAY_MS - elapsed);
        setTimeout(runAdriver, toWait);
      }
    }
    METRIKA_COUNTERS.forEach(function(id){ probeCounter(id, onCounterReady); });
  })();
})();
`;

export const YANDEX_METRIKA_NOSCRIPT_IMAGES = {
  FIRST: `https://mc.yandex.ru/watch/${METRICS_IDS.yandexMetrika1}`,
  SECOND: `https://mc.yandex.ru/watch/${METRICS_IDS.yandexMetrika2}`,
};
```

**2. Подключение в layout**

В файле `app/layout.tsx`:

- **В начало `<head>`** вставляем скрипты Метрики и `<noscript>` (константы из шага 1).
- **В конец `<body>`** — компонент `Script` из `next/script` со скриптом Adriver, с `strategy="afterInteractive"`, для загрузки до гидрации.

В `<head>`:

```ts
<script
  type="text/javascript"
  dangerouslySetInnerHTML={{
    __html: YANDEX_METRIKA_SCRIPT_1,
  }}
/>
<noscript>
  <div>
    <img
      src={YANDEX_METRIKA_NOSCRIPT_IMAGES.FIRST}
      style={{ position: 'absolute', left: '-9999px' }}
      alt=""
    />
  </div>
</noscript>
<script
  type="text/javascript"
  dangerouslySetInnerHTML={{
    __html: YANDEX_METRIKA_SCRIPT_2,
  }}
/>
<noscript>
  <div>
    <img
      src={YANDEX_METRIKA_NOSCRIPT_IMAGES.SECOND}
      style={{ position: 'absolute', left: '-9999px' }}
      alt=""
    />
  </div>
</noscript>
```

В конец `<body>`:

```ts
<Script
  id="adriver"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: ADRIVER_SCRIPT,
  }}
/>
```

**3. Утилита для отправки целей**

Создаём файл `shared/lib/analytics.ts`: расширяем тип `Window`, объявляем функцию отправки цели. ID счётчика — из констант метрик (шаг 1). Проверка `typeof window !== 'undefined'` — из‑за SSR.

```ts
import { METRICS_IDS } from '@/shared/config/metrics/constants'; // или путь к файлу констант из шага 1

declare global {
  interface Window {
    ym: (
      counterId: number,
      action: 'reachGoal',
      target: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export const sendYandexMetricaEvent = (
  target: string,
  params?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && window.ym && METRICS_IDS.yandexMetrika1) {
    const eventParams = params || {
      [target]: { URL: window.location.href },
    };
    window.ym(METRICS_IDS.yandexMetrika1, 'reachGoal', target, eventParams);
  }
};
```

**4. Использование в коде**

На кнопки и ссылки, по которым нужно считать конверсии, вешаем `onClick` с вызовом `sendYandexMetricaEvent`. Название целевого действия всегда берём из задачи (файл от менеджера/аналитика).

Для внешних ссылок (на одностраничных лендингах все ссылки, как правило, внешние) используйте нативный тег `<a>`, а не компонент `Link` из Next.js — так корректно отрабатывают переходы и атрибуция.

Пример:

```ts
<Action
  onClick={() => sendYandexMetricaEvent('promo_i_love_car_check_acc')}
/>
```

---

## Документация: что, зачем и почему

Ниже — краткая справка для осведомлённости: что за системы мы подключаем, как они связаны и почему реализация устроена именно так.

### Яндекс.Метрика

**Что это.** Сервис аналитики Яндекса: считает посещения, отказы, глубину просмотра, строит воронки и отчёты. Позволяет настраивать **цели** (например, «клик по кнопке», «отправка формы») и смотреть **вебвизор** (запись сессий).

**Зачем на проекте.** Маркетинг и продукт смотрят, как ведут себя пользователи, откуда приходят, какие действия совершают. Цели нужны для оценки эффективности рекламы и конверсий.

**Почему скрипт в `<head>` и `dangerouslySetInnerHTML`.** Метрика должна загружаться рано, чтобы учитывать визиты и не потерять данные. В React/Next.js инлайн-скрипт вставляется через `dangerouslySetInnerHTML` — другого способа «влить» строку с кодом в тег `<script>` нет. Код мы берём из констант, а не из пользовательского ввода, поэтому риски XSS контролируемы.

**Зачем `<noscript>` и картинки.** У части пользователей отключён JavaScript. Метрика в таком случае не работает, но для учёта визитов можно отправить запрос через картинку (`<img src="https://mc.yandex.ru/watch/ID">`). Этот запрос вешается в `<noscript>`, чтобы выполняться только когда JS недоступен.

---

### Adriver

**Что это.** Рекламная система (баннеры, пиксели, посткликовая аналитика). Часто используется вместе с Метрикой для атрибуции: рекламный показ/клик связывается с действиями пользователя на сайте.

**Зачем на проекте.** Рекламный отдел и маркетинг отслеживают конверсии с рекламы, считают эффективность кампаний. Скрипт Adriver отправляет данные о визите/действиях на их серверы.

**Почему скрипт через `Script` с `strategy="afterInteractive"`.** Adriver в коде ждёт, пока инициализируется Метрика (`ym`), и только потом делает свой запрос. По хорошему скрипт Adriver подключаем **в конец `<body>`** компонентом Next.js `Script` с `strategy="afterInteractive"`, для загрузки до гидрации.

**Почему задержка `MIN_DELAY_MS`.** Скрипт Adriver ждёт готовности счётчиков Метрики (через опрос `ym(..., 'getClientID', ...)`) и дополнительно выдерживает паузу (например, 4 секунды). Так рекламная система получает уже «прогретые» данные (в т.ч. идентификаторы), и атрибуция строится корректно. Уменьшать задержку или менять порядок без согласования с менеджерами и разработкой не стоит.

---

### Цели (reachGoal), целевое действие и название целевого действия

**Что такое цель.** В интерфейсе Метрики настраивается цель с уникальным идентификатором — **названием целевого действия** (например, `promo_i_love_car_check_acc`). **Целевое действие** — это то, что мы считаем конверсией: например, клик по кнопке, отправка формы. В коде мы вызываем `ym(counterId, 'reachGoal', target, params)` — так фиксируется достижение цели; аргумент `target` — это и есть название целевого действия.

**Почему название целевого действия берём только из задачи.** Идентификатор должен **точно совпадать** с тем, что создан в интерфейсе Метрики. Если написать другое название, отчёт покажет нули или цель не сработает. Поэтому названия целевых действий всегда приходят от менеджера/аналитика (файл, ТЗ, тикет) и не придумываются разработчиком.

**Зачем параметры `params`.** Второй аргумент `sendYandexMetricaEvent(target, params)` передаётся в Метрику как доп. данные к цели (цена заказа, название кнопки и т.п.). Структуру и набор полей задаёт аналитика; мы лишь передаём объект в `ym`.

---

### SSR и проверка `window`

Next.js рендерит страницы на сервере (SSR). В Node.js нет объекта `window` и глобальной функции `ym` — они существуют только в браузере. Поэтому перед вызовом `window.ym` мы проверяем: `typeof window !== 'undefined' && window.ym`. Так код не падает при серверном рендере и корректно отрабатывает на клиенте при кликах и других событиях.

---

## Гайд по тестированию метрик

Проверить, что цель уходит в Яндекс.Метрику, можно двумя способами: по запросам в Network и по выводу в консоль. 

### 1. DevTools → Network

1. Откройте сайт в браузере и DevTools.
2. Вкладка **Network** (Сеть).
3. В фильтр введите `mc.yandex` или `watch` — так отфильтруются запросы к Метрике.
4. Нажмите кнопку/ссылку, на которой висит метрика.
5. В списке запросов должен появиться новый запрос к домену `mc.yandex.ru` (часто путь содержит `watch` или похожий). Откройте запрос — во вкладке **Payload** / **Полезная нагрузка** или в URL будут параметры; по ним можно убедиться, что это именно отправка цели.

### 2. Консоль: перехват вызовов `ym` (со 100% точностью на клиенте)

Чтобы точно видеть, что в момент клика вызывается `ym` с нужными аргументами, можно временно «обернуть» глобальную функцию и выводить все вызовы в консоль.

Вставьте в консоль DevTools (Console) **до** нажатия на кнопку:

```js
(function () {
  if (typeof window === 'undefined' || !window.ym) {
    console.warn('[Метрика] window.ym ещё нет — дождитесь загрузки страницы и выполните скрипт снова.');
    return;
  }
  const original = window.ym;
  window.ym = function (counterId, action, target, params) {
    if (action === 'reachGoal') {
      console.log(
        '%c[Метрика] reachGoal',
        'color: #6b2; font-weight: bold',
        '\n  Счётчик:', counterId,
        '\n  Цель:', target,
        '\n  Параметры:', params ?? '—'
      );
    }
    return original.apply(this, arguments);
  };
  console.log('%c[Метрика] Логирование включено. Нажимайте кнопки — вызовы ym("reachGoal", ...) появятся здесь.', 'color: #06c');
})();
```

После этого нажимайте на кнопку с метрикой. В консоли появится строка вида:

- **Счётчик** — ID счётчика Метрики.
- **Цель** — название целевого действия (должно совпадать с тем, что в задаче).
- **Параметры** — объект с доп. данными или «—», если параметров нет.

Так вы видите **ровно то**, что ушло в `ym` на клиенте: название целевого действия и параметры. Дальше в интерфейсе Метрики (раздел «Проверка целей» или отчёты) можно убедиться, что цель реально засчиталась на сервере.

**Чтобы отключить логирование** — обновите страницу или выполните в консоли перезагрузку; обёртка сбросится.

---

