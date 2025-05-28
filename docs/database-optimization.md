# Оптимізація бази даних та запитів

Цей документ містить рекомендації та найкращі практики для оптимізації роботи з базою даних PostgreSQL у нашій системі управління бізнес-діяльністю підприємства.

## Індекси

У міграційних файлах вже створено основні індекси для оптимізації найбільш частих запитів. Нижче наведено перелік існуючих індексів та рекомендації щодо їх використання.

### Загальні рекомендації щодо індексів

1. **Використовуйте індекси для полів, які часто використовуються в умовах WHERE, JOIN та ORDER BY**
2. **Уникайте надмірного індексування** - кожен індекс збільшує розмір бази даних та сповільнює операції INSERT, UPDATE та DELETE
3. **Регулярно аналізуйте використання індексів** - використовуйте `EXPLAIN ANALYZE` для перевірки, чи використовуються індекси в запитах
4. **Періодично виконуйте VACUUM та ANALYZE** для оптимізації роботи індексів

### Індекси за сервісами

#### Auth Service

```sql
-- Індекси для таблиці users
CREATE INDEX users_email_idx ON auth_service.users(email);

-- Індекси для таблиці roles
CREATE INDEX roles_name_idx ON auth_service.roles(name);

-- Індекси для таблиці permissions
CREATE INDEX permissions_name_idx ON auth_service.permissions(name);

-- Індекси для таблиці refresh_tokens
CREATE INDEX refresh_tokens_user_id_idx ON auth_service.refresh_tokens(user_id);
CREATE INDEX refresh_tokens_expires_at_idx ON auth_service.refresh_tokens(expires_at);
```

#### Order Service

```sql
-- Індекси для таблиці orders
CREATE INDEX orders_customer_id_idx ON order_service.orders(customer_id);
CREATE UNIQUE INDEX orders_order_number_idx ON order_service.orders(order_number);
CREATE INDEX orders_status_idx ON order_service.orders(status);
CREATE INDEX orders_created_at_idx ON order_service.orders(created_at);

-- Індекси для таблиці order_items
CREATE INDEX order_items_order_id_idx ON order_service.order_items(order_id);
CREATE INDEX order_items_product_id_idx ON order_service.order_items(product_id);

-- Індекси для таблиці order_status_history
CREATE INDEX order_status_history_order_id_idx ON order_service.order_status_history(order_id);
```

#### CRM Service

```sql
-- Індекси для таблиці customers
CREATE UNIQUE INDEX customers_email_idx ON crm_service.customers(email);
CREATE INDEX customers_phone_idx ON crm_service.customers(phone);

-- Індекси для таблиці contacts
CREATE INDEX contacts_customer_id_idx ON crm_service.contacts(customer_id);

-- Індекси для таблиці interactions
CREATE INDEX interactions_customer_id_idx ON crm_service.interactions(customer_id);
CREATE INDEX interactions_date_idx ON crm_service.interactions(date);
```

#### Inventory Service

```sql
-- Індекси для таблиці categories
CREATE INDEX categories_parent_id_idx ON inventory_service.categories(parent_id);

-- Індекси для таблиці products
CREATE UNIQUE INDEX products_sku_idx ON inventory_service.products(sku);
CREATE INDEX products_category_id_idx ON inventory_service.products(category_id);

-- Індекси для таблиці warehouses
CREATE UNIQUE INDEX warehouses_code_idx ON inventory_service.warehouses(code);

-- Індекси для таблиці inventory
CREATE UNIQUE INDEX inventory_product_warehouse_idx ON inventory_service.inventory(product_id, warehouse_id);

-- Індекси для таблиці inventory_transactions
CREATE INDEX inventory_transactions_inventory_id_idx ON inventory_service.inventory_transactions(inventory_id);
CREATE INDEX inventory_transactions_type_idx ON inventory_service.inventory_transactions(type);
CREATE INDEX inventory_transactions_reference_idx ON inventory_service.inventory_transactions(reference_id, reference_type);
```

#### Finance Service

