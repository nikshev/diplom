# Auth Service

Сервіс автентифікації та авторизації для інформаційної системи управління бізнес-діяльністю підприємства.

## Функціональність

- Автентифікація користувачів (реєстрація, вхід, вихід)
- Управління користувачами (CRUD операції)
- Управління ролями та дозволами
- Контроль доступу на основі ролей (RBAC)
- Захищені маршрути з JWT автентифікацією

## Технічний стек

- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT для автентифікації
- Bcrypt для хешування паролів
- Winston для логування

## Структура проекту

```
auth-service/
├── config/             # Конфігурація сервісу
├── controllers/        # Контролери для обробки запитів
├── middlewares/        # Проміжне ПЗ (автентифікація, валідація)
├── migrations/         # Міграції бази даних
├── models/             # Моделі даних
├── routes/             # Маршрути API
├── services/           # Бізнес-логіка
├── utils/              # Утиліти (JWT, обробка помилок)
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

### Автентифікація

| Метод | URL                            | Опис                             | Доступ      |
|-------|--------------------------------|----------------------------------|-------------|
| POST  | /api/auth/register             | Реєстрація нового користувача    | Публічний   |
| POST  | /api/auth/login                | Вхід користувача                 | Публічний   |
| POST  | /api/auth/refresh-token        | Оновлення токена доступу         | Публічний   |
| POST  | /api/auth/logout               | Вихід користувача                | Публічний   |
| POST  | /api/auth/request-password-reset| Запит на скидання пароля        | Публічний   |
| POST  | /api/auth/reset-password       | Скидання пароля                  | Публічний   |
| GET   | /api/auth/me                   | Отримання профілю користувача    | Приватний   |

### Користувачі

| Метод   | URL                           | Опис                             | Доступ      |
|---------|-------------------------------|----------------------------------|-------------|
| GET     | /api/users                    | Отримання всіх користувачів      | Адмін       |
| GET     | /api/users/:id                | Отримання користувача за ID      | Адмін/Власний|
| POST    | /api/users                    | Створення користувача            | Адмін       |
| PUT     | /api/users/:id                | Оновлення користувача            | Адмін/Власний|
| DELETE  | /api/users/:id                | Видалення користувача            | Адмін       |
| PUT     | /api/users/:id/change-password| Зміна пароля                     | Адмін/Власний|
| GET     | /api/users/:id/permissions    | Отримання дозволів користувача   | Адмін/Власний|

### Ролі

| Метод   | URL                           | Опис                             | Доступ      |
|---------|-------------------------------|----------------------------------|-------------|
| GET     | /api/roles                    | Отримання всіх ролей             | Адмін       |
| GET     | /api/roles/:id                | Отримання ролі за ID             | Адмін       |
| POST    | /api/roles                    | Створення ролі                   | Адмін       |
| PUT     | /api/roles/:id                | Оновлення ролі                   | Адмін       |
| DELETE  | /api/roles/:id                | Видалення ролі                   | Адмін       |
| POST    | /api/roles/:id/permissions    | Призначення дозволів ролі        | Адмін       |

### Дозволи

| Метод   | URL                           | Опис                             | Доступ      |
|---------|-------------------------------|----------------------------------|-------------|
| GET     | /api/permissions              | Отримання всіх дозволів          | Адмін       |
| GET     | /api/permissions/:id          | Отримання дозволу за ID          | Адмін       |
| POST    | /api/permissions              | Створення дозволу                | Адмін       |
| PUT     | /api/permissions/:id          | Оновлення дозволу                | Адмін       |
| DELETE  | /api/permissions/:id          | Видалення дозволу                | Адмін       |
| GET     | /api/permissions/resources    | Отримання унікальних ресурсів    | Адмін       |
| GET     | /api/permissions/actions      | Отримання унікальних дій         | Адмін       |

## Моделі даних

### User (Користувач)

- id: UUID (первинний ключ)
- email: String (унікальний)
- password: String (хешований)
- firstName: String
- lastName: String
- phone: String (опціонально)
- role: String (зовнішній ключ до Role)
- isActive: Boolean
- createdAt: Date
- updatedAt: Date

### Role (Роль)

- id: UUID (первинний ключ)
- name: String (унікальний)
- description: String (опціонально)
- createdAt: Date
- updatedAt: Date

### Permission (Дозвіл)

- id: UUID (первинний ключ)
- name: String (унікальний)
- description: String (опціонально)
- resource: String
- action: String
- createdAt: Date
- updatedAt: Date

### RolePermission (Зв'язок ролі та дозволу)

- roleId: UUID (зовнішній ключ до Role)
- permissionId: UUID (зовнішній ключ до Permission)
- createdAt: Date
- updatedAt: Date

### RefreshToken (Токен оновлення)

- id: UUID (первинний ключ)
- userId: UUID (зовнішній ключ до User)
- token: String
- expiresAt: Date
- createdAt: Date
- updatedAt: Date

## Безпека

- Паролі хешуються за допомогою bcrypt
- Автентифікація за допомогою JWT
- Контроль доступу на основі ролей (RBAC)
- Захист від XSS та CSRF атак
- Валідація вхідних даних

## Змінні середовища

```
# Сервер
NODE_ENV=development
PORT=3001

# База даних
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_auth
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
JWT_RESET_EXPIRATION=1h

# Логування
LOG_LEVEL=info
LOG_FORMAT=combined

# Адміністратор за замовчуванням
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=adminpassword
```
