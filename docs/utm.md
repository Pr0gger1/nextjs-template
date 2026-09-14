## Метрики ссылок на внешние ресурсы. UTM параметры

Гайд по тестированию UTM — в конце документа.

На сайте часто бывают ссылки на внешние страницы: партнёры, документы, другие сервисы. Пользователь мог прийти к нам по рекламе — в адресе тогда есть UTM-метки (`utm_source`, `utm_medium` и т.д.). Если при клике на внешнюю ссылку эти метки не передать, следующий ресурс не узнает, откуда пришёл переход, и цепочка аналитики рвётся. Поэтому мы «пробрасываем» UTM во внешние ссылки: и атрибуция сохраняется, и метрики остаются честными.

1. (Утилита для п. 3) В файле `shared/lib/utm.ts` создаем массив, который задаёт порядок вывода и список разрешённых параметров (остальные `utm_*` не попадают в результат).
```ts
const UTM_KEYS = [  
  'utm_source',  
  'utm_medium',  
  'utm_campaign',  
  'utm_term',  
  'utm_content',  
] as const;
```

2. (Утилита для п. 3) Вспомогательная функция: принимает название параметра из URL «как есть» (например `Utm_Source`), возвращает одно из пяти стандартных имён (`utm_source`, `utm_medium`, …) или `undefined`, если это не UTM или не из списка. Так разные написания одного и того же параметра не теряются при разборе.
```ts
const getStandardUtmKey = (rawKey: string) => {  
  const normalized = rawKey.replace(/\s+/g, '').toLowerCase();  
  if (!normalized.startsWith('utm_')) return undefined;  
  return UTM_KEYS.find(k => k === normalized);  
}
``` 

3. (Нужна только для п. 4) Функция getUtmParams извлекает стандартные UTM-метки из URL текущей страницы и собирает их в одну строку (query string). На сервере (SSR) возвращает пустую строку; на клиенте читает `window.location.search`, фильтрует только разрешённые `utm_*`, остальное отбрасывает.

**Пример:**  `?utm_medium=cpc&foo=bar&utm_source=google` → `utm_source=google&utm_medium=cpc`.
```ts
export const getUtmParams = (): string => {  
  if (typeof window === 'undefined') return '';  
  
  const urlParams = new URLSearchParams(window.location.search);  
  const collected = new Map<string, string>();  
  
  for (const key of UTM_KEYS) {  
   const value = urlParams.get(key);  
   if (value) collected.set(key, value);  
  }  
  
  for (const [key, value] of urlParams.entries()) {  
   const standardKey = getStandardUtmKey(key);  
   if (standardKey && !collected.has(standardKey)) {  
    collected.set(standardKey, value);  
   }  
  }  
  
  return new URLSearchParams(  
   UTM_KEYS.filter(k => collected.has(k)).map(k => [k, collected.get(k)!])  
  ).toString();  
};
```

4. addUtmToUrl берет любой URL и дописывает к нему UTM-параметры текущей страницы (через getUtmParams из п.3). Вызывается внутри хука из п.5 — в компонентах используйте хук, а не эту функцию напрямую.

```ts
export const addUtmToUrl = (url: string): string => {
  if (!url) return url;
  
  const utmParams = getUtmParams();
  
  if (!utmParams) return url;
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${utmParams}`;
};
```

5. **Хук для использования в компонентах.** useUtmUrl принимает URL и возвращает тот же URL, но с UTM-параметрами текущей страницы. UTM подставляются только на клиенте: при первом рендере (и на сервере) возвращается исходный URL без UTM, чтобы не было расхождения при гидрации; после монтирования в `useEffect` вызывается addUtmToUrl из п.4, и состояние обновляется уже с UTM. В компонентах подставляйте ссылки через этот хук, а не через addUtmToUrl напрямую.
```ts
export const useUtmUrl = (url: string | undefined): string => {
    const [utmUrl, setUtmUrl] = useState<string>(url || '');
    
    useEffect(() => {
        if (url && typeof window !== 'undefined') {
          setUtmUrl(addUtmToUrl(url));
        }
    }, [url]);
     
    return utmUrl;
};
```

## Использование хука useUtmUrl
Хук подключают один раз — в компоненте `shared/ui/action` (универсальная кнопка-ссылка). Тогда все внешние ссылки, отрисованные через этот компонент, автоматически получают UTM-параметры текущей страницы; внутренние ссылки и обычные кнопки не меняются.

1. В файле компонента объявляем две вспомогательные функции. **isLinkProps** проверяет, что в пропсах передан `href` (т.е. это ссылка, а не кнопка). **isExternalLink** по адресу определяет, ведёт ли ссылка на внешний сайт (`http://` или `https://`). Они нужны, чтобы UTM добавлять только внешним ссылкам.
```ts
const isLinkProps = (props: ActionButtonProps) => typeof (props as ComponentProps<typeof Link>).href !== 'undefined';

const isExternalLink = (href: string | undefined) => {
  if (!href) return false;
  return href.startsWith('http://') || href.startsWith('https://');
};
```
2. В теле компонента в начале считаем `href` (для кнопки будет `undefined`) и один раз вызываем useUtmUrl. Дальше меняем только логику для ссылок: если это ссылка, смотрим внешняя или внутренняя. Для внешней — рисуем тег `<a>` с адресом `utmUrl` из хука. Для внутренней — как раньше `<Link>`. Кнопки не трогаем.
```ts
const href = isLinkProps(props)
    ? (typeof props.href === 'string' ? props.href : props.href?.toString())
    : undefined;

const utmUrl = useUtmUrl(href);

if (isLinkProps(props)) {
    const isExternal = isExternalLink(href);
    if (isExternal && href) {
        const { href: _, ...linkProps } = props;
        return (
            <a {...linkProps} href={utmUrl} className={classNames}>
                {props.children}
            </a>
        );
    }
    return (
        <Link {...props} className={classNames}>
            {props.children}
        </Link>
    );
}
```

---

## Гайд по тестированию UTM

Проверить, что UTM-параметры пробрасываются во внешние ссылки, можно так.

1. **Откройте сайт** в браузере.
2. **Добавьте к URL текущей страницы** UTM-параметры в query string. Например:
   ```
   /?utm_source=FG&utm_medium=HJS&utm_campaign=AKKD
   ```
   Итоговый адрес будет вида: `https://ваш-сайт.ru/?utm_source=FG&utm_medium=HJS&utm_campaign=AKKD`.
3. **Перейдите по внешней ссылке** на этой странице (кнопка/ссылка, которая ведёт на другой домен и рендерится через компонент с `useUtmUrl`).
4. **Проверьте адрес страницы, на которую перешли.** В URL внешнего сайта должны появиться те же UTM: `utm_source=FG`, `utm_medium=HJS`, `utm_campaign=AKKD` (и другие, если вы их добавляли в текущую страницу). Если параметры сохранились — проброс UTM работает корректно.
