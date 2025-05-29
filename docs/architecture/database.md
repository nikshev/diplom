# Архітектура бази даних

## Огляд

Архітектура бази даних інформаційної системи управління бізнес-діяльністю підприємства побудована на принципах мікросервісної архітектури, де кожен мікросервіс має власну базу даних. Це забезпечує незалежність та ізоляцію даних, а також можливість незалежного масштабування та розвитку кожного сервісу.

## Ключові принципи

1. **Database per Service** - кожен мікросервіс має власну базу даних, що забезпечує незалежність та ізоляцію даних.
2. **Polyglot Persistence** - використання різних типів баз даних відповідно до потреб кожного сервісу.
3. **Eventual Consistency** - забезпечення узгодженості даних між сервісами через асинхронні події.
4. **CQRS (Command Query Responsibility Segregation)** - розділення операцій читання та запису для оптимізації продуктивності.
5. **Data Denormalization** - денормалізація даних для оптимізації запитів та зменшення залежностей між сервісами.

## Технології

Основною СУБД для системи є PostgreSQL, яка забезпечує надійність, продуктивність та підтримку JSON для гнучкості схеми даних. Крім того, використовуються:

- **Redis** - для кешування, сесій та тимчасових даних
- **Elasticsearch** - для повнотекстового пошуку та аналітики
- **MongoDB** - для зберігання документів та логів

## Загальна структура

Кожен мікросервіс має власну базу даних з наступною загальною структурою:

1. **Основні таблиці** - зберігають основні дані сервісу
2. **Допоміжні таблиці** - зберігають додаткові дані та метадані
3. **Таблиці зв'язків** - забезпечують зв'язки між даними
4. **Таблиці історії** - зберігають історію змін даних
5. **Таблиці налаштувань** - зберігають налаштування сервісу

## Схема бази даних

Повна схема бази даних доступна в [database-er-diagram.puml](../database-er-diagram.puml). Нижче наведено загальний опис основних модулів бази даних.

### Модуль автентифікації та авторизації

Модуль автентифікації та авторизації містить таблиці для зберігання інформації про користувачів, ролі, дозволи та сесії.

**Основні таблиці:**
- `users` - інформація про користувачів
- `roles` - ролі користувачів
- `permissions` - дозволи
- `role_permissions` - зв'язок між ролями та дозволами
- `user_roles` - зв'язок між користувачами та ролями
- `sessions` - сесії користувачів
- `password_reset_tokens` - токени для відновлення паролю

### Модуль замовлень

Модуль замовлень містить таблиці для зберігання інформації про замовлення, їх статуси, елементи та процес обробки.

**Основні таблиці:**
- `orders` - інформація про замовлення
- `order_items` - елементи замовлень
- `order_statuses` - статуси замовлень
- `order_history` - історія змін замовлень
- `shipping` - інформація про доставку
- `payments` - інформація про платежі

### Модуль клієнтів

Модуль клієнтів містить таблиці для зберігання інформації про клієнтів, їх контактну інформацію та історію взаємодії.

**Основні таблиці:**
- `customers` - інформація про клієнтів
- `customer_addresses` - адреси клієнтів
- `customer_contacts` - контактна інформація клієнтів
- `customer_groups` - групи клієнтів
- `customer_notes` - примітки до клієнтів
- `loyalty_programs` - програми лояльності
- `loyalty_points` - бали лояльності

### Модуль товарів

Модуль товарів містить таблиці для зберігання інформації про товари, категорії, характеристики та ціни.

**Основні таблиці:**
- `products` - інформація про товари
- `product_categories` - категорії товарів
- `product_attributes` - характеристики товарів
- `product_attribute_values` - значення характеристик товарів
- `product_images` - зображення товарів
- `product_prices` - ціни товарів
- `product_variants` - варіанти товарів

### Модуль товарних запасів

Модуль товарних запасів містить таблиці для зберігання інформації про запаси товарів, склади та переміщення.