```sql
-- Індекси для таблиці accounts
CREATE UNIQUE INDEX accounts_account_number_idx ON finance_service.accounts(account_number);
CREATE INDEX accounts_type_idx ON finance_service.accounts(type);

-- Індекси для таблиці transaction_categories
CREATE INDEX transaction_categories_parent_id_idx ON finance_service.transaction_categories(parent_id);
CREATE INDEX transaction_categories_type_idx ON finance_service.transaction_categories(type);

-- Індекси для таблиці transactions
CREATE UNIQUE INDEX transactions_transaction_number_idx ON finance_service.transactions(transaction_number);
CREATE INDEX transactions_account_id_idx ON finance_service.transactions(account_id);
CREATE INDEX transactions_target_account_id_idx ON finance_service.transactions(target_account_id);
CREATE INDEX transactions_category_id_idx ON finance_service.transactions(category_id);
CREATE INDEX transactions_transaction_date_idx ON finance_service.transactions(transaction_date);
CREATE INDEX transactions_reference_idx ON finance_service.transactions(reference_id, reference_type);

-- Індекси для таблиці invoices
CREATE UNIQUE INDEX invoices_invoice_number_idx ON finance_service.invoices(invoice_number);
CREATE INDEX invoices_customer_id_idx ON finance_service.invoices(customer_id);
CREATE INDEX invoices_order_id_idx ON finance_service.invoices(order_id);
CREATE INDEX invoices_status_idx ON finance_service.invoices(status);
CREATE INDEX invoices_issue_date_idx ON finance_service.invoices(issue_date);
CREATE INDEX invoices_due_date_idx ON finance_service.invoices(due_date);

-- Індекси для таблиці invoice_items
CREATE INDEX invoice_items_invoice_id_idx ON finance_service.invoice_items(invoice_id);
CREATE INDEX invoice_items_product_id_idx ON finance_service.invoice_items(product_id);

-- Індекси для таблиці invoice_payments
CREATE INDEX invoice_payments_invoice_id_idx ON finance_service.invoice_payments(invoice_id);
CREATE INDEX invoice_payments_transaction_id_idx ON finance_service.invoice_payments(transaction_id);
CREATE INDEX invoice_payments_payment_date_idx ON finance_service.invoice_payments(payment_date);
```

#### Analytics Service

```sql
-- Індекси для таблиці reports
CREATE INDEX reports_created_by_idx ON analytics_service.reports(created_by);
CREATE INDEX reports_updated_at_idx ON analytics_service.reports(updated_at);

-- Індекси для таблиці report_executions
CREATE INDEX report_executions_report_id_idx ON analytics_service.report_executions(report_id);
CREATE INDEX report_executions_execution_date_idx ON analytics_service.report_executions(execution_date);
CREATE INDEX report_executions_status_idx ON analytics_service.report_executions(status);

-- Індекси для таблиці kpi_metrics
CREATE UNIQUE INDEX kpi_metrics_code_idx ON analytics_service.kpi_metrics(code);

-- Індекси для таблиці kpi_values
CREATE INDEX kpi_values_metric_id_idx ON analytics_service.kpi_values(metric_id);
CREATE INDEX kpi_values_date_idx ON analytics_service.kpi_values(date);
```

## Оптимізація запитів

### Загальні рекомендації

1. **Використовуйте EXPLAIN ANALYZE** для аналізу виконання запитів
2. **Обмежуйте кількість результатів** за допомогою LIMIT та OFFSET
3. **Використовуйте конкретні поля** замість SELECT *
4. **Уникайте складних підзапитів** - розбивайте їх на прості запити або використовуйте JOIN
5. **Використовуйте WHERE замість HAVING** де це можливо
6. **Оптимізуйте JOIN операції** - використовуйте правильний порядок таблиць

### Приклади оптимізації запитів

#### Неоптимальний запит

```sql
SELECT * FROM order_service.orders o
WHERE o.status = 'processing' 
AND EXISTS (
  SELECT 1 FROM order_service.order_items oi 
  WHERE oi.order_id = o.id 
  AND oi.quantity > 5
);
```

#### Оптимізований запит

```sql
SELECT o.id, o.order_number, o.customer_id, o.status, o.total_amount, o.created_at
FROM order_service.orders o
JOIN order_service.order_items oi ON o.id = oi.order_id
WHERE o.status = 'processing' 
AND oi.quantity > 5
GROUP BY o.id;
```

