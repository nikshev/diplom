# CRM Service

Сервіс управління взаємовідносинами з клієнтами (CRM) для інформаційної системи управління бізнес-діяльністю підприємства.

## Функціональність

Сервіс надає наступні можливості:

- Управління клієнтами (створення, оновлення, видалення, пошук)
- Управління контактами клієнтів
- Відстеження взаємодій з клієнтами (дзвінки, зустрічі, електронні листи тощо)
- Сегментація клієнтів за статусом та типом
- Інтеграція з сервісом замовлень для отримання історії замовлень клієнта

## Архітектура

Сервіс побудований за принципами мікросервісної архітектури та використовує:

- Express.js для API
- Sequelize як ORM для роботи з базою даних PostgreSQL
- JWT для аутентифікації та авторизації
- Winston для логування

## API Endpoints

### Клієнти (Customers)

- `GET /api/customers` - Отримати список клієнтів
- `GET /api/customers/:id` - Отримати клієнта за ID
- `POST /api/customers` - Створити нового клієнта
- `PUT /api/customers/:id` - Оновити існуючого клієнта
- `DELETE /api/customers/:id` - Видалити клієнта
- `GET /api/customers/search` - Пошук клієнтів
- `GET /api/customers/segments` - Отримати сегменти клієнтів
- `GET /api/customers/:id/orders` - Отримати замовлення клієнта
- `GET /api/customers/:id/statistics` - Отримати статистику по клієнту

### Контакти (Contacts)

- `GET /api/contacts/customer/:customerId` - Отримати контакти клієнта
- `GET /api/contacts/:id` - Отримати контакт за ID
- `POST /api/contacts` - Створити новий контакт
- `PUT /api/contacts/:id` - Оновити існуючий контакт
- `DELETE /api/contacts/:id` - Видалити контакт
- `PUT /api/contacts/:id/primary` - Встановити контакт як основний
- `GET /api/contacts/search` - Пошук контактів

### Взаємодії (Interactions)

- `GET /api/interactions/customer/:customerId` - Отримати взаємодії з клієнтом
- `GET /api/interactions/:id` - Отримати взаємодію за ID
- `POST /api/interactions` - Створити нову взаємодію
- `PUT /api/interactions/:id` - Оновити існуючу взаємодію
- `DELETE /api/interactions/:id` - Видалити взаємодію
- `GET /api/interactions/date-range` - Отримати взаємодії за діапазоном дат
- `GET /api/interactions/statistics` - Отримати статистику взаємодій
- `GET /api/interactions/search` - Пошук взаємодій

## Запуск сервісу

### Передумови

- Node.js 14+
- PostgreSQL 12+

### Налаштування

1. Клонуйте репозиторій
2. Встановіть залежності: `npm install`
3. Створіть файл `.env` на основі `.env.example` та налаштуйте змінні середовища
4. Запустіть міграції: `npm run db:migrate`

### Запуск

- Розробка: `npm run dev`
- Виробництво: `npm start`

## Інтеграції

Сервіс інтегрується з:

- Auth Service - для аутентифікації та авторизації
- Order Service - для отримання інформації про замовлення клієнтів
