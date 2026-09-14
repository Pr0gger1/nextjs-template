# Авторизация и Аутентификация

**Аутентификация** - проверка подлинности / данных пользователя. Отвечает на вопрос `кто вы?` <br>
**Авторизация** - проверка доступов пользователя. Отвечает на вопрос `имеете ли вы доступ?` <br>

Есть множество вариантов реализации авторизации, но частый из них - это JWT токены.

## JWT авторизация

1. Аутентификация.
2. В удачном случае сервер генерирует токены. В один из них "зашивает" данные для идентификации пользователя
3. Сохраняется токен на стороне клиента и посылает его при каждом запросе с помощью заголовка `Authorization` с шаблоном `Bearer ${token}`
4. Сервер проверяет токен. При удачной проверке - доступ разрешен
5. Когда пользователь выходит из системы, токен удаляется с клиента

### Особенности

1. Нет состояния на сервере - токен хранится на стороне клиента
2. Генерируются обычно две пары токенов Access и Refresh:

- Access - токен имеет малое время жизни 15-30 минут. Обеспечивает доступ к ресурсам после проверки подлинности
- Refresh токен живет примерно 30-60 дней. Нужен, что бы получить новый access токен

### Операции с пользователем

#### Базовые операции

##### Register

Процесс создания новой учётной записи и первичной аутентификации пользователя (опционально).

1. Пользователь открывает форму регистрации и вводит необходимые данные (эл. почта, пароль, возможно имя)
2. Отправляется запрос на сервер для создания учётной записи
3. Сервер сохраняет данные

Если есть первичная аутентификация, тогда продолжаем с процесса аутентификации, начиная с 3 шага.
Если нет - отображаем пользователю форму аутентификации

##### Login (аутентификация)

Процесс проверки учётных данных и установления текущей сессии, дающий пользователю доступ к защищённым ресурсам.

1. Пользователь открывает форму входа и вводит идентификатор (эл. почта/логин) и пароль
2. Отправляется запрос на сервер
3. При успешной проверке сервер формирует access и refresh токены
4. Вернутся токены в виде:

- Access в ответе (например, в теле JSON)
- Refresh в HttpOnly Secure cookie

5. Клиент сохраняет access токен в удобном для него месте
6. Refresh токен сохраняется автоматически
7. Отображаем контент к которому нужен был доступ

##### Logout

Процесс завершения текущей пользовательской сессии.

1. Пользователь инициирует действие выхода (например, нажимает кнопку Logout)
2. Отправляется запрос на сервер для отзыва refresh токена
3. Сервер удаляет refresh токен с клиента
4. Клиент очищает access токен
5. Закрытие доступа к контенту

#### Дополнительные операции

##### Confirm registration

Процесс активации нового аккаунта после регистрации.

1. Инициализация сразу после регистрации или по нажатию кнопки в личном кабинете
2. На почту отправляется письмо с ссылкой в которой зашит специальный токен (не JWT) (в query параметрах)
3. После перехода по ссылке получаем на странице токен
4. После получения токена - отправляем запрос на сервер, в котором токен (в теле JSON или в query параметрах)
5. После успешного запроса - операция считается завершенной.

##### Reset password

Процесс восстановления доступа при утерянном или скомпрометированном пароле.

1. Пользователь открывает форму восстановления и вводит e-mail
2. Отправляется запрос на сервер для генерации ссылки или кода подтверждения
3. Сервер отправляет письмо с уникальной ссылкой (или кодом)
4. Пользователь переходит по ссылке и попадает на страницу сброса пароля
5. Вводится новый пароль и подтверждается
6. Отправляется запрос на сервер для обновления пароля
7. После успешного сброса сервер может вернуть access и refresh токены

### Endpoints

#### Базовые

`/auth/*` - базовые URL <br>

`/login` | `/sign-in` - аутентификация <br>
`/register` | `/sign-up` - регистрация <br>
`/logout` | `/sign-out` - завершение пользовательской сессии <br>

`/refresh` - обновление access токена (при наличии refresh токена) <br>
`/me` - получение данных пользователя (опционально) <br>