**Основні таблиці:**
- `inventory` - інформація про запаси
- `warehouses` - склади
- `inventory_movements` - переміщення товарів
- `inventory_reservations` - резервування товарів
- `inventory_adjustments` - коригування запасів
- `inventory_history` - історія змін запасів

### Модуль фінансів

Модуль фінансів містить таблиці для зберігання інформації про фінансові операції, рахунки та звіти.

**Основні таблиці:**
- `transactions` - фінансові транзакції
- `accounts` - рахунки
- `invoices` - рахунки-фактури
- `invoice_items` - елементи рахунків-фактур
- `payments` - платежі
- `payment_methods` - методи оплати
- `financial_periods` - фінансові періоди

### Модуль аналітики

Модуль аналітики містить таблиці для зберігання агрегованих даних та метрик для аналізу.

**Основні таблиці:**
- `metrics` - метрики
- `reports` - звіти
- `dashboards` - дашборди
- `analytics_settings` - налаштування аналітики
- `data_exports` - експорт даних

### Модуль інтеграції

Модуль інтеграції містить таблиці для зберігання інформації про інтеграції з зовнішніми сервісами.

**Основні таблиці:**
- `integration_settings` - налаштування інтеграцій
- `integration_logs` - логи інтеграцій
- `external_shipments` - зовнішні відправлення
- `external_orders` - зовнішні замовлення
- `external_products` - зовнішні товари
- `sync_history` - історія синхронізації

## Міграції та версіонування

Для управління схемою бази даних та її еволюцією використовується система міграцій, яка забезпечує:

1. **Версіонування схеми** - кожна зміна схеми має версію та може бути застосована або відкочена
2. **Автоматичне застосування** - міграції автоматично застосовуються при розгортанні сервісу
3. **Ідемпотентність** - міграції можуть бути застосовані кілька разів без побічних ефектів
4. **Транзакційність** - міграції виконуються в транзакціях для забезпечення цілісності даних

Приклад міграції для створення таблиці замовлень:

```javascript
// migrations/20250101000000_create_orders_table.js
exports.up = function(knex) {
  return knex.schema.createTable('orders', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('order_number').unique().notNullable();
    table.uuid('customer_id').notNullable();
    table.enum('status', ['pending', 'processing', 'completed', 'cancelled']).defaultTo('pending');
    table.decimal('total_amount', 10, 2).notNullable();
    table.string('currency').defaultTo('UAH');
    table.enum('payment_status', ['pending', 'paid', 'refunded', 'failed']).defaultTo('pending');
    table.enum('shipping_status', ['pending', 'shipped', 'delivered', 'returned']).defaultTo('pending');
    table.text('notes');
    table.timestamps(true, true);
    
    table.foreign('customer_id').references('id').inTable('customers').onDelete('CASCADE');
    table.index(['customer_id', 'status']);
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('orders');
};
```

## Доступ до даних

Для доступу до даних використовується шаблон Repository, який абстрагує логіку доступу до бази даних від бізнес-логіки. Це забезпечує:

1. **Абстракцію** - бізнес-логіка не залежить від конкретної реалізації доступу до даних
2. **Тестування** - можливість легко мокати репозиторії для тестування
3. **Оптимізацію** - можливість оптимізувати запити без зміни бізнес-логіки
4. **Кешування** - можливість додавати кешування на рівні репозиторію

Приклад репозиторію для роботи з замовленнями:

