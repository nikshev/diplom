# Order Service API

## Огляд

Order Service відповідає за управління замовленнями в системі. Цей сервіс забезпечує створення, оновлення, видалення та пошук замовлень, а також управління статусами замовлень та їх деталями.

## Базовий URL

```
https://api.example.com/api/v1/orders
```

## Ендпоінти

### Управління замовленнями

#### Отримання списку замовлень

```
GET /
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
status=pending,processing
customer=550e8400-e29b-41d4-a716-446655440000
startDate=2025-01-01
endDate=2025-05-30
sort=createdAt,-totalAmount
include=customer,items,payments
```

**Відповідь:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "orderNumber": "ORD-2025-0001",
      "customerId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "processing",
      "totalAmount": 1250.50,
      "currency": "UAH",
      "paymentStatus": "paid",
      "shippingStatus": "pending",
      "notes": "Доставка до відділення Нової Пошти",
      "createdAt": "2025-05-29T08:15:30.000Z",
      "updatedAt": "2025-05-29T08:20:45.000Z",
      "customer": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Іван Петренко",
        "email": "ivan@example.com",
        "phone": "+380501234567"
      },
      "items": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440020",
          "orderId": "550e8400-e29b-41d4-a716-446655440010",
          "productId": "550e8400-e29b-41d4-a716-446655440030",
          "name": "Смартфон XYZ",
          "sku": "SM-XYZ-123",
          "quantity": 1,
          "price": 1200.00,
          "discount": 0,
          "total": 1200.00
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440021",
          "orderId": "550e8400-e29b-41d4-a716-446655440010",
          "productId": "550e8400-e29b-41d4-a716-446655440031",
          "name": "Захисне скло",
          "sku": "ACC-GL-001",
          "quantity": 1,
          "price": 50.50,
          "discount": 0,
          "total": 50.50
        }
      ],
      "payments": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440040",
          "orderId": "550e8400-e29b-41d4-a716-446655440010",
          "amount": 1250.50,
          "currency": "UAH",
          "method": "card",
          "status": "completed",
          "transactionId": "pay_123456789",
          "createdAt": "2025-05-29T08:18:30.000Z"
        }
      ]
    },
    // Інші замовлення...
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

#### Отримання інформації про замовлення

