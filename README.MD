![](https://img.shields.io/badge/next-16.1.6-yellowgreen?logo=nextdotjs)
![](https://img.shields.io/badge/pnpm-10.25.0-yellowgreen?logo=pnpm)
![](https://img.shields.io/badge/react-19.2.10-red?logo=react)

## Разворачивание проекта

Создаем файл с переменными окружения из файла-примера

```
cp .env.example .env
```

При первоначальном запуске проекта потребуется на локальной машине создать две docker-сети.

```
docker network create proxy-network
docker network create applications-network
```

Запускаем установку приложения

```
make install
```

Запускаем процесс сборки приложения

```
make build
```

Запускаем окружение

```
make up
```
