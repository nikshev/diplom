# Integration Service API

## Огляд

Integration Service відповідає за взаємодію інформаційної системи з зовнішніми сервісами, такими як Nova Poshta, Rozetka та банківські API. Цей сервіс забезпечує синхронізацію даних, обробку запитів та відповідей від зовнішніх систем, а також моніторинг статусу інтеграцій.

## Базовий URL

```
https://api.example.com/api/v1/integration
```

## Ендпоінти

### Nova Poshta

#### Отримання списку міст

```
GET /nova-poshta/cities
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Параметри запиту:**

```
search=київ
page=1
limit=10
```

**Відповідь:**

```json
{
  "success": true,
  "data": [
    {
      "ref": "c1cdf26e-e9c5-11e3-8c4a-0050568002cf",
      "description": "Київ",
      "descriptionRu": "Киев",
      "area": "71508131-9b87-11de-822f-000c2965ae0e",
      "settlementType": "563ced13-f210-11e3-8c4a-0050568002cf",
      "isBranch": 1,
      "preventEntryNewStreetsUser": false,
      "conglomerates": null,
      "cityID": "4",
      "settlementTypeDescriptionRu": "город",
      "settlementTypeDescription": "місто"
    },
    // Інші міста...
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

#### Отримання списку відділень

```
GET /nova-poshta/warehouses
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Параметри запиту:**

```
cityRef=c1cdf26e-e9c5-11e3-8c4a-0050568002cf
search=відділення
page=1
limit=10
```

**Відповідь:**

```json
{
  "success": true,
  "data": [
    {
      "ref": "1ec09d2e-e1c2-11e3-8c4a-0050568002cf",
      "description": "Відділення №1: м. Київ, вул. Хрещатик, 22",
      "descriptionRu": "Отделение №1: г. Киев, ул. Крещатик, 22",
      "phone": "380444454499",
      "typeOfWarehouse": "841339c7-591a-42e2-8233-7a0a00f0ed6f",
      "number": "1",
      "cityRef": "c1cdf26e-e9c5-11e3-8c4a-0050568002cf",
      "cityDescription": "Київ",
      "cityDescriptionRu": "Киев",
      "longitude": "30.521266",
      "latitude": "50.447281",
      "schedule": {
        "Monday": "08:00-20:00",
        "Tuesday": "08:00-20:00",
        "Wednesday": "08:00-20:00",
        "Thursday": "08:00-20:00",
        "Friday": "08:00-20:00",
        "Saturday": "09:00-18:00",
        "Sunday": "09:00-17:00"
      }
    },
    // Інші відділення...
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 120,
      "pages": 12
    }
  }
}
```

#### Розрахунок вартості доставки

```
POST /nova-poshta/delivery-cost
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "citySender": "c1cdf26e-e9c5-11e3-8c4a-0050568002cf",
  "cityRecipient": "db5c88f0-391c-11dd-90d9-001a92567626",
  "weight": 1.5,
  "serviceType": "WarehouseWarehouse",
  "cost": 1250.50,
  "cargoType": "Cargo",
  "seatsAmount": 1,
  "redeliveryCalculate": {
    "CargoType": "Money",
    "Amount": 1250.50
  }
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "cost": 60.00,
    "costRedelivery": 10.00,
    "totalCost": 70.00,
    "estimatedDeliveryDate": "2025-06-01T00:00:00.000Z"
  }
}
```

#### Створення експрес-накладної

```
POST /nova-poshta/shipments
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "senderInfo": {
    "contactPerson": "Петренко Іван",
    "phone": "380501234567",
    "cityRef": "c1cdf26e-e9c5-11e3-8c4a-0050568002cf",
    "address": "вул. Хрещатик, 22",
    "warehouseRef": "1ec09d2e-e1c2-11e3-8c4a-0050568002cf"
  },
  "recipientInfo": {
    "contactPerson": "Коваленко Марія",
    "phone": "380671234567",
    "cityRef": "db5c88f0-391c-11dd-90d9-001a92567626",
    "address": "вул. Соборна, 10",
    "warehouseRef": "2ec09d2e-e1c2-11e3-8c4a-0050568002cf"
  },
  "cargoInfo": {
    "weight": 1.5,
    "cost": 1250.50,
    "description": "Смартфон XYZ",
    "seatsAmount": 1
  },
  "serviceType": "WarehouseWarehouse",
  "paymentMethod": "Cash",
  "payerType": "Recipient",
  "redelivery": {
    "paymentType": "Cash",
    "amount": 1250.50
  },
  "orderId": "550e8400-e29b-41d4-a716-446655440010"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "waybillNumber": "59000123456789",
    "estimatedDeliveryDate": "2025-06-01T00:00:00.000Z",
    "cost": 60.00,
    "redeliveryCost": 10.00,
    "totalCost": 70.00,
    "barcode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "orderId": "550e8400-e29b-41d4-a716-446655440010"
  }
}
```

#### Отримання статусу доставки

```
GET /nova-poshta/tracking/:waybillNumber
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
    "waybillNumber": "59000123456789",
    "status": "ВідправленоЗВідділення",
    "statusCode": "4",
    "statusDescription": "Відправлення у дорозі",
    "estimatedDeliveryDate": "2025-06-01T00:00:00.000Z",
    "actualDeliveryDate": null,
    "warehouseRecipient": "Відділення №2: м. Львів, вул. Соборна, 10",
    "warehouseSender": "Відділення №1: м. Київ, вул. Хрещатик, 22",
    "history": [
      {
        "date": "2025-05-29T10:15:30.000Z",
        "status": "Відправлення створено",
        "statusCode": "1"
      },
      {
        "date": "2025-05-29T15:30:45.000Z",
        "status": "Відправлення прийнято у відділенні",
        "statusCode": "2"
      },
      {
        "date": "2025-05-29T18:45:20.000Z",
        "status": "Відправлення у дорозі",
        "statusCode": "4"
      }
    ]
  }
}
```

### Rozetka

#### Синхронізація товарів

```
POST /rozetka/sync-products
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "sku": "SM-XYZ-123",
      "name": "Смартфон XYZ",
      "price": 1200.00,
      "stock": 10,
      "categoryId": "550e8400-e29b-41d4-a716-446655440060"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440031",
      "sku": "ACC-GL-001",
      "name": "Захисне скло",
      "price": 50.50,
      "stock": 50,
      "categoryId": "550e8400-e29b-41d4-a716-446655440061"
    }
  ]
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "syncedProducts": 2,
    "failedProducts": 0,
    "errors": []
  }
}
```

#### Отримання замовлень з Rozetka

```
GET /rozetka/orders
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Параметри запиту:**

