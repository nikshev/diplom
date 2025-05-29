# Архітектура мікросервісів

## Огляд

Мікросервісна архітектура є основою інформаційної системи управління бізнес-діяльністю підприємства. Цей підхід дозволяє розділити систему на невеликі, незалежні сервіси, кожен з яких відповідає за конкретну бізнес-функцію та може розроблятися, тестуватися, розгортатися та масштабуватися незалежно від інших сервісів.

## Переваги мікросервісної архітектури

1. **Незалежна розробка та розгортання** - кожен сервіс може розроблятися та розгортатися незалежно, що прискорює процес розробки та випуску нових функцій.
2. **Технологічна різноманітність** - кожен сервіс може використовувати оптимальний стек технологій для своїх потреб.
3. **Масштабованість** - окремі сервіси можуть масштабуватися незалежно відповідно до навантаження.
4. **Стійкість до відмов** - відмова одного сервісу не призводить до відмови всієї системи.
5. **Організаційна гнучкість** - різні команди можуть працювати над різними сервісами незалежно.

## Структура мікросервісу

Кожен мікросервіс має подібну внутрішню структуру, що забезпечує однорідність та спрощує розробку та підтримку:

### 1. API Layer

Відповідає за обробку HTTP-запитів, валідацію вхідних даних, автентифікацію та авторизацію.

```javascript
// Приклад API Layer (Express.js)
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware.authenticate, orderController.getAllOrders);
router.get('/:id', authMiddleware.authenticate, orderController.getOrderById);
router.post('/', authMiddleware.authenticate, orderController.createOrder);
router.put('/:id', authMiddleware.authenticate, orderController.updateOrder);
router.delete('/:id', authMiddleware.authenticate, orderController.deleteOrder);

module.exports = router;
```

### 2. Controller Layer

Обробляє запити, викликає відповідні сервіси та формує відповіді.

```javascript
// Приклад Controller Layer
const orderService = require('../services/orderService');

const orderController = {
  async getAllOrders(req, res, next) {
    try {
      const { page, limit, search, status } = req.query;
      const orders = await orderService.getAllOrders({ page, limit, search, status });
      res.json({
        success: true,
        data: orders.data,
        meta: orders.meta
      });
    } catch (error) {
      next(error);
    }
  },
  
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      res.json({
        success: true,
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Інші методи...
};

module.exports = orderController;
```

### 3. Service Layer

Містить бізнес-логіку, взаємодіє з репозиторіями та іншими сервісами.

```javascript
// Приклад Service Layer
const orderRepository = require('../repositories/orderRepository');
const inventoryService = require('./inventoryService');
const eventEmitter = require('../events/eventEmitter');

const orderService = {
  async getAllOrders(options) {
    const { page = 1, limit = 10, search, status } = options;
    
    const filters = {};
    if (search) filters.search = search;
    if (status) filters.status = status;
    
    const orders = await orderRepository.findAll({
      page,
      limit,
      filters
    });
    
    return orders;
  },
  
  async getOrderById(id) {
    const order = await orderRepository.findById(id);
    
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }
    
    return order;
  },
  
  async createOrder(orderData) {
    // Перевірка наявності товарів
    const inventoryCheck = await inventoryService.checkInventory(orderData.items);
    
    if (!inventoryCheck.available) {
      throw new Error('PRODUCT_OUT_OF_STOCK');
    }
    
    // Створення замовлення
    const order = await orderRepository.create(orderData);
    
    // Резервування товарів
    await inventoryService.reserveItems(order.id, orderData.items);
    
    // Відправка події про створення замовлення
    eventEmitter.emit('order.created', { order });
    
    return order;
  },
  
  // Інші методи...
};

module.exports = orderService;
```

### 4. Repository Layer

Відповідає за взаємодію з базою даних.

```javascript
// Приклад Repository Layer
const { Order, OrderItem } = require('../models');
const { Op } = require('sequelize');

const orderRepository = {
  async findAll(options) {
    const { page = 1, limit = 10, filters = {} } = options;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (filters.search) {
      whereClause.orderNumber = {
        [Op.iLike]: `%${filters.search}%`
      };
    }
    
    if (filters.status) {
      whereClause.status = filters.status;
    }
    
    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });
    
    return {
      data: rows,
      meta: {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    };
  },
  
  async findById(id) {
    return Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });
  },
  
  async create(orderData) {
    const transaction = await Order.sequelize.transaction();
    
    try {
      const order = await Order.create({
        customerId: orderData.customerId,
        status: 'pending',
        totalAmount: orderData.items.reduce((total, item) => total + (item.price * item.quantity), 0),
        currency: 'UAH',
        paymentStatus: 'pending',
        shippingStatus: 'pending',
        notes: orderData.notes
      }, { transaction });
      
      const orderItems = await Promise.all(orderData.items.map(item => 
        OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0,
          total: (item.price * item.quantity) - (item.discount || 0)
        }, { transaction })
      ));
      
      await transaction.commit();
      
      return {
        ...order.toJSON(),
        items: orderItems.map(item => item.toJSON())
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  
  // Інші методи...
};

module.exports = orderRepository;
```

