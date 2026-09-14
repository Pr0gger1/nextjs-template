# Стандарты по работе с запросами

## Fetch

### Что такое `fetch()` для Next.js?

Это специальным образом настроенная функция для выполнения запросов к данным (API, базам данных и т.д.), которая предоставляет три ключевые возможности:

1. Автоматическое кэширование данных
2. Предотвращение повторных параллельных запросов к одним и тем же ресурсам
3. Интеграция с рендерингом на стороне сервера (SSR, ISR, SSG)

> **Интересное** <br>
> только `fetch` работает в `edge` среде, которая используется в `middleware` в `next.js`

### Когда использовать ?

Мы используем `fetch()`, для интеграции с кешем на сервере. Основным инструментом выступает `axios`.

**Основные сценарии**

**SSG**
_Пример_: есть страница с лицензией, которая очень редко меняется

`fetch()` делает запрос единственный раз при `pnpm build` и более он не отрабатывает до следующей сборки

**SSR**
_Пример_: есть страница профиля с данными пользователя.

`fetch()` будет вызываться каждый раз при запросе клиента, чтобы отображать актуальную информацию

**ISR**
_Пример_: есть страница новостей, данные в которой обновляются периодически

`fetch()` будет вызываться каждый раз после истечения `revalidate`, который был задан

### Синтаксис

```jsx
// В Server Component
async function getData() {
  // Самый простой вызов - будет закэширован навсегда (до пересборки)
  const response = await fetch('https://api.example.com/posts');

  // Но почти всегда мы используем опции кэширования!
  const res = await fetch('https://api.example.com/posts', {
    // Самая важная опция: определяет поведение кэширования
    next: {
      revalidate: 60 // Обновлять данные каждые 60 секунд
    },

    // Другие опции (реже используются, но важны для SSR):
    cache: 'default' // дефолтное поведение, браузер решает, использовать кэш или нет
    cache: 'force-cache' // использовать кэш, если есть, иначе загрузить
    cache: 'no-store' // НЕ кэшировать вообще, всегда свежий запрос (как у SSR)
  });

  return res.json();
}

export default async function Page() {
  const posts = await getData();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

Также можно использовать `revalidate` вне конфигурации `fetch()`

```jsx
export const revalidate = 60

async function getData() {
  const response = await fetch('https://api.example.com/posts');

  const res = await fetch('https://api.example.com/posts', {
    cache: 'auto no cache'
    cache: 'no-store'
  });

  return res.json();
}