```
startDate=2025-05-01
endDate=2025-05-30
status=pending,processing
page=1
limit=10
```

**Відповідь:**

```json
{
  "success": true,
  "data": [
    {
      "id": "RZ-123456",
      "date": "2025-05-29T08:15:30.000Z",
      "status": "pending",
      "customer": {
        "name": "Іван Петренко",
        "phone": "380501234567",
        "email": "ivan@example.com"
      },
      "items": [
        {
          "sku": "SM-XYZ-123",
          "name": "Смартфон XYZ",
          "quantity": 1,
          "price": 1200.00
        },
        {
          "sku": "ACC-GL-001",
          "name": "Захисне скло",
          "quantity": 1,
          "price": 50.50
        }
      ],
      "totalAmount": 1250.50,
      "shipping": {
        "method": "nova_poshta",
        "address": {
          "city": "Київ",
          "warehouse": "Відділення №1"
        }
      },
      "payment": {
        "method": "card"
      }
    },
    // Інші замовлення...
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### Оновлення статусу замовлення в Rozetka

```
PUT /rozetka/orders/:id/status
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "status": "processing",
  "trackingNumber": "59000123456789"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "id": "RZ-123456",
    "status": "processing",
    "updatedAt": "2025-05-29T10:45:30.000Z"
  }
}
```

#### Імпорт замовлень з Rozetka

```
POST /rozetka/import-orders
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "startDate": "2025-05-01",
  "endDate": "2025-05-30",
  "status": ["pending", "processing"]
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "importedOrders": 25,
    "failedOrders": 2,
    "errors": [
      {
        "orderId": "RZ-123457",
        "error": "Товар не знайдено в системі"
      },
      {
        "orderId": "RZ-123458",
        "error": "Помилка при створенні клієнта"
      }
    ],
    "createdOrders": [
      {
        "externalId": "RZ-123456",
        "internalId": "550e8400-e29b-41d4-a716-446655440012"
      },
      // Інші замовлення...
    ]
  }
}
```

### Банківські API

#### Ініціювання платежу

```
POST /payment/initiate
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440010",
  "amount": 1250.50,
  "currency": "UAH",
  "description": "Оплата замовлення ORD-2025-0001",
  "returnUrl": "https://example.com/payment/success",
  "cancelUrl": "https://example.com/payment/cancel"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "paymentId": "pay_123456789",
    "paymentUrl": "https://payment.example.com/pay/123456789",
    "expiresAt": "2025-05-29T11:45:30.000Z"
  }
}
```

#### Перевірка статусу платежу

```
GET /payment/:paymentId/status
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
    "paymentId": "pay_123456789",
    "orderId": "550e8400-e29b-41d4-a716-446655440010",
    "status": "completed",
    "amount": 1250.50,
    "currency": "UAH",
    "paymentMethod": "card",
    "cardMask": "4242 **** **** 4242",
    "cardType": "visa",
    "createdAt": "2025-05-29T10:30:45.000Z",
    "completedAt": "2025-05-29T10:35:20.000Z"
  }
}
```

#### Повернення коштів

```
POST /payment/:paymentId/refund
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "amount": 1250.50,
  "reason": "Клієнт відмовився від замовлення"
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "refundId": "ref_123456789",
    "paymentId": "pay_123456789",
    "orderId": "550e8400-e29b-41d4-a716-446655440010",
    "amount": 1250.50,
    "currency": "UAH",
    "status": "completed",
    "createdAt": "2025-05-29T11:30:45.000Z"
  }
}
```

### Управління інтеграціями

#### Отримання статусу інтеграцій

```
GET /status
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
    "novaPoshta": {
      "status": "active",
      "lastSync": "2025-05-29T08:00:00.000Z",
      "error": null
    },
    "rozetka": {
      "status": "active",
      "lastSync": "2025-05-29T07:30:00.000Z",
      "error": null
    },
    "payment": {
      "status": "active",
      "lastSync": "2025-05-29T08:15:00.000Z",
      "error": null
    }
  }
}
```

#### Налаштування інтеграції

```
PUT /settings/:integration
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "apiKey": "your-api-key",
  "apiSecret": "your-api-secret",
  "enabled": true,
  "syncInterval": 3600,
  "settings": {
    "defaultSenderCity": "c1cdf26e-e9c5-11e3-8c4a-0050568002cf",
    "defaultSenderWarehouse": "1ec09d2e-e1c2-11e3-8c4a-0050568002cf"
  }
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "integration": "novaPoshta",
    "enabled": true,
    "syncInterval": 3600,
    "lastUpdated": "2025-05-29T12:00:00.000Z"
  }
}
```

#### Запуск синхронізації вручну

```
POST /sync/:integration
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Тіло запиту:**