### 5. Model Layer

Визначає структуру даних та взаємозв'язки між ними.

```javascript
// Приклад Model Layer (Sequelize)
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.Customer, {
        foreignKey: 'customerId',
        as: 'customer'
      });
      
      Order.hasMany(models.OrderItem, {
        foreignKey: 'orderId',
        as: 'items'
      });
      
      Order.hasMany(models.Payment, {
        foreignKey: 'orderId',
        as: 'payments'
      });
      
      Order.hasOne(models.Shipping, {
        foreignKey: 'orderId',
        as: 'shipping'
      });
    }
  }
  
  Order.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderNumber: {
      type: DataTypes.STRING,
      unique: true
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'UAH'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'),
      defaultValue: 'pending'
    },
    shippingStatus: {
      type: DataTypes.ENUM('pending', 'shipped', 'delivered', 'returned'),
      defaultValue: 'pending'
    },
    notes: {
      type: DataTypes.TEXT
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    hooks: {
      beforeCreate: async (order) => {
        // Генерація номера замовлення
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        
        const lastOrder = await sequelize.models.Order.findOne({
          order: [['createdAt', 'DESC']]
        });
        
        const lastNumber = lastOrder ? parseInt(lastOrder.orderNumber.split('-')[2]) : 0;
        const newNumber = String(lastNumber + 1).padStart(4, '0');
        
        order.orderNumber = `ORD-${year}${month}-${newNumber}`;
      }
    }
  });
  
  return Order;
};
```

### 6. Event Layer

Відповідає за асинхронну комунікацію між сервісами через події.

```javascript
// Приклад Event Layer
const { RabbitMQ } = require('../config/rabbitmq');

class EventEmitter {
  constructor() {
    this.rabbitmq = new RabbitMQ();
  }
  
  async init() {
    await this.rabbitmq.connect();
  }
  
  async emit(event, data) {
    await this.rabbitmq.publish('events', event, data);
  }
  
  async subscribe(event, callback) {
    await this.rabbitmq.subscribe('events', event, callback);
  }
}

module.exports = new EventEmitter();
```

## Комунікація між мікросервісами

### 1. Синхронна комунікація (REST API)

Використовується для прямих запитів між сервісами, коли потрібна негайна відповідь.