#### Дополнительные

`/sign-up-confirm` - подтверждение учетной записи <br>
`/reset-password` - сброс пароля <br>

### Способы хранения токенов

#### Первый способ

- Access токен -> localStorage
- Refresh токен -> cookies HTTP Secure Only

| Плюсы (+)                                                                                                                                                                                                                                                                                                                                                                                             | Минусы (-)                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Отправка в заголовке Authorization: Access-токены передаются клиентом в заголовке Authorization с использованием схемы Bearer. Это позволяет избирательно применять токен только к определённым запросам, что минимизирует риски CSRF-атак.                                                                                                                                                           | Access токен подвержен к XSS атаке                                          |
| Отсутствие автоматической отправки: В отличие от куки, токен не отправляется автоматически при каждом запросе. Это означает, что при попытке CSRF-атаки злоумышленник не сможет выполнить действия от имени пользователя, поскольку для этого требуется токен, который хранится в localStorage. Если же атакующий скомпрометирует refresh-токен, он не сможет прочитать ответ благодаря политике CORS | Refresh токен подвержен CSRF атаке, так как отправляется при каждом запросе |

#### Второй способ

- Access токен -> cookies
- Refresh токен -> cookies

| Плюсы (+)                                                                        | Минусы (-)                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Предоставляет возможность безопасного доступа к access-токену на сервере         | Отсутствует разделение рисков между токенами, что может повышать уязвимость системы к атакам                                                                                                                                                                                |
| Бэкенд имеет возможность получать access-токен для выполнения серверных операций | При хранении access-токена в куки без флага HttpOnly браузер автоматически отправляет его с каждым запросом, что делает токен уязвимым к CSRF-атакам. В таком случае злоумышленник может выполнять действия от имени пользователя, используя автоматически включённый токен |

> **Предупреждение** <br>
> Браузер автоматически отправляет куки, связанные с доменом, в каждом запросе к этому домену. Это означает, что если пользователь авторизован на сайте, например, `bank.com`, и затем посещает вредоносный сайт, например, `evil.com`, браузер будет автоматически отправлять куки, связанные с `bank.com`, при обращении к этому домену. Злоумышленник может воспользоваться этим, инициируя запросы от имени пользователя, используя его авторизацию на `bank.com`. Это ключевая особенность, которая лежит в основе механизма `CSRF-атак`.

#### Третий способ: NextAuth + JWE <br>

Этот способ похож на второй, но с добавлением **NextAuth**.

NextAuth выступает прослойкой между клиентом и backend на стороне сервера, обеспечивая безопасное управление сессиями.

##### Как это работает

1. Внутри функции аутентификации NextAuth вызывается наша собственная логика авторизации.
2. Получаем `access` и `refresh` токены от backend.
3. `Refresh` токен не трогаем — он остаётся на сервере.
4. `Access` токен шифруется в **JWE** и отправляется клиенту.

> **Интересное**
> Что такое `JWE`? <br>
> JWE (JSON Web Encryption) — это формат для **безопасного шифрования данных** в JWT-подобной структуре.

Отличия от обычного JWT (JWS):

- JWT обычно **подписан**, но открыт для чтения.
- JWE **шифрует** данные, поэтому клиент не может их прочитать без ключа.

  **Ключ шифрования**: `AUTH_SECRET`, хранится на сервере в `.env`.
  Клиент получает только зашифрованный токен и не имеет возможности его расшифровать. Даже при компрометации токена злоумышленник не сможет извлечь данные без `AUTH_SECRET`.

##### Обновление токена

Обновление access-токена происходит через callback `jwt`, который срабатывает при:

- входе пользователя через логин
- запросе сессии
- обновлении сессии (ручной)

Внутри callback можно реализовать логику продления токена с использованием refresh-токена.

##### Получение данных сессии

- **На сервере:** функция `auth()` возвращает текущую сессию, расшифровывая JWE.
- **На клиенте:** хук `useSession()` обращается к API NextAuth и получает готовую сессию без ручного декодирования токена.

##### Преимущества