### Використання партиціонування

Для таблиць з великою кількістю даних (наприклад, історія транзакцій, логи) рекомендується використовувати партиціонування за датою:

```sql
CREATE TABLE finance_service.transactions (
    id UUID PRIMARY KEY,
    transaction_date TIMESTAMP NOT NULL,
    -- інші поля
) PARTITION BY RANGE (transaction_date);

CREATE TABLE finance_service.transactions_2023 PARTITION OF finance_service.transactions
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE finance_service.transactions_2024 PARTITION OF finance_service.transactions
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE finance_service.transactions_2025 PARTITION OF finance_service.transactions
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

## Кешування

### Рівні кешування

1. **Кешування на рівні бази даних**
   - Використовуйте налаштування `shared_buffers` та `effective_cache_size` в PostgreSQL
   
2. **Кешування на рівні запитів**
   - Використовуйте Redis або Memcached для кешування результатів частих запитів
   
3. **Кешування на рівні ORM**
   - Використовуйте другий рівень кешування в Sequelize або SQLAlchemy

### Приклад кешування з Redis

```javascript
const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

async function getOrderWithCache(orderId) {
  // Спроба отримати з кешу
  const cachedOrder = await getAsync(`order:${orderId}`);
  if (cachedOrder) {
    return JSON.parse(cachedOrder);
  }
  
  // Якщо немає в кеші, отримуємо з бази даних
  const order = await Order.findByPk(orderId, {
    include: [
      { model: OrderItem, as: 'items' },
      { model: OrderStatusHistory, as: 'statusHistory' }
    ]
  });
  
  // Зберігаємо в кеш на 5 хвилин
  await setAsync(`order:${orderId}`, JSON.stringify(order), 'EX', 300);
  
  return order;
}
```

## Моніторинг продуктивності

### Інструменти моніторингу

1. **pg_stat_statements** - для аналізу продуктивності запитів
2. **pgBadger** - для аналізу логів PostgreSQL
3. **Prometheus + Grafana** - для моніторингу метрик бази даних

### Налаштування pg_stat_statements

```sql
-- Додати розширення до бази даних
CREATE EXTENSION pg_stat_statements;

-- Налаштування в postgresql.conf
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
pg_stat_statements.max = 10000
```

### Запити для аналізу продуктивності

```sql
-- Найповільніші запити
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Запити з найбільшою кількістю рядків
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY rows DESC
LIMIT 10;

-- Найчастіші запити
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;
```

## Регулярне обслуговування

### Рекомендовані операції обслуговування

1. **VACUUM ANALYZE** - для оновлення статистики та видалення мертвих рядків
2. **REINDEX** - для перебудови індексів
3. **Резервне копіювання** - регулярне створення резервних копій бази даних

### Скрипт для автоматичного обслуговування

```bash
#!/bin/bash

# Шлях до файлу з параметрами підключення
CONFIG_FILE="/path/to/db_config"

# Функція для виконання VACUUM ANALYZE
function vacuum_analyze() {
  echo "Running VACUUM ANALYZE..."
  psql -f "$CONFIG_FILE" -c "VACUUM ANALYZE;"
}

# Функція для перебудови індексів
function reindex() {
  echo "Running REINDEX..."
  psql -f "$CONFIG_FILE" -c "REINDEX DATABASE erp_system;"
}

# Функція для створення резервної копії
function backup() {
  echo "Creating backup..."
  pg_dump -f "$CONFIG_FILE" -F c -f "/path/to/backups/erp_system_$(date +%Y%m%d).dump" erp_system
}

# Виконання операцій
vacuum_analyze
reindex
backup

echo "Database maintenance completed successfully."
```

## Висновки

Оптимізація бази даних є важливою частиною розробки та підтримки системи. Регулярний моніторинг та обслуговування бази даних допоможуть забезпечити високу продуктивність та стабільність роботи системи.

Рекомендується регулярно переглядати та оновлювати стратегію оптимізації бази даних відповідно до змін у системі та зростання обсягів даних.