```
GET /:id
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Параметри запиту:**

```
include=customer,items,payments,shipping
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "orderNumber": "ORD-2025-0001",
      "customerId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "processing",
      "totalAmount": 1250.50,
      "currency": "UAH",
      "paymentStatus": "paid",
      "shippingStatus": "pending",
      "notes": "Доставка до відділення Нової Пошти",
      "createdAt": "2025-05-29T08:15:30.000Z",
      "updatedAt": "2025-05-29T08:20:45.000Z",
      "customer": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Іван Петренко",
        "email": "ivan@example.com",
        "phone": "+380501234567",
        "address": {
          "street": "вул. Шевченка, 10",
          "city": "Київ",
          "postalCode": "01001",
          "country": "Україна"
        }
      },
      "items": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440020",
          "orderId": "550e8400-e29b-41d4-a716-446655440010",
          "productId": "550e8400-e29b-41d4-a716-446655440030",
          "name": "Смартфон XYZ",
          "sku": "SM-XYZ-123",
          "quantity": 1,
          "price": 1200.00,
          "discount": 0,
          "total": 1200.00
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440021",
          "orderId": "550e8400-e29b-41d4-a716-446655440010",
          "productId": "550e8400-e29b-41d4-a716-446655440031",
          "name": "Захисне скло",
          "sku": "ACC-GL-001",
          "quantity": 1,
          "price": 50.50,
          "discount": 0,
          "total": 50.50
        }
      ],
      "payments": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440040",
          "orderId": "550e8400-e29b-41d4-a716-446655440010",
          "amount": 1250.50,
          "currency": "UAH",
          "method": "card",
          "status": "completed",
          "transactionId": "pay_123456789",
          "createdAt": "2025-05-29T08:18:30.000Z"
        }
      ],
      "shipping": {
        "id": "550e8400-e29b-41d4-a716-446655440050",
        "orderId": "550e8400-e29b-41d4-a716-446655440010",
        "method": "nova_poshta",
        "trackingNumber": "59000123456789",
        "status": "pending",
        "estimatedDelivery": "2025-06-01T00:00:00.000Z",
        "shippingAddress": {
          "recipientName": "Іван Петренко",
          "phone": "+380501234567",
          "city": "Київ",
          "postOffice": "Відділення №1",
          "country": "Україна"
        },
        "cost": 60.00
      }
    }
  }
}
```

#### Створення нового замовлення

```
POST /
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440030",
      "quantity": 1
    },
    {
      "productId": "550e8400-e29b-41d4-a716-446655440031",
      "quantity": 1
    }
  ],
  "shipping": {
    "method": "nova_poshta",
    "shippingAddress": {
      "recipientName": "Іван Петренко",
      "phone": "+380501234567",
      "city": "Київ",
      "postOffice": "Відділення №1",
      "country": "Україна"
    }
  },
  "payment": {
    "method": "card"
  },
  "notes": "Доставка до відділення Нової Пошти"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "orderNumber": "ORD-2025-0002",
      "customerId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "pending",
      "totalAmount": 1250.50,
      "currency": "UAH",
      "paymentStatus": "pending",
      "shippingStatus": "pending",
      "notes": "Доставка до відділення Нової Пошти",
      "createdAt": "2025-05-29T09:30:15.000Z",
      "updatedAt": "2025-05-29T09:30:15.000Z",
      "items": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440022",
          "orderId": "550e8400-e29b-41d4-a716-446655440011",
          "productId": "550e8400-e29b-41d4-a716-446655440030",
          "name": "Смартфон XYZ",
          "sku": "SM-XYZ-123",
          "quantity": 1,
          "price": 1200.00,
          "discount": 0,
          "total": 1200.00
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440023",
          "orderId": "550e8400-e29b-41d4-a716-446655440011",
          "productId": "550e8400-e29b-41d4-a716-446655440031",
          "name": "Захисне скло",
          "sku": "ACC-GL-001",
          "quantity": 1,
          "price": 50.50,
          "discount": 0,
          "total": 50.50
        }
      ],
      "paymentUrl": "https://payment.example.com/pay/550e8400-e29b-41d4-a716-446655440011"
    }
  }
}
```

#### Оновлення замовлення

```
PUT /:id
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "status": "processing",
  "notes": "Доставка до відділення Нової Пошти №2",
  "shipping": {
    "shippingAddress": {
      "postOffice": "Відділення №2"
    }
  }
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "orderNumber": "ORD-2025-0001",
      "customerId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "processing",
      "totalAmount": 1250.50,
      "currency": "UAH",
      "paymentStatus": "paid",
      "shippingStatus": "pending",
      "notes": "Доставка до відділення Нової Пошти №2",
      "createdAt": "2025-05-29T08:15:30.000Z",
      "updatedAt": "2025-05-29T09:45:20.000Z"
    }
  }
}
```

#### Видалення замовлення

```
DELETE /:id
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
    "message": "Замовлення успішно видалено"
  }
}
```

### Управління статусами замовлень

#### Оновлення статусу замовлення

```
PUT /:id/status
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "status": "completed"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "orderNumber": "ORD-2025-0001",
      "status": "completed",
      "updatedAt": "2025-05-29T10:15:30.000Z"
    }
  }
}
```

#### Оновлення статусу оплати

```
PUT /:id/payment-status
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "paymentStatus": "paid"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "orderNumber": "ORD-2025-0001",
      "paymentStatus": "paid",
      "updatedAt": "2025-05-29T10:20:45.000Z"
    }
  }
}
```

#### Оновлення статусу доставки

```
PUT /:id/shipping-status
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "shippingStatus": "shipped",
  "trackingNumber": "59000123456789"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "orderNumber": "ORD-2025-0001",
      "shippingStatus": "shipped",
      "updatedAt": "2025-05-29T10:25:15.000Z",
      "shipping": {
        "trackingNumber": "59000123456789"
      }
    }
  }
}
```

### Управління елементами замовлення

#### Додавання елементу до замовлення

```
POST /:id/items
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440032",
  "quantity": 1
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "item": {
      "id": "550e8400-e29b-41d4-a716-446655440024",
      "orderId": "550e8400-e29b-41d4-a716-446655440010",
      "productId": "550e8400-e29b-41d4-a716-446655440032",
      "name": "Чохол захисний",
      "sku": "ACC-CS-002",
      "quantity": 1,
      "price": 150.00,
      "discount": 0,
      "total": 150.00,
      "createdAt": "2025-05-29T10:30:45.000Z",
      "updatedAt": "2025-05-29T10:30:45.000Z"
    },
    "order": {
      "totalAmount": 1400.50,
      "updatedAt": "2025-05-29T10:30:45.000Z"
    }
  }
}
```

#### Оновлення елементу замовлення

```
PUT /:id/items/:itemId
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "quantity": 2,
  "discount": 25.00
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "item": {
      "id": "550e8400-e29b-41d4-a716-446655440024",
      "orderId": "550e8400-e29b-41d4-a716-446655440010",
      "productId": "550e8400-e29b-41d4-a716-446655440032",
      "name": "Чохол захисний",
      "sku": "ACC-CS-002",
      "quantity": 2,
      "price": 150.00,
      "discount": 25.00,
      "total": 275.00,
      "updatedAt": "2025-05-29T10:35:20.000Z"
    },
    "order": {
      "totalAmount": 1525.50,
      "updatedAt": "2025-05-29T10:35:20.000Z"
    }
  }
}
```

#### Видалення елементу замовлення

```
DELETE /:id/items/:itemId
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
    "message": "Елемент замовлення успішно видалено",
    "order": {
      "totalAmount": 1250.50,
      "updatedAt": "2025-05-29T10:40:15.000Z"
    }
  }
}
```

### Управління платежами

#### Додавання платежу до замовлення

```
POST /:id/payments
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "amount": 1250.50,
  "currency": "UAH",
  "method": "cash",
  "transactionId": "cash_payment_001"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "550e8400-e29b-41d4-a716-446655440041",
      "orderId": "550e8400-e29b-41d4-a716-446655440010",
      "amount": 1250.50,
      "currency": "UAH",
      "method": "cash",
      "status": "completed",
      "transactionId": "cash_payment_001",
      "createdAt": "2025-05-29T10:45:30.000Z",
      "updatedAt": "2025-05-29T10:45:30.000Z"
    },
    "order": {
      "paymentStatus": "paid",
      "updatedAt": "2025-05-29T10:45:30.000Z"
    }
  }
}
```

#### Отримання посилання на оплату

```
GET /:id/payment-link
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Параметри запиту:**