1. Токен невозможно дешифровать или прочитать на клиенте.
2. Клиент работает с безопасной сессией, следуя лучшим практикам (`/auth/me`), без ручной обработки токенов.

## Пример

Посмотрим на одну из реализаций JWT авторизации. <br>
Будем использовать _2 способ_ хранения токена - что бы иметь возможность получить его на сервере.

### На стороне сервера

В качестве первого уровня защиты используется `middleware.ts` в Next.js.
Преимущество этого подхода заключается в том, что он выполняется на сервере, что позволяет осуществлять _ранний редирект_ и направлять пользователя на нужную страницу до того, как страница будет полностью загружена.

> **Предупреждение** <br>
> Использование `middleware` как единственного средства авторизации **не рекомендуется**, в прошлом уже фиксировались реальные уязвимости.
> Но в качестве первой линии защиты - можно. Обычный пользователь не сможет отключить такую степень защиты

Определяем маршруты, которые не должны / должны быть защищены:

```ts
const publicRoutes = ["/", "/auth/:path*"];
const privateRoutes = ["/add-project", "/project/:path*"];
```

Создаем утилиты для работы с путями:

```ts
const handleRequest = (request: NextRequest) => {
  const checkPathname = (pathname: string) =>
    request.nextUrl.pathname === pathname;

  const startsWith = (pathname: string) =>
    request.nextUrl.pathname.startsWith(pathname);

  const createUrl = (pathname: string) => new URL(pathname, request.url);

  const matchPattern = (route: string) => {
    if (route.endsWith("/:path*")) {
      return startsWith(route.replace("/:path*", ""));
    }
    return checkPathname(route);
  };

  return {
    checkPathname,
    startsWith,
    createUrl,
    matchPattern,
  };
};
```

Создаем наш `middleware`:

```ts
export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;

  const { createUrl, matchPattern } = handleRequest(request);

  const isAuth = !!accessToken;

  if (publicRoutes.some((route) => matchPattern(route))) {
    if (isAuth) {
      return NextResponse.redirect(createUrl("/project"));
    }

    return NextResponse.next();
  }

  if (privateRoutes.some((route) => matchPattern(route))) {
    if (!isAuth) {
      return NextResponse.redirect(createUrl("/auth/login"));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}
```

Определяем **статично** маршруты, которые будет обрабатывать `middleware`:

```ts
export const config: MiddlewareConfig = {
  matcher: ["/", "/auth/:path*", "/add-project", "/project/:path*"],
};
```

### Настройка HTTP-клиента

> Базовую настройку `apiClient` можно взять из `api.md`

Первый `Interceptor` будет настроен, для подкрепления токена к запросам, которые мы отправим на сервер:

```ts
export const authInterceptor = async (
  config: InternalAxiosRequestConfig<unknown>
) => {
  // Кастомное поле - нужен ли токен для запроса (необязательно)
  if (!config.withToken) {
    return config;
  }

  // Получение из cookies / localStorage
  const token = getToken();

  // Подключаем токен к заголовку авторизации
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Многие серверные фреймворки проверяют этот заголовок - пришел ли запрос через AJAX или напрямую через браузер
  if (config.headers) {
    config.headers["X-Requested-With"] = "XMLHttpRequest";
  }

  return config;
};
```

Второй `Interceptor` будет настроен на ответ сервера, под обновление access токена:

```ts
export const refreshInterceptor = async (error: AxiosError) => {
  const originalRequest = error.config;

  // Если запросу не нужен токен - значит пропускаем ошибку дальше
  if (!originalRequest?.withToken) {
    return Promise.reject(error);
  }

  // проверяем статус - смогли ли мы успешно отправить запрос
  if (
    error.response?.status === 403 &&
    originalRequest &&
    !originalRequest?._retry
  ) {
    // Кастомное поле - проверяет - была ли повторная отправка уже
    originalRequest._retry = true;

    // Пробуем сделать запрос и обновить токен
    try {
      const response = await authApi.refresh();

      const newAccessToken = response.data.token;

      saveToken(newAccessToken);

      await queryClient.invalidateQueries({
        queryKey: [AUTH_QUERY_KEYS.CURRENT_USER],
      });

      return api.request(originalRequest);
    } catch (error) {
      const refreshError = error as AxiosError;

      // Если сервер отвечает - что refresh токе не валидный
      if (
        refreshError.response?.status === 400 ||
        refreshError.response?.status === 403 ||
        refreshError.response?.status === 401
      ) {
        // Очищаем access токен
        removeToken();

        // Инвалидируем пользователя
        await queryClient.invalidateQueries({
          queryKey: [AUTH_QUERY_KEYS.CURRENT_USER],
        });

        // Перенаправляем на страницу аутентификации
        window.location.replace(PAGE_CONFIG.login);

        return Promise.reject(refreshError);
      }

      console.error("Error when updating token: ", refreshError);
    }
  }

  console.error(
    "Axios network error intercepted in Interceptor:",
    error.response?.data || error.message
  );

  // Если ошибка не относится к токенам - просто пропускаем её дальше
  return Promise.reject(error);
};
```

Так же можно добавить еще один `Interceptor`. Он будет отвечать за обработку ошибок от сервера. <br>
Это может пригодится, если например используются `webhooks` и нужно привести ответ к ошибке.

```ts
export const errorInterceptor = (response: AxiosResponse) => {
  const responseData = response.data;

  // Приходит body с ответом
  if (responseData && responseData.success === false) {
    const errorMessage = responseData.message || "Unknown error";

    const error = new Error(errorMessage);

    console.error(
      "The request was not successful, but the server returned the status of 200: ",
      responseData
    );

    // И мы выбрасываем ошибку
    return Promise.reject(error);
  }

  // Если успешный ответ - просто пробрасываем дальше
  return response;
};
```

В итоге должно получится:

```ts
api.interceptors.request.use(authInterceptor, (e) => Promise.reject(e));
api.interceptors.response.use(errorInterceptor, refreshInterceptor);
```

### Сессия пользователя

Тут в реализации у нас есть 2 пути:

- API endpoint

Есть endpoint, например `/auth/me`, к которому мы отправляем запрос и можем получить:

- сессию пользователя
- обновить access токен
- либо узнать - валиден ли наш пользователь на данный момент

- jwtDecoder

Способ заключается в дешифрации access токена.

1. Мы устанавливаем библиотеку `jwt-decode`
2. Достаем из cookies / local Storage наш токен
3. Декодируем токен и получаем наши данные

```ts
import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  name?: string;
  email?: string;
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    return decoded;
  } catch (error: unknown) {
    return null;
  }
};
```

```ts
export const extractUserFromToken = () => {
  const token = getToken();

  if (!token) return null;

  const decodedToken = decodeJwt(token);

  if (!decodedToken) return null;

  return {
    id: String(decodedToken.sub || decodedToken.id || "default-id"),
    name: String(decodedToken.name || "User"),
    email: String(decodedToken.email || "no-email@example.com"),
  };
};
```

И можно реализовать кастомный хук, например `useSession`:

```ts
export const useSession = () => {
  return useQuery({
    queryKey: [AUTH_QUERY_KEYS.CURRENT_USER],
    queryFn: extractUserFromToken,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
```

Альтернатива именно для этого хука без `React Query`:

```ts
type UseSessionResult = {
  data: Session | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

export const useSessionWithoutRQ = (): UseSessionResult => {
  const [data, setData] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const refetch = useCallback(() => {
    try {
      setIsLoading(true);
      setIsError(false);
      const user = extractUserFromToken();
      setData(user as Session | null);
    } catch {
      setIsError(true);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const onFocus = () => refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetch]);

  return { data, isLoading, isError, refetch };
};
```

Благодаря `react query` можно легко инвалидировать пользователя по всему сайту и в любой момент. Даже в `Interceptor` в `axios`.

Можно сделать `AuthProvider` для запуска хука, во время запуска приложения

```tsx
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: session, isLoading } = useSession();

  const value: AuthContextType = {
    session: session as Session | null,

    // Другие операции
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```