export default async function Page() {
  const posts = await getData();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

`revalidate` применится ко всем запросам на странице

> Если вместе с общим `revalidate` указать `revalidate` в конфигурации `fetch()`, то последний будет иметь приоритет над общим, т.е. время обновления для конкретного запроса будет браться из его конфигурации, а не общее

## ky

Это современная обёртка над `fetch`, которая упрощает работу с HTTP-запросами в браузере. Он автоматически обрабатывает `JSON`, поддерживает таймауты, повторные запросы и отмену. Основной инструмент для запросов в экосистеме `JavaScript` остаётся `Axios`, так как он более универсален и поддерживает прогресс загрузки файлов, чего `fetch` и `ky` напрямую не дают

## Axios

### Что такое Axios ?

**Axios** — это популярная JavaScript-библиотека для выполнения HTTP-запросов. Построена поверх `XmlHttpRequest`. Она представляет ряд удобств по сравнению с `fetch()`

```js
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // базовый URL, который будет подставляться в начало всех запросов
  headers: {
    // Заголовки, которые мы можем прикрепить ко всем запросам, использующие apiClient
    "Content-Type": "application/json", // гарантируем, что всегда шлём JSON
    Accept: "application/json", // даём понять, что мы ждёт только JSON (не HTML и т.д)
  },
  withCredentials: true, // позволяет отправлять cookies при кросс-доменных запросах
  maxRedirects: 0, // не следовать редиректам. Вместо этого вы получите сам ответ с кодом 302/301
  withXSRFToken: false, // cookie с именем XSRF-TOKEN, добавляется его в заголовок X-XSRF-TOKEN для state-changing запросов По умолчанию равен true.
});

export default apiClient;
```

Так же `axios` поддерживает кастомные поля для запросов:

```ts
import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    withToken?: boolean;
    _retry?: boolean;
  }
}
```

Которые можно использовать внутри `Interceptor`.

### Когда его использовать и для чего он нужен ?

**Interceptors**

_Проблема_: нужно к каждому запросу автоматически добавлять токен авторизации, а на каждый ответ — обрабатывать возможные ошибки

_Решение_: с **Axios** нам не нужно думать о заголовках авторизации или глобальной обработке ошибок. **Без Axios** пришлось бы вручную добавлять заголовок к каждому `fetch` и дублировать код проверки ошибок.

```js
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});
```

**Автоматическое преобразование данных**

_Проблема_: `fetch` возвращает ответ в формате **ReadableStream**. Его нужно сначала преобразовать в **JSON** с помощью `.json()`, что добавляет лишний шаг.

_Решение_: **Axios** автоматически преобразует JSON-ответ в готовый JavaScript-объект в свойстве `data`.

```js
// С Axios
const { data } = await apiClient.get("/posts");

// С нативным fetch (больше шагов)
const response = await fetch("/api/posts");
if (!response.ok) {
  throw new Error("Ошибка сети");
}
const data = await response.json();
```

**Удобная отмена запросов**

_Проблема_: пользователь быстро переходит между страницами, компонент демонтируется, но запрос может завершиться и попытаться обновить состояние `unmounted` компонента, вызывая ошибку в консоли.

_Решение_: использование `AbortController` интегрировано прямо в API. **Без Axios** мы тоже можем использовать AbortController с fetch, но API Axios делает это более явным и удобным.

```js
// hooks/usePosts.js
import { useState, useEffect } from "react";
import apiClient from "@/lib/api";

const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Создаем токен для отмены
    const cancelTokenSource = axios.CancelToken.source();

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get("/posts", {
          cancelToken: cancelTokenSource.token, // Передаем токен
        });
        setPosts(data);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Запрос отменен:", error.message);
        } else {
          console.error("Ошибка загрузки постов:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    // Функция очистки: отменяет запрос при размонтировании
    return () => {
      cancelTokenSource.cancel(
        "Запрос прерван из-за размонтирования компонента."
      );
    };
  }, []);

  return { posts, loading };
};
```

**Прогресс загрузки**

_Проблема_: нужно показать пользователю прогресс-бар для загрузки больших файлов.

_Решение_: встроенная поддержка отслеживания прогресса от **Axios**.

```js
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post("/upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(percentCompleted); // Обновляем состояние для прогресс-бара
    },
  });
  return data;
};
```

**Интересное** <br>
Для загрузки файлов через `fetch` прогресс нельзя отследить, поэтому используем `XMLHttpRequest` или же `axios`

### Когда можно обойтись без Axios ?

Если проект делает 2-3 простых **GET-запроса** без сложной логики авторизации, не нужно тянуть за собой лишнюю зависимость. Современный `fetch` вполне справится с данной задачей

```js
// Простой запрос без Axios
const res = await fetch("/api/data");

if (res.ok) {
  const data = await res.json();
  // работаем с data
}
```

> **Axios** в Next.js — это мощный инструмент для организации сложных клиентских запросов, но для выполнения простых задач лучше использовать `fetch()`

## ReactQuery

**React Query** (также известный как **TanStack Query**) — это мощная библиотека для управления состоянием данных. Её основная задача — упростить работу с асинхронными запросами к серверу (API) и избавить разработчика от необходимости вручную писать логику загрузки, кеширования, ошибок, обновления данных и т.д.

### Для чего используют?

- **Кеширование данных** — повторные запросы используют кеш по ключу.

- **Легкое обновление данных** — данные обновляются при триггере по ключу (и др.) по всему приложению.

- **Управление состоянием загрузки и ошибок** — isLoading, isError, isFetching.

- **Пагинация и бесконечная прокрутка** — встроенные инструменты для реализации сложных вещей.

- **Меньше кода** — без лишних useState, useEffect и ручного контроля флагов.

### 🔧 Как использовать

> Оборачиваем приложение в QueryClientProvider

```jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

export default function Root() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Данные считаются свежими сразу после запроса
            staleTime: 0,
            // Кэш хранится 5 минут
            cacheTime: 1000 * 60 * 5,
            // Повторять запрос при ошибке 3 раза
            retry: 3,
            // Авто-рефетч при фокусе окна
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
```

Мы кладём `QueryClient` в `useState(() => new QueryClient())`, чтобы создать инстанс один раз на монтирование компонента и не пересоздавать его при каждом ререндере. Иначе кэш запросов будет сбрасываться, запросы переинициализируются, а `invalidateQueries` и другие эффекты потеряют контекст. Допустима альтернатива через `useRef`, но суть та же — стабильный инстанс.

> Делаем запрос с помощью useQuery

```jsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function Users() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users"], // ключ для кеша
    queryFn: async () => {
      const res = await axios.get("/api/users");
      return res.data;
    },
  });

  if (isLoading) return <p>Загрузка...</p>;
  if (isError) return <p>Ошибка!</p>;

  return (
    <ul>
      {data.map((user: any) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

> Мутации (useMutation) для POST/PATCH/PUT/DELETE запросов

```jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function AddUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newUser) =>
      fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      }),
    onSuccess: async () => {
      queryClient.invalidateQueries(["users"]);

      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      // 2 способ продления isPending
      return queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });

  return (
    <button onClick={() => mutation.mutate({ name: "Новый пользователь" })}>
      Добавить
    </button>
  );
}
```

### Когда можно использовать React Query?

1. Много взаимодействия с API

- Eсли в проекте много компонентов, где постоянно нужно подгружать, обновлять и синхронизировать данные.

- Например: админ-панели, CRM, дашборды, интернет-магазины.

2. Данные часто меняются

- Нужно обновлять список после добавления/удаления элемента.

- Нужно показывать актуальные данные при возвращении на вкладку (автоматический `refetchOnWindowFocus`).

3. Сложная работа с асинхронными операциями

- Кеширование, фоновые обновления, отмена запросов, повтор при ошибке (`retry`).

- Пагинация или бесконечная прокрутка (`infinite scroll`).

### Итог

- `React Query` нужен, когда у тебя приложение с живыми данными, большим количеством API-запросов и необходимостью синхронизации/кеширования.

- `Axios/fetch` хватит, если приложение простое, данные почти не меняются или проект маленький.

## Стандарты реализации авторизации

### Основы

#### Аутентификация (Authentication)

> 👉 Проверка кто пользователь.

1. Пользователь вводит логин/пароль → сервер проверяет.

2. Может быть через email+пароль, соцсети, OAuth (Google, GitHub).

#### Авторизация (Authorization)

> 👉 Проверка что пользователь может делать.

1. Какие ресурсы доступны (например, админ видит больше, чем обычный юзер).

2. Основана на ролях (RBAC) или правах (ACL).

#### Сессия / Токены

1. После входа сервер выдаёт "ключ" (сессию или JWT).

2. Этот ключ подтверждает, что пользователь вошёл.

#### Access Token

1. Краткоживущий (5–15 мин).

2. Используется в каждом запросе (Authorization: Bearer ...).

#### Refresh Token

1. Долго живёт (дни/недели).

2. Хранится в `httpOnly cookie`.

3. Нужен, чтобы обновлять `access token`, когда он протух.

#### Процесс входа (flow)

1. Пользователь → логин (email/пароль).

2. Сервер проверяет данные → выдаёт access `token` + `refresh token`.

3. Клиент хранит:

- `access` в памяти или `localStorage`,

- `refresh` в `httpOnly cookie`.

4. Все запросы к API → с `access token`.

5. Если `access` истёк → клиент обновляет его через `refresh`.

6. Если и `refresh` истёк → нужна повторная аутентификация (логин).

### Как всё работает вместе

1. Пользователь логинится → сервер отдаёт `access_token` и `refresh_token`.

- `access_token` → кладём в `localStorage` (или в память).

- `refresh_token` → сервер кладёт в `httpOnly cookie`.

2. Все запросы к API → `axios` автоматически подставляет access_token в заголовки.

3. Если `access_token` просрочен (ответ 401) → `axios interceptor` вызывает `/auth/refresh,` получает новый `access_token`, сохраняет его и повторяет запрос.

4. Если и refresh не сработал → пользователь перенаправляется на /login.

5. Next.js middleware → защищает приватные страницы и не даёт попасть на них без токена

### Middleware для защиты маршрутов в Next.js

В Next.js (13+ с App Router) можно использовать middleware.ts для проверки токена перед загрузкой страницы.

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;

  // Если токена нет — редиректим на login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Проверяем валидность токена (лучше на сервере)
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Определяем, на какие роуты действует
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
```