```json
{
  "entities": ["cities", "warehouses"],
  "force": true
}
```

**Відповідь:**

```json
{
  "success": true,
  "data": {
    "integration": "novaPoshta",
    "syncId": "sync_123456789",
    "status": "in_progress",
    "startedAt": "2025-05-29T12:15:30.000Z",
    "estimatedCompletion": "2025-05-29T12:20:30.000Z"
  }
}
```

#### Отримання статусу синхронізації

```
GET /sync/:syncId
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
    "syncId": "sync_123456789",
    "integration": "novaPoshta",
    "status": "completed",
    "progress": 100,
    "entities": {
      "cities": {
        "total": 1500,
        "processed": 1500,
        "created": 10,
        "updated": 1490,
        "failed": 0
      },
      "warehouses": {
        "total": 6000,
        "processed": 6000,
        "created": 50,
        "updated": 5950,
        "failed": 0
      }
    },
    "startedAt": "2025-05-29T12:15:30.000Z",
    "completedAt": "2025-05-29T12:20:45.000Z",
    "duration": 315
  }
}
```

#### Отримання журналу інтеграції

```
GET /logs/:integration
```

**Заголовки:**

```
Authorization: Bearer <token>
```

**Параметри запиту:**

```
startDate=2025-05-29
endDate=2025-05-30
level=error,warning
page=1
limit=10
```

**Відповідь:**