```javascript
// Приклад синхронної комунікації
const axios = require('axios');
const config = require('../config');

const inventoryServiceClient = {
  async checkInventory(items) {
    try {
      const response = await axios.post(`${config.services.inventory}/check`, { items }, {
        headers: {
          'Authorization': `Bearer ${config.services.apiKey}`
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Inventory service error: ${error.message}`);
    }
  },
  
  async reserveItems(orderId, items) {
    try {
      const response = await axios.post(`${config.services.inventory}/reserve`, { orderId, items }, {
        headers: {
          'Authorization': `Bearer ${config.services.apiKey}`
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Inventory service error: ${error.message}`);
    }
  }
};

module.exports = inventoryServiceClient;
```

### 2. Асинхронна комунікація (Events)

Використовується для сповіщення інших сервісів про події, коли не потрібна негайна відповідь.

```javascript
// Приклад відправки події
const eventEmitter = require('../events/eventEmitter');

// В сервісі замовлень
await orderRepository.updateStatus(orderId, 'completed');
eventEmitter.emit('order.completed', { orderId, completedAt: new Date() });

// В сервісі нотифікацій
eventEmitter.subscribe('order.completed', async (data) => {
  const { orderId, completedAt } = data;
  const order = await orderService.getOrderDetails(orderId);
  await notificationService.sendOrderCompletedNotification(order);
});
```

## Опис мікросервісів

### 1. Auth Service

#### Відповідальності
- Автентифікація користувачів
- Авторизація запитів
- Управління користувачами
- Управління ролями та дозволами

#### API Endpoints
- `/register` - реєстрація нового користувача
- `/login` - автентифікація користувача
- `/logout` - вихід користувача
- `/refresh-token` - оновлення токену
- `/me` - отримання інформації про поточного користувача
- `/users` - управління користувачами
- `/roles` - управління ролями
- `/permissions` - управління дозволами

#### Події
- `user.created` - створено нового користувача
- `user.updated` - оновлено інформацію про користувача
- `user.deleted` - видалено користувача
- `role.created` - створено нову роль
- `role.updated` - оновлено роль
- `role.deleted` - видалено роль

### 2. Order Service

#### Відповідальності
- Створення та управління замовленнями
- Управління статусами замовлень
- Управління елементами замовлень
- Обробка процесу замовлення

#### API Endpoints
- `/` - управління замовленнями
- `/:id` - управління конкретним замовленням
- `/:id/status` - управління статусом замовлення
- `/:id/items` - управління елементами замовлення
- `/:id/payments` - управління платежами замовлення
- `/export` - експорт замовлень
- `/import` - імпорт замовлень

#### Події
- `order.created` - створено нове замовлення
- `order.updated` - оновлено замовлення
- `order.status.changed` - змінено статус замовлення
- `order.item.added` - додано елемент до замовлення
- `order.item.updated` - оновлено елемент замовлення
- `order.item.removed` - видалено елемент замовлення
- `order.payment.added` - додано платіж до замовлення

### 3. Customer Service

#### Відповідальності
- Управління клієнтами
- Управління контактною інформацією клієнтів
- Управління історією замовлень клієнтів
- Управління програмами лояльності

#### API Endpoints
- `/` - управління клієнтами
- `/:id` - управління конкретним клієнтом
- `/:id/orders` - управління замовленнями клієнта
- `/:id/addresses` - управління адресами клієнта
- `/:id/loyalty` - управління програмами лояльності клієнта
- `/import` - імпорт клієнтів
- `/export` - експорт клієнтів

#### Події
- `customer.created` - створено нового клієнта
- `customer.updated` - оновлено інформацію про клієнта
- `customer.deleted` - видалено клієнта
- `customer.address.added` - додано адресу клієнта
- `customer.address.updated` - оновлено адресу клієнта
- `customer.address.removed` - видалено адресу клієнта
- `customer.loyalty.updated` - оновлено програму лояльності клієнта

### 4. Product Service

#### Відповідальності
- Управління товарами
- Управління категоріями товарів
- Управління характеристиками товарів
- Управління цінами товарів

#### API Endpoints
- `/` - управління товарами
- `/:id` - управління конкретним товаром
- `/categories` - управління категоріями товарів
- `/categories/:id` - управління конкретною категорією
- `/:id/attributes` - управління характеристиками товару
- `/:id/prices` - управління цінами товару
- `/import` - імпорт товарів
- `/export` - експорт товарів
- `/search` - пошук товарів

#### Події
- `product.created` - створено новий товар
- `product.updated` - оновлено інформацію про товар
- `product.deleted` - видалено товар
- `product.category.created` - створено нову категорію
- `product.category.updated` - оновлено категорію
- `product.category.deleted` - видалено категорію
- `product.price.updated` - оновлено ціну товару

### 5. Inventory Service

#### Відповідальності
- Управління товарними запасами
- Управління складами
- Управління переміщеннями товарів
- Управління інвентаризацією

#### API Endpoints
- `/` - управління запасами
- `/:id` - управління конкретним запасом
- `/check` - перевірка наявності товарів
- `/reserve` - резервування товарів
- `/release` - звільнення резервування
- `/warehouses` - управління складами
- `/movements` - управління переміщеннями
- `/inventory` - управління інвентаризацією

#### Події
- `inventory.updated` - оновлено запаси
- `inventory.reserved` - зарезервовано товари
- `inventory.released` - звільнено резервування
- `inventory.movement.created` - створено переміщення
- `inventory.low` - низький рівень запасів
- `inventory.out_of_stock` - товар відсутній на складі

### 6. Finance Service

#### Відповідальності
- Управління фінансовими операціями
- Управління платежами
- Управління рахунками
- Управління фінансовою звітністю

#### API Endpoints
- `/transactions` - управління транзакціями
- `/transactions/:id` - управління конкретною транзакцією
- `/payments` - управління платежами
- `/payments/:id` - управління конкретним платежем
- `/invoices` - управління рахунками
- `/invoices/:id` - управління конкретним рахунком
- `/reports` - управління фінансовими звітами

#### Події
- `finance.transaction.created` - створено нову транзакцію
- `finance.payment.created` - створено новий платіж
- `finance.payment.updated` - оновлено платіж
- `finance.invoice.created` - створено новий рахунок
- `finance.invoice.paid` - оплачено рахунок
- `finance.invoice.overdue` - прострочено рахунок

### 7. Analytics Service

#### Відповідальності
- Збір та аналіз даних
- Формування аналітичних звітів
- Формування дашбордів
- Прогнозування

#### API Endpoints
- `/reports` - управління звітами
- `/reports/:id` - управління конкретним звітом
- `/dashboards` - управління дашбордами
- `/dashboards/:id` - управління конкретним дашбордом
- `/metrics` - отримання метрик
- `/predictions` - отримання прогнозів

#### Події
- `analytics.report.generated` - згенеровано звіт
- `analytics.dashboard.updated` - оновлено дашборд
- `analytics.prediction.generated` - згенеровано прогноз

### 8. Integration Service

#### Відповідальності
- Інтеграція з Nova Poshta
- Інтеграція з Rozetka
- Інтеграція з банківськими API
- Управління синхронізацією даних

#### API Endpoints
- `/nova-poshta` - інтеграція з Nova Poshta
- `/rozetka` - інтеграція з Rozetka
- `/payment` - інтеграція з платіжними системами
- `/status` - статус інтеграцій
- `/settings` - налаштування інтеграцій
- `/sync` - управління синхронізацією

#### Події
- `integration.sync.started` - розпочато синхронізацію
- `integration.sync.completed` - завершено синхронізацію
- `integration.sync.failed` - помилка синхронізації
- `integration.payment.initiated` - ініційовано платіж
- `integration.payment.completed` - завершено платіж
- `integration.shipment.created` - створено відправлення
- `integration.shipment.updated` - оновлено відправлення

### 9. Notification Service

#### Відповідальності
- Відправка повідомлень користувачам
- Управління шаблонами повідомлень
- Управління каналами повідомлень
- Відстеження статусу повідомлень

#### API Endpoints
- `/send` - відправка повідомлень
- `/templates` - управління шаблонами
- `/templates/:id` - управління конкретним шаблоном
- `/channels` - управління каналами
- `/status` - статус повідомлень

#### Події
- `notification.sent` - відправлено повідомлення
- `notification.delivered` - доставлено повідомлення
- `notification.failed` - помилка відправки повідомлення
- `notification.template.created` - створено шаблон
- `notification.template.updated` - оновлено шаблон

## Розгортання мікросервісів

Кожен мікросервіс упаковується в Docker-контейнер та розгортається в Kubernetes-кластері. Для кожного сервісу створюється окремий Deployment, Service та, за необхідності, Ingress.

### Приклад Dockerfile

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Приклад Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  labels:
    app: order-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
      - name: order-service
        image: registry.example.com/order-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: order-service-secrets
              key: database-url
        - name: RABBITMQ_URL
          valueFrom:
            secretKeyRef:
              name: order-service-secrets
              key: rabbitmq-url
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "100m"
            memory: "256Mi"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Приклад Kubernetes Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

## Моніторинг мікросервісів

Для моніторингу мікросервісів використовується Prometheus та Grafana. Кожен сервіс експортує метрики, які збираються Prometheus та візуалізуються в Grafana.

### Приклад експорту метрик

```javascript
const express = require('express');
const promClient = require('prom-client');

const app = express();

// Створення метрик
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 5, 15, 50, 100, 200, 500, 1000, 2000, 5000, 10000]
});

const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware для вимірювання тривалості запитів
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    
    end({
      method: req.method,
      route,
      status_code: res.statusCode
    });
    
    httpRequestCounter.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });
  });
  
  next();
});

// Endpoint для метрик
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

## Висновки

Мікросервісна архітектура забезпечує гнучкість, масштабованість та стійкість до відмов інформаційної системи управління бізнес-діяльністю підприємства. Кожен мікросервіс відповідає за конкретну бізнес-функцію та може розроблятися, тестуватися, розгортатися та масштабуватися незалежно від інших сервісів. Асинхронна комунікація через події забезпечує слабкий зв'язок між сервісами та підвищує стійкість системи до відмов.

## Додаткові матеріали

- [Загальна архітектура системи](./README.md)
- [Архітектура бази даних](./database.md)
- [Архітектура фронтенду](./frontend.md)
- [Безпека системи](./security.md)
- [Масштабування та відмовостійкість](./scaling.md)