> 👉 Таким образом, защищаем приватные страницы (/dashboard, /profile и т.п.).

### Axios instance + interceptors

Создадим общий клиент API, который автоматически:

- добавляет `access_token` в заголовки,

- обновляет его при ошибке `401 Unauthorized`.

```ts
// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // чтобы cookie отправлялись вместе с запросом
});

// Добавляем access_token в каждый запрос
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка ошибок и обновление токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если access_token истёк → пробуем обновить
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("access_token", newAccessToken);

        // Повторяем оригинальный запрос
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Если refresh тоже не сработал → логаут
        localStorage.removeItem("access_token");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Регистрация / Логин

Компоненты для входа и регистрации шлют запросы на API.

После успешного логина:

- `access_token` кладём в `localStorage`,

- `refresh_token` сервер отдает в `httpOnly cookie`.

```tsx
// app/login/page.tsx
"use client";

import { useState } from "react";
import api from "@/lib/axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      const res = await api.post("/auth/login", { email, password });

      // Сервер отдаёт access_token
      localStorage.setItem("access_token", res.data.accessToken);

      // refresh_token сервер кладёт в httpOnly cookie
      window.location.href = "/dashboard";
    } catch (e) {
      console.error("Ошибка авторизации", e);
    }
  }

  return (
    <div>
      <h1>Вход</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Войти</button>
    </div>
  );
}
```
