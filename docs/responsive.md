# Адаптивные стили

## Структура

```css
@define-mixin responsive $property, $mobile, $tablet, $desktop;
```

- **property**: отвечает за свойство, к которому нужно применить резиновый адаптив, например:

```css
@define-mixin responsive gap
```

```css
@define-mixin responsive margin
```

```css
@define-mixin responsive padding
```

```css
@define-mixin responsive width
```

- **mobile**, **tablet**, **desktop**: значения, которые у нас должно иметь свойство на объявленных в `:root` брейк-поинтах, например:

```css
@define-mixin responsive gap, 16, 24, 32;
```

То есть, объявленное свойство, будет иметь резиновую адаптивность от и до ключевого брейк-поинта

## Выбор типографической системы

На данный момент существует два варианта типографической системы

- Отзывчивая (система Ильи Волкова)
- Резиновая (система Никиты Слесарева)

В шаблоне по умолчанию используется резиновая типографическая система. Вторая система располагается в отдельной директории `src/shared/styles/responsive-system`

### Замена типографической системы

В случае использования отзывчивой типографической системы, необходимо заменить файлы `responsive.css`, `typography.css`, `mixin.css`

Эти файлы располагаются по путям:

- responsive.css: `src/shared/styles/mixins`
- mixin.css: `src/shared/styles/mixins`
- typography.css: `src/shared/styles/variables`

_Примечание_: в файле `global.css` нужно удалить `font-size: 1vw`, так как эта настройка не требуется в отзывчивой системе
```css
html {
  font-size: 1vw;
}
```

## Важно !!!

Перед тем, как начать работу над проектом, в файле `postcss.config.js` требуется выставить нужные брейк-поинты, в соответствии с макетом