```
method=card
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://payment.example.com/pay/550e8400-e29b-41d4-a716-446655440010",
    "expiresAt": "2025-05-29T11:45:30.000Z"
  }
}
```

### Експорт та імпорт

#### Експорт замовлень

```
GET /export
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Параметри запиту:**

```
format=csv
startDate=2025-01-01
endDate=2025-05-30
status=completed,cancelled
```

**Відповідь:**

Файл для завантаження у вказаному форматі.

#### Імпорт замовлень

```
POST /import
```

**Заголовки:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Тіло запиту:**

```
file: [файл для імпорту]
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "imported": 10,
    "failed": 2,
    "errors": [
      {
        "row": 3,
        "error": "Клієнта не знайдено"
      },
      {
        "row": 7,
        "error": "Товар не знайдено"
      }
    ]
  }
}
```

## Моделі даних

### Order

| Поле | Тип | Опис |
|------|-----|------|
| id | UUID | Унікальний ідентифікатор замовлення |
| orderNumber | String | Номер замовлення |
| customerId | UUID | Ідентифікатор клієнта |
| status | String | Статус замовлення (pending, processing, completed, cancelled) |
| totalAmount | Decimal | Загальна сума замовлення |
| currency | String | Валюта замовлення |
| paymentStatus | String | Статус оплати (pending, paid, refunded, failed) |
| shippingStatus | String | Статус доставки (pending, shipped, delivered, returned) |
| notes | String | Примітки до замовлення |
| createdAt | Date | Дата створення |
| updatedAt | Date | Дата оновлення |

### OrderItem

| Поле | Тип | Опис |
|------|-----|------|
| id | UUID | Унікальний ідентифікатор елементу замовлення |
| orderId | UUID | Ідентифікатор замовлення |
| productId | UUID | Ідентифікатор товару |
| name | String | Назва товару |
| sku | String | Артикул товару |
| quantity | Integer | Кількість |
| price | Decimal | Ціна за одиницю |
| discount | Decimal | Знижка |
| total | Decimal | Загальна сума |
| createdAt | Date | Дата створення |
| updatedAt | Date | Дата оновлення |

### Payment

| Поле | Тип | Опис |
|------|-----|------|
| id | UUID | Унікальний ідентифікатор платежу |
| orderId | UUID | Ідентифікатор замовлення |
| amount | Decimal | Сума платежу |
| currency | String | Валюта платежу |
| method | String | Метод оплати (card, cash, bank_transfer) |
| status | String | Статус платежу (pending, completed, failed, refunded) |
| transactionId | String | Ідентифікатор транзакції |
| createdAt | Date | Дата створення |
| updatedAt | Date | Дата оновлення |

### Shipping

| Поле | Тип | Опис |
|------|-----|------|
| id | UUID | Унікальний ідентифікатор доставки |
| orderId | UUID | Ідентифікатор замовлення |
| method | String | Метод доставки (nova_poshta, ukrposhta, courier) |
| trackingNumber | String | Номер відстеження |
| status | String | Статус доставки (pending, shipped, delivered, returned) |
| estimatedDelivery | Date | Очікувана дата доставки |
| shippingAddress | Object | Адреса доставки |
| cost | Decimal | Вартість доставки |
| createdAt | Date | Дата створення |
| updatedAt | Date | Дата оновлення |

## Коди помилок

| Код помилки | HTTP статус | Опис |
|-------------|-------------|------|
| ORDER_NOT_FOUND | 404 | Замовлення не знайдено |
| ITEM_NOT_FOUND | 404 | Елемент замовлення не знайдено |
| PAYMENT_NOT_FOUND | 404 | Платіж не знайдено |
| SHIPPING_NOT_FOUND | 404 | Доставку не знайдено |
| CUSTOMER_NOT_FOUND | 404 | Клієнта не знайдено |
| PRODUCT_NOT_FOUND | 404 | Товар не знайдено |
| PRODUCT_OUT_OF_STOCK | 400 | Товар відсутній на складі |
| INVALID_STATUS | 400 | Недійсний статус |
| INVALID_PAYMENT_METHOD | 400 | Недійсний метод оплати |
| INVALID_SHIPPING_METHOD | 400 | Недійсний метод доставки |
| VALIDATION_ERROR | 422 | Помилка валідації даних |
| INTERNAL_ERROR | 500 | Внутрішня помилка сервера |

## Приклади використання

### Створення замовлення

```javascript
// Створення нового замовлення
const createOrder = async (orderData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch('https://api.example.com/api/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.data.order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
```

### Отримання списку замовлень

```javascript
// Отримання списку замовлень з фільтрацією
const getOrders = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    // Формуємо параметри запиту з фільтрів
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.customer) params.append('customer', filters.customer);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.include) params.append('include', filters.include);
    
    const response = await fetch(`https://api.example.com/api/v1/orders?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return {
      orders: data.data,
      pagination: data.meta.pagination
    };
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};
```

### Оновлення статусу замовлення

```javascript
// Оновлення статусу замовлення
const updateOrderStatus = async (orderId, status) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch(`https://api.example.com/api/v1/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.data.order;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};
```
