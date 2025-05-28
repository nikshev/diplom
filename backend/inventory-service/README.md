# Inventory Service

Мікросервіс для управління інвентаризацією в системі управління бізнес-діяльністю підприємства. Цей сервіс надає API для управління категоріями товарів, товарами, складами, запасами та транзакціями інвентаризації.

## Функціональність

- Управління категоріями товарів (створення, оновлення, видалення, пошук)
- Управління товарами (створення, оновлення, видалення, пошук)
- Управління складами (створення, оновлення, видалення, пошук)
- Управління запасами (створення, оновлення, коригування, переміщення)
- Відстеження транзакцій інвентаризації (надходження, відвантаження, коригування, переміщення)
- Резервування товарів для замовлень
- Аналітика запасів (низький рівень запасів, статистика складів)

## Технічний стек

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT для автентифікації
- Winston для логування

## API Endpoints

### Категорії

- `GET /api/categories` - Отримати всі категорії
- `GET /api/categories/:id` - Отримати категорію за ID
- `POST /api/categories` - Створити нову категорію
- `PUT /api/categories/:id` - Оновити категорію
- `DELETE /api/categories/:id` - Видалити категорію
- `GET /api/categories/tree` - Отримати дерево категорій
- `GET /api/categories/:id/breadcrumbs` - Отримати хлібні крихти для категорії

### Товари

- `GET /api/products` - Отримати всі товари з пагінацією та фільтрацією
- `GET /api/products/:id` - Отримати товар за ID
- `GET /api/products/sku/:sku` - Отримати товар за SKU
- `POST /api/products` - Створити новий товар
- `PUT /api/products/:id` - Оновити товар
- `DELETE /api/products/:id` - Видалити товар
- `PATCH /api/products/:id/price` - Оновити ціну товару
- `PATCH /api/products/:id/status` - Оновити статус товару
- `GET /api/products/search` - Пошук товарів
- `GET /api/products/low-stock` - Отримати товари з низьким рівнем запасів
- `GET /api/products/:id/stock` - Отримати рівні запасів товару

### Склади

- `GET /api/warehouses` - Отримати всі склади
- `GET /api/warehouses/:id` - Отримати склад за ID
- `POST /api/warehouses` - Створити новий склад
- `PUT /api/warehouses/:id` - Оновити склад
- `DELETE /api/warehouses/:id` - Видалити склад
- `GET /api/warehouses/:id/inventory` - Отримати інвентар на складі
- `GET /api/warehouses/:id/stats` - Отримати статистику складу

### Інвентар

- `GET /api/inventory` - Отримати всі елементи інвентарю з пагінацією та фільтрацією
- `GET /api/inventory/:id` - Отримати елемент інвентарю за ID
- `GET /api/inventory/product/:productId/warehouse/:warehouseId` - Отримати інвентар за товаром та складом
- `POST /api/inventory` - Створити новий елемент інвентарю
- `PUT /api/inventory/:id` - Оновити елемент інвентарю
- `PATCH /api/inventory/:id/adjust` - Коригувати кількість інвентарю
- `POST /api/inventory/:id/transfer` - Перемістити інвентар між складами
- `POST /api/inventory/:id/reserve` - Зарезервувати інвентар для замовлення
- `POST /api/inventory/:id/release` - Звільнити зарезервований інвентар
- `POST /api/inventory/:id/fulfill` - Виконати замовлення (перетворити зарезервований на відвантажений)
- `GET /api/inventory/:id/transactions` - Отримати транзакції інвентарю
- `GET /api/inventory/low-stock` - Отримати елементи з низьким рівнем запасів
- `GET /api/inventory/summary` - Отримати зведення інвентарю

### Транзакції інвентаризації

- `GET /api/inventory-transactions` - Отримати всі транзакції з пагінацією та фільтрацією
- `GET /api/inventory-transactions/:id` - Отримати транзакцію за ID
- `POST /api/inventory-transactions` - Створити нову транзакцію
- `GET /api/inventory-transactions/product/:productId` - Отримати транзакції для товару
- `GET /api/inventory-transactions/warehouse/:warehouseId` - Отримати транзакції для складу
- `GET /api/inventory-transactions/inventory/:inventoryId` - Отримати транзакції для елемента інвентарю
- `GET /api/inventory-transactions/type/:type` - Отримати транзакції за типом
- `GET /api/inventory-transactions/date-range` - Отримати транзакції за діапазоном дат
- `GET /api/inventory-transactions/summary` - Отримати зведення транзакцій

## Встановлення та запуск

1. Клонувати репозиторій
2. Встановити залежності: `npm install`
3. Налаштувати змінні середовища в файлі `.env`
4. Запустити сервіс: `npm start`

## Змінні середовища

```
# Сервер
PORT=3002
NODE_ENV=development

# База даних
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_db
DB_USER=postgres
DB_PASSWORD=password
DB_SYNC=true
DB_ALTER=true

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

# Логування
LOG_LEVEL=info
LOG_FILE=logs/inventory-service.log

# Зовнішні сервіси
AUTH_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3003
```

## Розробка

- Запуск в режимі розробки: `npm run dev`
- Запуск тестів: `npm test`
- Lint: `npm run lint`

## Документація API

Повна документація API доступна за адресою `/api-docs` після запуску сервісу.
