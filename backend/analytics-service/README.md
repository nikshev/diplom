# Analytics Service

Мікросервіс аналітики та KPI для Інформаційної системи управління бізнес-діяльністю підприємства.

## Опис

Аналітичний сервіс відповідає за збір, аналіз та візуалізацію ключових показників ефективності (KPI) бізнесу. Він забезпечує інструменти для моніторингу продуктивності, аналізу тенденцій та формування звітів.

## Функціональність

- **Метрики**: Збір та аналіз різних бізнес-метрик з різних джерел даних
- **KPI**: Розрахунок та відстеження ключових показників ефективності
- **Дашборди**: Створення та налаштування інтерактивних дашбордів
- **Звіти**: Генерація та планування звітів у різних форматах (PDF, Excel, CSV)
- **Аналітика**: Аналіз даних з різних бізнес-напрямків (продажі, фінанси, інвентар, клієнти)

## Технічний стек

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT для автентифікації
- Swagger для документації API
- PDFKit, ExcelJS, csv-writer для генерації звітів

## API Endpoints

### Метрики
- `GET /api/metrics` - Отримати список метрик
- `GET /api/metrics/:id` - Отримати метрику за ID
- `POST /api/metrics` - Створити нову метрику
- `PUT /api/metrics/:id` - Оновити метрику
- `DELETE /api/metrics/:id` - Видалити метрику
- `GET /api/metrics/:id/data` - Отримати дані метрики

### KPI
- `GET /api/kpis` - Отримати список KPI
- `GET /api/kpis/:id` - Отримати KPI за ID
- `POST /api/kpis` - Створити новий KPI
- `PUT /api/kpis/:id` - Оновити KPI
- `DELETE /api/kpis/:id` - Видалити KPI
- `GET /api/kpis/scorecard` - Отримати KPI скоркарту
- `GET /api/kpis/:id/trend` - Отримати тренд KPI

### Дашборди
- `GET /api/dashboards` - Отримати список дашбордів
- `GET /api/dashboards/:id` - Отримати дашборд за ID
- `POST /api/dashboards` - Створити новий дашборд
- `PUT /api/dashboards/:id` - Оновити дашборд
- `DELETE /api/dashboards/:id` - Видалити дашборд
- `GET /api/dashboards/:id/widgets` - Отримати віджети дашборду
- `POST /api/dashboards/:id/widgets` - Додати віджет до дашборду
- `PUT /api/dashboards/:id/widgets/:widgetId` - Оновити віджет
- `DELETE /api/dashboards/:id/widgets/:widgetId` - Видалити віджет

### Звіти
- `GET /api/reports` - Отримати список звітів
- `GET /api/reports/:id` - Отримати звіт за ID
- `POST /api/reports` - Створити новий звіт
- `PUT /api/reports/:id` - Оновити звіт
- `DELETE /api/reports/:id` - Видалити звіт
- `POST /api/reports/:id/generate` - Згенерувати звіт
- `GET /api/reports/:id/executions/:executionId/download` - Завантажити файл звіту

### Аналітика
- `GET /api/analytics/overview` - Отримати загальний огляд бізнесу
- `GET /api/analytics/sales` - Отримати аналітику продажів
- `GET /api/analytics/financial` - Отримати фінансову аналітику
- `GET /api/analytics/inventory` - Отримати аналітику інвентаря
- `GET /api/analytics/customers` - Отримати аналітику клієнтів

## Встановлення та запуск

### Передумови
- Node.js (v14+)
- PostgreSQL
- npm або yarn

### Встановлення
```bash
# Клонувати репозиторій
git clone <repository-url>

# Перейти в директорію проекту
cd analytics-service

# Встановити залежності
npm install

# Налаштувати змінні середовища
cp .env.example .env
# Відредагувати .env файл з вашими налаштуваннями
```

### Запуск
```bash
# Запуск в режимі розробки
npm run dev

# Запуск в продакшн режимі
npm start
```

### Docker
```bash
# Збірка Docker образу
docker build -t analytics-service .

# Запуск контейнера
docker run -p 3004:3004 analytics-service
```

## Тестування
```bash
# Запуск тестів
npm test

# Запуск лінтера
npm run lint
```

## Документація API

Після запуску сервісу, документація API доступна за адресою:
```
http://localhost:3004/api-docs
```
