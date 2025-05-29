# Auth Service API

## Огляд

Auth Service відповідає за управління користувачами, ролями, дозволами та автентифікацією в системі. Цей сервіс забезпечує безпечний доступ до ресурсів системи та контроль прав доступу.

## Базовий URL

```
https://api.example.com/api/v1/auth
```

## Ендпоінти

### Автентифікація

#### Реєстрація нового користувача

```
POST /register
```

**Тіло запиту:**

```json
{
  "name": "Іван Петренко",
  "email": "ivan@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Іван Петренко",
      "email": "ivan@example.com",
      "createdAt": "2025-05-29T07:05:17.000Z",
      "updatedAt": "2025-05-29T07:05:17.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Вхід користувача

```
POST /login
```

**Тіло запиту:**

```json
{
  "email": "ivan@example.com",
  "password": "securePassword123"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Іван Петренко",
      "email": "ivan@example.com",
      "role": "user",
      "createdAt": "2025-05-29T07:05:17.000Z",
      "updatedAt": "2025-05-29T07:05:17.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Вихід користувача

```
POST /logout
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "message": "Успішний вихід з системи"
  }
}
```

#### Оновлення токену

```
POST /refresh-token
```

**Тіло запиту:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Запит на відновлення паролю

```
POST /forgot-password
```

**Тіло запиту:**

```json
{
  "email": "ivan@example.com"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "message": "Інструкції з відновлення паролю відправлені на вашу електронну пошту"
  }
}
```

#### Відновлення паролю

```
POST /reset-password
```

**Тіло запиту:**

```json
{
  "token": "reset-token-from-email",
  "password": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "message": "Пароль успішно змінено"
  }
}
```

### Управління користувачами

#### Отримання інформації про поточного користувача

```
GET /me
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Іван Петренко",
      "email": "ivan@example.com",
      "role": "user",
      "permissions": [
        "orders:read",
        "orders:create",
        "customers:read"
      ],
      "createdAt": "2025-05-29T07:05:17.000Z",
      "updatedAt": "2025-05-29T07:05:17.000Z"
    }
  }
}
```

#### Оновлення інформації про поточного користувача

```
PUT /me
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "name": "Іван Іванович Петренко",
  "email": "ivan.new@example.com"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Іван Іванович Петренко",
      "email": "ivan.new@example.com",
      "role": "user",
      "createdAt": "2025-05-29T07:05:17.000Z",
      "updatedAt": "2025-05-29T07:10:22.000Z"
    }
  }
}
```

#### Зміна паролю поточного користувача

```
PUT /me/password
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "currentPassword": "securePassword123",
  "newPassword": "evenMoreSecurePassword456",
  "confirmPassword": "evenMoreSecurePassword456"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "message": "Пароль успішно змінено"
  }
}
```

### Адміністрування користувачів

#### Отримання списку користувачів (тільки для адміністраторів)

```
GET /users
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Параметри запиту:**

```
page=1
limit=10
search=петренко
sort=createdAt,-name
```

**Відповідь:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Іван Петренко",
      "email": "ivan@example.com",
      "role": "user",
      "createdAt": "2025-05-29T07:05:17.000Z",
      "updatedAt": "2025-05-29T07:05:17.000Z"
    },
    // Інші користувачі...
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "pages": 5
    }
  }
}
```

#### Отримання інформації про користувача (тільки для адміністраторів)

```
GET /users/:id
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Іван Петренко",
      "email": "ivan@example.com",
      "role": "user",
      "permissions": [
        "orders:read",
        "orders:create",
        "customers:read"
      ],
      "createdAt": "2025-05-29T07:05:17.000Z",
      "updatedAt": "2025-05-29T07:05:17.000Z"
    }
  }
}
```

#### Створення нового користувача (тільки для адміністраторів)

```
POST /users
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "name": "Марія Коваленко",
  "email": "maria@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "role": "manager"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Марія Коваленко",
      "email": "maria@example.com",
      "role": "manager",
      "createdAt": "2025-05-29T07:15:30.000Z",
      "updatedAt": "2025-05-29T07:15:30.000Z"
    }
  }
}
```

#### Оновлення користувача (тільки для адміністраторів)

```
PUT /users/:id
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "name": "Марія Іванівна Коваленко",
  "email": "maria.new@example.com",
  "role": "admin"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Марія Іванівна Коваленко",
      "email": "maria.new@example.com",
      "role": "admin",
      "createdAt": "2025-05-29T07:15:30.000Z",
      "updatedAt": "2025-05-29T07:20:45.000Z"
    }
  }
}
```

#### Видалення користувача (тільки для адміністраторів)

```
DELETE /users/:id
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "message": "Користувача успішно видалено"
  }
}
```

### Управління ролями

#### Отримання списку ролей (тільки для адміністраторів)

```
GET /roles
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Відповідь:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "admin",
      "description": "Адміністратор системи",
      "createdAt": "2025-05-29T07:00:00.000Z",
      "updatedAt": "2025-05-29T07:00:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "manager",
      "description": "Менеджер",
      "createdAt": "2025-05-29T07:00:00.000Z",
      "updatedAt": "2025-05-29T07:00:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "name": "user",
      "description": "Звичайний користувач",
      "createdAt": "2025-05-29T07:00:00.000Z",
      "updatedAt": "2025-05-29T07:00:00.000Z"
    }
  ]
}
```

#### Отримання інформації про роль (тільки для адміністраторів)

```
GET /roles/:id
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "role": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "admin",
      "description": "Адміністратор системи",
      "permissions": [
        "users:read",
        "users:create",
        "users:update",
        "users:delete",
        "roles:read",
        "roles:create",
        "roles:update",
        "roles:delete",
        "permissions:read",
        "permissions:create",
        "permissions:update",
        "permissions:delete",
        "orders:read",
        "orders:create",
        "orders:update",
        "orders:delete",
        "customers:read",
        "customers:create",
        "customers:update",
        "customers:delete",
        "products:read",
        "products:create",
        "products:update",
        "products:delete",
        "inventory:read",
        "inventory:create",
        "inventory:update",
        "inventory:delete",
        "finance:read",
        "finance:create",
        "finance:update",
        "finance:delete",
        "analytics:read",
        "analytics:create",
        "analytics:update",
        "analytics:delete",
        "integration:read",
        "integration:create",
        "integration:update",
        "integration:delete"
      ],
      "createdAt": "2025-05-29T07:00:00.000Z",
      "updatedAt": "2025-05-29T07:00:00.000Z"
    }
  }
}
```

#### Створення нової ролі (тільки для адміністраторів)

```
POST /roles
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "name": "sales",
  "description": "Менеджер з продажу",
  "permissions": [
    "orders:read",
    "orders:create",
    "orders:update",
    "customers:read",
    "customers:create",
    "customers:update",
    "products:read",
    "inventory:read"
  ]
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "role": {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "name": "sales",
      "description": "Менеджер з продажу",
      "createdAt": "2025-05-29T07:25:10.000Z",
      "updatedAt": "2025-05-29T07:25:10.000Z"
    }
  }
}
```

#### Оновлення ролі (тільки для адміністраторів)

```
PUT /roles/:id
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "name": "sales_manager",
  "description": "Менеджер з продажу",
  "permissions": [
    "orders:read",
    "orders:create",
    "orders:update",
    "customers:read",
    "customers:create",
    "customers:update",
    "products:read",
    "inventory:read",
    "analytics:read"
  ]
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "role": {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "name": "sales_manager",
      "description": "Менеджер з продажу",
      "createdAt": "2025-05-29T07:25:10.000Z",
      "updatedAt": "2025-05-29T07:30:20.000Z"
    }
  }
}
```

#### Видалення ролі (тільки для адміністраторів)

```
DELETE /roles/:id
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "message": "Роль успішно видалено"
  }
}
```

### Управління дозволами

#### Отримання списку дозволів (тільки для адміністраторів)

```
GET /permissions
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Відповідь:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440006",
      "name": "users:read",
      "description": "Перегляд користувачів",
      "resource": "users",
      "action": "read",
      "createdAt": "2025-05-29T07:00:00.000Z",
      "updatedAt": "2025-05-29T07:00:00.000Z"
    },
    // Інші дозволи...
  ]
}
```

#### Перевірка дозволу

```
GET /check-permission
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Параметри запиту:**

```
permission=orders:create
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "hasPermission": true
  }
}
```

## Моделі даних

### User

| Поле | Тип | Опис |
|------|-----|------|
| id | UUID | Унікальний ідентифікатор користувача |
| name | String | Ім'я користувача |
| email | String | Email користувача (унікальний) |
| password | String | Хешований пароль користувача |
| role | String | Роль користувача |
| createdAt | Date | Дата створення |
| updatedAt | Date | Дата оновлення |

### Role

| Поле | Тип | Опис |
|------|-----|------|
| id | UUID | Унікальний ідентифікатор ролі |
| name | String | Назва ролі (унікальна) |
| description | String | Опис ролі |
| createdAt | Date | Дата створення |
| updatedAt | Date | Дата оновлення |

### Permission

| Поле | Тип | Опис |
|------|-----|------|
| id | UUID | Унікальний ідентифікатор дозволу |
| name | String | Назва дозволу (унікальна) |
| description | String | Опис дозволу |
| resource | String | Ресурс, до якого надається доступ |
| action | String | Дія, яка дозволяється (read, create, update, delete) |
| createdAt | Date | Дата створення |
| updatedAt | Date | Дата оновлення |

## Коди помилок

| Код помилки | HTTP статус | Опис |
|-------------|-------------|------|
| AUTH_REQUIRED | 401 | Необхідна автентифікація |
| INVALID_CREDENTIALS | 401 | Невірні облікові дані |
| INVALID_TOKEN | 401 | Недійсний токен |
| TOKEN_EXPIRED | 401 | Термін дії токену закінчився |
| ACCESS_DENIED | 403 | Доступ заборонено |
| USER_NOT_FOUND | 404 | Користувача не знайдено |
| ROLE_NOT_FOUND | 404 | Роль не знайдено |
| PERMISSION_NOT_FOUND | 404 | Дозвіл не знайдено |
| EMAIL_ALREADY_EXISTS | 409 | Email вже використовується |
| ROLE_ALREADY_EXISTS | 409 | Роль з такою назвою вже існує |
| PERMISSION_ALREADY_EXISTS | 409 | Дозвіл з такою назвою вже існує |
| VALIDATION_ERROR | 422 | Помилка валідації даних |
| INTERNAL_ERROR | 500 | Внутрішня помилка сервера |

## Приклади використання

### Реєстрація та вхід

```javascript
// Реєстрація нового користувача
const registerUser = async (userData) => {
  try {
    const response = await fetch('https://api.example.com/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Вхід користувача
const loginUser = async (credentials) => {
  try {
    const response = await fetch('https://api.example.com/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    // Зберігаємо токени в localStorage
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    
    return data.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};
```

### Використання захищених ендпоінтів

```javascript
// Отримання інформації про поточного користувача
const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch('https://api.example.com/api/v1/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

// Оновлення інформації про користувача
const updateUser = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch('https://api.example.com/api/v1/auth/me', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.data.user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
```

### Оновлення токену

```javascript
// Оновлення токену
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }
    
    const response = await fetch('https://api.example.com/api/v1/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    // Оновлюємо токени в localStorage
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    
    return data.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};
```
