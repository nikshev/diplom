# Finance Service

Мікросервіс для управління фінансами в системі управління бізнес-діяльністю підприємства. Цей сервіс надає API для управління фінансовими транзакціями, категоріями транзакцій, рахунками та рахунками-фактурами.

## Функціональність

- Управління фінансовими транзакціями (створення, оновлення, видалення, пошук)
- Категоризація транзакцій (доходи, витрати)
- Управління рахунками (створення, оновлення, видалення, пошук)
- Переказ коштів між рахунками
- Управління рахунками-фактурами (створення, оновлення, видалення, пошук)
- Формування фінансових звітів
- Аналіз фінансових показників

## Технічний стек

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT для автентифікації
- Winston для логування

## API Endpoints

### Транзакції

- `GET /api/transactions` - Отримати всі транзакції з пагінацією та фільтрацією
- `GET /api/transactions/:id` - Отримати транзакцію за ID
- `POST /api/transactions` - Створити нову транзакцію
- `PUT /api/transactions/:id` - Оновити транзакцію
- `DELETE /api/transactions/:id` - Видалити транзакцію
- `GET /api/transactions/category/:categoryId` - Отримати транзакції за категорією
- `GET /api/transactions/date-range` - Отримати транзакції за діапазоном дат
- `GET /api/transactions/account/:accountId` - Отримати транзакції за рахунком
- `GET /api/transactions/stats` - Отримати статистику транзакцій

### Категорії транзакцій

- `GET /api/transaction-categories` - Отримати всі категорії транзакцій
- `GET /api/transaction-categories/:id` - Отримати категорію за ID
- `POST /api/transaction-categories` - Створити нову категорію
- `PUT /api/transaction-categories/:id` - Оновити категорію
- `DELETE /api/transaction-categories/:id` - Видалити категорію
- `GET /api/transaction-categories/tree` - Отримати дерево категорій
- `GET /api/transaction-categories/stats` - Отримати статистику категорій

### Рахунки

- `GET /api/accounts` - Отримати всі рахунки
- `GET /api/accounts/:id` - Отримати рахунок за ID
- `POST /api/accounts` - Створити новий рахунок
- `PUT /api/accounts/:id` - Оновити рахунок
- `DELETE /api/accounts/:id` - Видалити рахунок
- `GET /api/accounts/:id/balance` - Отримати баланс рахунку
- `GET /api/accounts/:id/transactions` - Отримати транзакції рахунку
- `POST /api/accounts/transfer` - Переказати кошти між рахунками
- `GET /api/accounts/:id/stats` - Отримати статистику рахунку

### Рахунки-фактури (інвойси)

- `GET /api/invoices` - Отримати всі рахунки-фактури з пагінацією та фільтрацією
- `GET /api/invoices/:id` - Отримати рахунок-фактуру за ID
- `POST /api/invoices` - Створити новий рахунок-фактуру
- `PUT /api/invoices/:id` - Оновити рахунок-фактуру
- `DELETE /api/invoices/:id` - Видалити рахунок-фактуру
- `GET /api/invoices/customer/:customerId` - Отримати рахунки-фактури за клієнтом
- `GET /api/invoices/status/:status` - Отримати рахунки-фактури за статусом
- `GET /api/invoices/date-range` - Отримати рахунки-фактури за діапазоном дат
- `PATCH /api/invoices/:id/mark-paid` - Позначити рахунок-фактуру як оплачений
- `PATCH /api/invoices/:id/mark-cancelled` - Позначити рахунок-фактуру як скасований
- `POST /api/invoices/:id/payments` - Додати платіж для рахунку-фактури
- `GET /api/invoices/:id/payments` - Отримати платежі рахунку-фактури
- `GET /api/invoices/:id/pdf` - Згенерувати PDF рахунку-фактури
- `POST /api/invoices/:id/send-email` - Надіслати рахунок-фактуру електронною поштою

## Встановлення та запуск

1. Клонувати репозиторій
2. Встановити залежності: `npm install`
3. Налаштувати змінні середовища в файлі `.env`
4. Запустити сервіс: `npm start`

## Змінні середовища

```
# Сервер
PORT=3003
NODE_ENV=development

# База даних
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_db
DB_USER=postgres
DB_PASSWORD=password
DB_SYNC=true
DB_ALTER=true

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

# Логування
LOG_LEVEL=info
LOG_FILE=logs/finance-service.log

# Зовнішні сервіси
AUTH_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3004
INVENTORY_SERVICE_URL=http://localhost:3002
```

## Розробка

- Запуск в режимі розробки: `npm run dev`
- Запуск тестів: `npm test`
- Lint: `npm run lint`

## Документація API

Повна документація API доступна за адресою `/api-docs` після запуску сервісу.
