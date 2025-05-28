# Order Service

Сервіс управління замовленнями для інформаційної системи управління бізнес-діяльністю підприємства.

## Функціональність

- Створення та управління замовленнями клієнтів
- CRUD операції для замовлень
- Управління статусами замовлень
- Інтеграція з модулем товарних залишків
- Розрахунок вартості замовлення

## Технічний стек

- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT для автентифікації
- Axios для інтеграції з іншими сервісами
- Winston для логування

## Структура проекту

```
order-service/
├── config/             # Конфігурація сервісу
├── controllers/        # Контролери для обробки запитів
├── middlewares/        # Проміжне ПЗ (автентифікація, валідація)
├── migrations/         # Міграції бази даних
├── models/             # Моделі даних
├── routes/             # Маршрути API
├── services/           # Бізнес-логіка
├── utils/              # Утиліти (обробка помилок)
├── index.js            # Точка входу
└── package.json        # Залежності
```

## Встановлення та запуск

### Передумови

- Node.js (v14+)
- PostgreSQL

### Встановлення

1. Клонуйте репозиторій
2. Встановіть залежності:
   ```
   npm install
   ```
3. Створіть файл `.env` на основі `.env.example`:
   ```
   cp .env.example .env
   ```
4. Налаштуйте змінні середовища в `.env`

### Запуск

Запуск у режимі розробки:
```
npm run dev
```

Запуск у продакшн режимі:
```
npm start
```

## API Endpoints

### Замовлення

| Метод   | URL                           | Опис                             | Доступ      |
|---------|-------------------------------|----------------------------------|-------------|
| GET     | /api/orders                   | Отримання всіх замовлень         | Приватний   |
| GET     | /api/orders/:id               | Отримання замовлення за ID       | Приватний   |
| POST    | /api/orders                   | Створення замовлення             | Приватний   |
| PUT     | /api/orders/:id               | Оновлення замовлення             | Приватний   |
| DELETE  | /api/orders/:id               | Видалення замовлення             | Приватний   |
| PATCH   | /api/orders/:id/status        | Зміна статусу замовлення         | Приватний   |
| GET     | /api/orders/:id/total         | Розрахунок вартості замовлення   | Приватний   |

## Моделі даних

### Order (Замовлення)

- id: UUID (первинний ключ)
- order_number: String (унікальний)
- customer_id: UUID (зовнішній ключ до Customer)
- status: Enum ('new', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')
- total_amount: Decimal
- shipping_address: Text
- shipping_city: String
- shipping_postal_code: String
- shipping_country: String
- shipping_method: String
- payment_method: String
- notes: Text
- created_at: Date
- updated_at: Date

### OrderItem (Елемент замовлення)

- id: UUID (первинний ключ)
- order_id: UUID (зовнішній ключ до Order)
- product_id: UUID (зовнішній ключ до Product)
- quantity: Integer
- unit_price: Decimal
- total_price: Decimal
- created_at: Date
- updated_at: Date

### OrderStatusHistory (Історія статусів замовлення)

- id: UUID (первинний ключ)
- order_id: UUID (зовнішній ключ до Order)
- status: Enum ('new', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')
- comment: Text
- user_id: UUID (зовнішній ключ до User)
- created_at: Date

## Інтеграція з іншими сервісами

### Inventory Service

Сервіс управління замовленнями інтегрується з сервісом товарних залишків для:

- Перевірки наявності товарів перед створенням замовлення
- Резервування товарів при створенні замовлення
- Зняття резервування при скасуванні замовлення
- Зменшення кількості товарів при доставці замовлення

### Customer Service

Сервіс управління замовленнями інтегрується з сервісом клієнтів для:

- Отримання інформації про клієнта
- Перевірки можливості створення замовлення клієнтом

## Статуси замовлень

- **new**: Нове замовлення, щойно створене
- **processing**: Замовлення в обробці
- **shipped**: Замовлення відправлене
- **delivered**: Замовлення доставлене
- **cancelled**: Замовлення скасоване
- **returned**: Замовлення повернуте

## Змінні середовища

```
# Сервер
NODE_ENV=development
PORT=3002

# База даних
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_orders
DB_USER=postgres
DB_PASSWORD=postgres
DB_LOGGING=false

# Логування
LOG_LEVEL=info
LOG_FORMAT=combined
LOG_DIR=logs

# Інтеграція з іншими сервісами
INVENTORY_SERVICE_URL=http://localhost:3003
INVENTORY_SERVICE_TIMEOUT=5000
CUSTOMER_SERVICE_URL=http://localhost:3004
CUSTOMER_SERVICE_TIMEOUT=5000

# JWT
JWT_SECRET=your_jwt_secret
```