```json
{
  "success": true,
  "data": [
    {
      "id": "log_123456789",
      "integration": "novaPoshta",
      "level": "error",
      "message": "Помилка при отриманні списку відділень",
      "details": {
        "error": "API key is invalid",
        "request": {
          "method": "GET",
          "url": "https://api.novaposhta.ua/v2.0/json/"
        }
      },
      "timestamp": "2025-05-29T11:45:30.000Z"
    },
    // Інші записи журналу...
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

## Моделі даних

### NovaPoshtaShipment

| Поле | Тип | Опис |
|------|-----|------|
| id | UUID | Унікальний ідентифікатор відправлення |
| orderId | UUID | Ідентифікатор замовлення |
| waybillNumber | String | Номер експрес-накладної |
| status | String | Статус відправлення |
| statusCode | String | Код статусу відправлення |
| estimatedDeliveryDate | Date | Очікувана дата доставки |
| actualDeliveryDate | Date | Фактична дата доставки |
| cost | Decimal | Вартість доставки |
| createdAt | Date | Дата створення |
| updatedAt | Date | Дата оновлення |

### RozetkaOrder

| Поле | Тип | Опис |
|------|-----|------|
| id | String | Ідентифікатор замовлення в Rozetka |
| orderId | UUID | Ідентифікатор замовлення в системі |
| status | String | Статус замовлення |
| date | Date | Дата замовлення |
| totalAmount | Decimal | Загальна сума замовлення |
| createdAt | Date | Дата створення |
| updatedAt | Date | Дата оновлення |

### Payment

| Поле | Тип | Опис |
|------|-----|------|
| id | String | Ідентифікатор платежу |
| orderId | UUID | Ідентифікатор замовлення |
| amount | Decimal | Сума платежу |
| currency | String | Валюта платежу |
| status | String | Статус платежу |
| paymentMethod | String | Метод оплати |
| createdAt | Date | Дата створення |
| completedAt | Date | Дата завершення |

### IntegrationSettings

| Поле | Тип | Опис |
|------|-----|------|
| id | UUID | Унікальний ідентифікатор налаштувань |
| integration | String | Назва інтеграції |
| apiKey | String | API ключ |
| apiSecret | String | API секрет |
| enabled | Boolean | Статус активації |
| syncInterval | Integer | Інтервал синхронізації в секундах |
| settings | Object | Додаткові налаштування |
| lastSync | Date | Дата останньої синхронізації |
| createdAt | Date | Дата створення |
| updatedAt | Date | Дата оновлення |

## Коди помилок

| Код помилки | HTTP статус | Опис |
|-------------|-------------|------|
| INTEGRATION_NOT_FOUND | 404 | Інтеграцію не знайдено |
| INTEGRATION_DISABLED | 400 | Інтеграція вимкнена |
| INVALID_API_KEY | 401 | Недійсний API ключ |
| EXTERNAL_API_ERROR | 502 | Помилка зовнішнього API |
| SYNC_IN_PROGRESS | 409 | Синхронізація вже виконується |
| SYNC_NOT_FOUND | 404 | Синхронізацію не знайдено |
| WAYBILL_NOT_FOUND | 404 | Накладну не знайдено |
| PAYMENT_NOT_FOUND | 404 | Платіж не знайдено |
| REFUND_FAILED | 400 | Помилка при поверненні коштів |
| VALIDATION_ERROR | 422 | Помилка валідації даних |
| INTERNAL_ERROR | 500 | Внутрішня помилка сервера |

## Приклади використання

### Створення експрес-накладної Nova Poshta

```javascript
// Створення експрес-накладної
const createNovaPoshtaShipment = async (shipmentData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch('https://api.example.com/api/v1/integration/nova-poshta/shipments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(shipmentData)
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.data;
  } catch (error) {
    console.error('Error creating Nova Poshta shipment:', error);
    throw error;
  }
};
```

### Відстеження статусу доставки

```javascript
// Відстеження статусу доставки
const trackNovaPoshtaShipment = async (waybillNumber) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch(`https://api.example.com/api/v1/integration/nova-poshta/tracking/${waybillNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.data;
  } catch (error) {
    console.error('Error tracking Nova Poshta shipment:', error);
    throw error;
  }
};
```

### Ініціювання платежу

```javascript
// Ініціювання платежу
const initiatePayment = async (paymentData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch('https://api.example.com/api/v1/integration/payment/initiate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    // Перенаправлення користувача на сторінку оплати
    window.location.href = data.data.paymentUrl;
    
    return data.data;
  } catch (error) {
    console.error('Error initiating payment:', error);
    throw error;
  }
};
```

### Синхронізація товарів з Rozetka

```javascript
// Синхронізація товарів з Rozetka
const syncProductsWithRozetka = async (products) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch('https://api.example.com/api/v1/integration/rozetka/sync-products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ products })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.data;
  } catch (error) {
    console.error('Error syncing products with Rozetka:', error);
    throw error;
  }
};
```