```javascript
// repositories/orderRepository.js
const { Order, OrderItem } = require('../models');
const { Op } = require('sequelize');

class OrderRepository {
  async findAll(options = {}) {
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
    
    if (filters.customerId) {
      whereClause.customerId = filters.customerId;
    }
    
    if (filters.startDate && filters.endDate) {
      whereClause.createdAt = {
        [Op.between]: [filters.startDate, filters.endDate]
      };
    }
    
    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: options.include || []
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
  }
  
  async findById(id, options = {}) {
    return Order.findByPk(id, {
      include: options.include || []
    });
  }
  
  async create(orderData) {
    const transaction = await Order.sequelize.transaction();
    
    try {
      const order = await Order.create({
        customerId: orderData.customerId,
        status: 'pending',
        totalAmount: orderData.items.reduce((total, item) => total + (item.price * item.quantity), 0),
        currency: orderData.currency || 'UAH',
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
  }
  
  async update(id, orderData) {
    const transaction = await Order.sequelize.transaction();
    
    try {
      const order = await Order.findByPk(id, { transaction });
      
      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }
      
      await order.update(orderData, { transaction });
      
      await transaction.commit();
      
      return order;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async delete(id) {
    const transaction = await Order.sequelize.transaction();
    
    try {
      const order = await Order.findByPk(id, { transaction });
      
      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }
      
      await order.destroy({ transaction });
      
      await transaction.commit();
      
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new OrderRepository();
```

## Кешування

Для оптимізації продуктивності використовується кешування на різних рівнях:

1. **Кешування запитів** - кешування результатів запитів до бази даних
2. **Кешування об'єктів** - кешування об'єктів в пам'яті
3. **Кешування сторінок** - кешування HTML-сторінок або частин сторінок

Для кешування використовується Redis, який забезпечує швидкий доступ до даних та підтримку різних типів даних.

Приклад кешування запитів:

```javascript
// services/productService.js
const productRepository = require('../repositories/productRepository');
const cache = require('../utils/cache');

class ProductService {
  async getProductById(id) {
    const cacheKey = `product:${id}`;
    
    // Спроба отримати дані з кешу
    const cachedProduct = await cache.get(cacheKey);
    
    if (cachedProduct) {
      return JSON.parse(cachedProduct);
    }
    
    // Якщо дані не знайдено в кеші, отримуємо їх з бази даних
    const product = await productRepository.findById(id, {
      include: ['category', 'attributes', 'images']
    });
    
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }
    
    // Зберігаємо дані в кеші на 1 годину
    await cache.set(cacheKey, JSON.stringify(product), 3600);
    
    return product;
  }
  
  async updateProduct(id, productData) {
    const product = await productRepository.update(id, productData);
    
    // Інвалідуємо кеш
    await cache.delete(`product:${id}`);
    
    return product;
  }
}

module.exports = new ProductService();
```

## Резервне копіювання та відновлення

Для забезпечення надійності та захисту даних використовується система резервного копіювання, яка забезпечує:

1. **Повне резервне копіювання** - щоденне повне резервне копіювання всіх баз даних
2. **Інкрементальне резервне копіювання** - щогодинне інкрементальне резервне копіювання змін
3. **Point-in-time recovery** - можливість відновлення бази даних на будь-який момент часу
4. **Географічне резервування** - зберігання резервних копій в різних географічних регіонах

## Моніторинг та аудит

Для забезпечення надійності та безпеки бази даних використовується система моніторингу та аудиту, яка забезпечує:

1. **Моніторинг продуктивності** - відстеження продуктивності запитів та використання ресурсів
2. **Моніторинг доступності** - відстеження доступності бази даних
3. **Аудит змін** - відстеження змін в схемі та даних
4. **Аудит доступу** - відстеження доступу до бази даних

## Висновки

Архітектура бази даних інформаційної системи управління бізнес-діяльністю підприємства побудована на принципах мікросервісної архітектури, де кожен мікросервіс має власну базу даних. Це забезпечує незалежність та ізоляцію даних, а також можливість незалежного масштабування та розвитку кожного сервісу. Використання PostgreSQL як основної СУБД забезпечує надійність, продуктивність та підтримку JSON для гнучкості схеми даних.

## Додаткові матеріали

- [Загальна архітектура системи](./README.md)
- [Архітектура мікросервісів](./microservices.md)
- [Архітектура фронтенду](./frontend.md)
- [Безпека системи](./security.md)
- [Масштабування та відмовостійкість](./scaling.md)
