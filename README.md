# input_send

Простой сайт с формой обратной связи и административной панелью на Node.js + Express.

## Локальный запуск

```bash
cd "/Users/ellakovalova/Desktop/моя попытка"
npm install
npm start
```

Откройте в браузере:

```bash
http://localhost:3000
```

## Почему GitHub Pages не работает

Проект использует серверную часть `server.js` для обработки запросов `/api/contact`, `/api/admin/login` и `/api/admin/export/xlsx`.
GitHub Pages поддерживает только статические сайты, поэтому серверная логика там не выполняется.

## Рекомендуемый способ деплоя

1. Создайте репозиторий на GitHub и запушьте проект.
2. Подключите репозиторий к Render.com.
3. Render автоматически запустит сборку и начнёт хостинг Node.js сервера.

### Настройки Render

- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: `/`

## Команды Git

```bash
git add .
git commit -m "Deploy-ready setup"
git push
```
