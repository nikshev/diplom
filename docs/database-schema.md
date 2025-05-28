# Схема бази даних

Цей документ описує схему бази даних для інформаційної системи управління бізнес-діяльністю підприємства.

## Загальна структура

Система використовує PostgreSQL як основну базу даних. Кожен мікросервіс має свою окрему схему в базі даних для забезпечення ізоляції даних.

## Схеми бази даних

### 1. Схема auth_service

Схема для сервісу автентифікації та авторизації.

#### Таблиці

##### users
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор користувача |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email користувача |
| password_hash | VARCHAR(255) | NOT NULL | Хеш пароля |
| first_name | VARCHAR(100) | NOT NULL | Ім'я користувача |
| last_name | VARCHAR(100) | NOT NULL | Прізвище користувача |
| phone | VARCHAR(20) | | Телефон користувача |
| role | VARCHAR(50) | NOT NULL | Роль користувача (admin, manager, employee) |
| is_active | BOOLEAN | DEFAULT TRUE | Чи активний користувач |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### roles
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор ролі |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Назва ролі |
| description | TEXT | | Опис ролі |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### permissions
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор дозволу |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Назва дозволу |
| description | TEXT | | Опис дозволу |
| resource | VARCHAR(100) | NOT NULL | Ресурс, до якого надається доступ |
| action | VARCHAR(50) | NOT NULL | Дія (read, write, delete, etc.) |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### role_permissions
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| role_id | UUID | FOREIGN KEY (roles.id) | Ідентифікатор ролі |
| permission_id | UUID | FOREIGN KEY (permissions.id) | Ідентифікатор дозволу |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |

##### refresh_tokens
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор токена |
| user_id | UUID | FOREIGN KEY (users.id) | Ідентифікатор користувача |
| token | VARCHAR(255) | UNIQUE, NOT NULL | Токен оновлення |
| expires_at | TIMESTAMP | NOT NULL | Дата закінчення терміну дії |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |

#### Індекси
- `users_email_idx` на `users(email)` для швидкого пошуку користувачів за email
- `refresh_tokens_user_id_idx` на `refresh_tokens(user_id)` для швидкого пошуку токенів користувача

### 2. Схема crm_service

Схема для CRM-сервісу, який керує інформацією про клієнтів.

#### Таблиці

##### customers
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор клієнта |
| first_name | VARCHAR(100) | NOT NULL | Ім'я клієнта |
| last_name | VARCHAR(100) | NOT NULL | Прізвище клієнта |
| email | VARCHAR(255) | UNIQUE | Email клієнта |
| phone | VARCHAR(20) | | Телефон клієнта |
| address | TEXT | | Адреса клієнта |
| city | VARCHAR(100) | | Місто |
| postal_code | VARCHAR(20) | | Поштовий індекс |
| country | VARCHAR(100) | | Країна |
| status | VARCHAR(50) | DEFAULT 'active' | Статус клієнта (active, inactive) |
| type | VARCHAR(50) | | Тип клієнта (individual, business) |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### contacts
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор контакту |
| customer_id | UUID | FOREIGN KEY (customers.id) | Ідентифікатор клієнта |
| first_name | VARCHAR(100) | NOT NULL | Ім'я контакту |
| last_name | VARCHAR(100) | NOT NULL | Прізвище контакту |
| position | VARCHAR(100) | | Посада |
| email | VARCHAR(255) | | Email контакту |
| phone | VARCHAR(20) | | Телефон контакту |
| is_primary | BOOLEAN | DEFAULT FALSE | Чи є основним контактом |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### interactions
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор взаємодії |
| customer_id | UUID | FOREIGN KEY (customers.id) | Ідентифікатор клієнта |
| user_id | UUID | NOT NULL | Ідентифікатор користувача |
| type | VARCHAR(50) | NOT NULL | Тип взаємодії (call, email, meeting) |
| subject | VARCHAR(255) | NOT NULL | Тема взаємодії |
| description | TEXT | | Опис взаємодії |
| date | TIMESTAMP | NOT NULL | Дата взаємодії |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

#### Індекси
- `customers_email_idx` на `customers(email)` для швидкого пошуку клієнтів за email
- `customers_phone_idx` на `customers(phone)` для швидкого пошуку клієнтів за телефоном
- `contacts_customer_id_idx` на `contacts(customer_id)` для швидкого пошуку контактів клієнта
- `interactions_customer_id_idx` на `interactions(customer_id)` для швидкого пошуку взаємодій з клієнтом
- `interactions_date_idx` на `interactions(date)` для швидкого пошуку взаємодій за датою

### 3. Схема order_service

Схема для сервісу управління замовленнями.

#### Таблиці

##### orders
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор замовлення |
| customer_id | UUID | NOT NULL | Ідентифікатор клієнта |
| order_number | VARCHAR(50) | UNIQUE, NOT NULL | Номер замовлення |
| status | VARCHAR(50) | NOT NULL | Статус замовлення (new, processing, shipped, delivered, cancelled) |
| total_amount | DECIMAL(10, 2) | NOT NULL | Загальна сума замовлення |
| shipping_address | TEXT | | Адреса доставки |
| shipping_city | VARCHAR(100) | | Місто доставки |
| shipping_postal_code | VARCHAR(20) | | Поштовий індекс доставки |
| shipping_country | VARCHAR(100) | | Країна доставки |
| shipping_method | VARCHAR(100) | | Метод доставки |
| payment_method | VARCHAR(100) | | Метод оплати |
| notes | TEXT | | Примітки до замовлення |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### order_items
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор елемента замовлення |
| order_id | UUID | FOREIGN KEY (orders.id) | Ідентифікатор замовлення |
| product_id | UUID | NOT NULL | Ідентифікатор товару |
| quantity | INTEGER | NOT NULL | Кількість |
| unit_price | DECIMAL(10, 2) | NOT NULL | Ціна за одиницю |
| total_price | DECIMAL(10, 2) | NOT NULL | Загальна ціна |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### order_status_history
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор запису |
| order_id | UUID | FOREIGN KEY (orders.id) | Ідентифікатор замовлення |
| status | VARCHAR(50) | NOT NULL | Статус замовлення |
| comment | TEXT | | Коментар до зміни статусу |
| user_id | UUID | NOT NULL | Ідентифікатор користувача, який змінив статус |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |

#### Індекси
- `orders_customer_id_idx` на `orders(customer_id)` для швидкого пошуку замовлень клієнта
- `orders_order_number_idx` на `orders(order_number)` для швидкого пошуку замовлень за номером
- `orders_status_idx` на `orders(status)` для швидкого пошуку замовлень за статусом
- `orders_created_at_idx` на `orders(created_at)` для швидкого пошуку замовлень за датою
- `order_items_order_id_idx` на `order_items(order_id)` для швидкого пошуку елементів замовлення
- `order_status_history_order_id_idx` на `order_status_history(order_id)` для швидкого пошуку історії статусів замовлення

### 4. Схема inventory_service

Схема для сервісу управління товарними залишками.

#### Таблиці

##### products
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор товару |
| sku | VARCHAR(50) | UNIQUE, NOT NULL | Артикул товару |
| name | VARCHAR(255) | NOT NULL | Назва товару |
| description | TEXT | | Опис товару |
| category_id | UUID | FOREIGN KEY (categories.id) | Ідентифікатор категорії |
| price | DECIMAL(10, 2) | NOT NULL | Ціна товару |
| cost | DECIMAL(10, 2) | | Собівартість товару |
| weight | DECIMAL(10, 2) | | Вага товару |
| dimensions | VARCHAR(100) | | Розміри товару |
| is_active | BOOLEAN | DEFAULT TRUE | Чи активний товар |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### categories
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор категорії |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Назва категорії |
| description | TEXT | | Опис категорії |
| parent_id | UUID | FOREIGN KEY (categories.id) | Ідентифікатор батьківської категорії |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### inventory
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор запису |
| product_id | UUID | FOREIGN KEY (products.id) | Ідентифікатор товару |
| warehouse_id | UUID | FOREIGN KEY (warehouses.id) | Ідентифікатор складу |
| quantity | INTEGER | NOT NULL | Кількість |
| reserved_quantity | INTEGER | DEFAULT 0 | Зарезервована кількість |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### warehouses
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор складу |
| name | VARCHAR(100) | NOT NULL | Назва складу |
| address | TEXT | | Адреса складу |
| city | VARCHAR(100) | | Місто |
| postal_code | VARCHAR(20) | | Поштовий індекс |
| country | VARCHAR(100) | | Країна |
| is_active | BOOLEAN | DEFAULT TRUE | Чи активний склад |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### inventory_transactions
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор транзакції |
| product_id | UUID | FOREIGN KEY (products.id) | Ідентифікатор товару |
| warehouse_id | UUID | FOREIGN KEY (warehouses.id) | Ідентифікатор складу |
| type | VARCHAR(50) | NOT NULL | Тип транзакції (in, out, transfer, adjustment) |
| quantity | INTEGER | NOT NULL | Кількість |
| reference_id | UUID | | Ідентифікатор пов'язаного документа (замовлення, тощо) |
| reference_type | VARCHAR(50) | | Тип пов'язаного документа |
| notes | TEXT | | Примітки |
| user_id | UUID | NOT NULL | Ідентифікатор користувача |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |

#### Індекси
- `products_sku_idx` на `products(sku)` для швидкого пошуку товарів за артикулом
- `products_category_id_idx` на `products(category_id)` для швидкого пошуку товарів за категорією
- `inventory_product_id_warehouse_id_idx` на `inventory(product_id, warehouse_id)` для швидкого пошуку залишків товару на складі
- `inventory_transactions_product_id_idx` на `inventory_transactions(product_id)` для швидкого пошуку транзакцій товару
- `inventory_transactions_created_at_idx` на `inventory_transactions(created_at)` для швидкого пошуку транзакцій за датою

### 5. Схема finance_service

Схема для фінансового сервісу.

#### Таблиці

##### transactions
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор транзакції |
| type | VARCHAR(50) | NOT NULL | Тип транзакції (income, expense, transfer) |
| amount | DECIMAL(10, 2) | NOT NULL | Сума транзакції |
| currency | VARCHAR(3) | DEFAULT 'UAH' | Валюта |
| account_id | UUID | FOREIGN KEY (accounts.id) | Ідентифікатор рахунку |
| category_id | UUID | FOREIGN KEY (transaction_categories.id) | Ідентифікатор категорії |
| description | TEXT | | Опис транзакції |
| reference_id | UUID | | Ідентифікатор пов'язаного документа |
| reference_type | VARCHAR(50) | | Тип пов'язаного документа |
| transaction_date | DATE | NOT NULL | Дата транзакції |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### accounts
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор рахунку |
| name | VARCHAR(100) | NOT NULL | Назва рахунку |
| type | VARCHAR(50) | NOT NULL | Тип рахунку (cash, bank, credit) |
| currency | VARCHAR(3) | DEFAULT 'UAH' | Валюта |
| balance | DECIMAL(10, 2) | DEFAULT 0 | Баланс рахунку |
| is_active | BOOLEAN | DEFAULT TRUE | Чи активний рахунок |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### transaction_categories
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор категорії |
| name | VARCHAR(100) | NOT NULL | Назва категорії |
| type | VARCHAR(50) | NOT NULL | Тип категорії (income, expense) |
| parent_id | UUID | FOREIGN KEY (transaction_categories.id) | Ідентифікатор батьківської категорії |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### invoices
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор рахунку |
| invoice_number | VARCHAR(50) | UNIQUE, NOT NULL | Номер рахунку |
| customer_id | UUID | NOT NULL | Ідентифікатор клієнта |
| order_id | UUID | | Ідентифікатор замовлення |
| amount | DECIMAL(10, 2) | NOT NULL | Сума рахунку |
| tax_amount | DECIMAL(10, 2) | DEFAULT 0 | Сума податку |
| total_amount | DECIMAL(10, 2) | NOT NULL | Загальна сума |
| currency | VARCHAR(3) | DEFAULT 'UAH' | Валюта |
| status | VARCHAR(50) | NOT NULL | Статус рахунку (draft, sent, paid, cancelled) |
| due_date | DATE | NOT NULL | Дата оплати |
| notes | TEXT | | Примітки |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### invoice_items
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор елемента рахунку |
| invoice_id | UUID | FOREIGN KEY (invoices.id) | Ідентифікатор рахунку |
| description | TEXT | NOT NULL | Опис елемента |
| quantity | DECIMAL(10, 2) | NOT NULL | Кількість |
| unit_price | DECIMAL(10, 2) | NOT NULL | Ціна за одиницю |
| tax_rate | DECIMAL(5, 2) | DEFAULT 0 | Ставка податку |
| amount | DECIMAL(10, 2) | NOT NULL | Сума |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

#### Індекси
- `transactions_account_id_idx` на `transactions(account_id)` для швидкого пошуку транзакцій рахунку
- `transactions_category_id_idx` на `transactions(category_id)` для швидкого пошуку транзакцій за категорією
- `transactions_transaction_date_idx` на `transactions(transaction_date)` для швидкого пошуку транзакцій за датою
- `invoices_customer_id_idx` на `invoices(customer_id)` для швидкого пошуку рахунків клієнта
- `invoices_order_id_idx` на `invoices(order_id)` для швидкого пошуку рахунків за замовленням
- `invoices_status_idx` на `invoices(status)` для швидкого пошуку рахунків за статусом
- `invoices_due_date_idx` на `invoices(due_date)` для швидкого пошуку рахунків за датою оплати
- `invoice_items_invoice_id_idx` на `invoice_items(invoice_id)` для швидкого пошуку елементів рахунку

### 6. Схема analytics_service

Схема для аналітичного сервісу.

#### Таблиці

##### reports
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор звіту |
| name | VARCHAR(255) | NOT NULL | Назва звіту |
| description | TEXT | | Опис звіту |
| type | VARCHAR(50) | NOT NULL | Тип звіту (sales, inventory, finance) |
| parameters | JSONB | | Параметри звіту |
| created_by | UUID | NOT NULL | Ідентифікатор користувача |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### report_executions
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор виконання звіту |
| report_id | UUID | FOREIGN KEY (reports.id) | Ідентифікатор звіту |
| parameters | JSONB | | Параметри виконання |
| result | JSONB | | Результат виконання |
| status | VARCHAR(50) | NOT NULL | Статус виконання (pending, running, completed, failed) |
| executed_by | UUID | NOT NULL | Ідентифікатор користувача |
| started_at | TIMESTAMP | DEFAULT NOW() | Дата початку виконання |
| completed_at | TIMESTAMP | | Дата завершення виконання |

##### kpi_metrics
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор метрики |
| name | VARCHAR(100) | NOT NULL | Назва метрики |
| description | TEXT | | Опис метрики |
| category | VARCHAR(50) | NOT NULL | Категорія метрики (sales, inventory, finance) |
| calculation_query | TEXT | | SQL-запит для розрахунку метрики |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |
| updated_at | TIMESTAMP | DEFAULT NOW() | Дата оновлення |

##### kpi_values
| Поле | Тип | Обмеження | Опис |
|------|-----|-----------|------|
| id | UUID | PRIMARY KEY | Унікальний ідентифікатор значення |
| metric_id | UUID | FOREIGN KEY (kpi_metrics.id) | Ідентифікатор метрики |
| value | DECIMAL(15, 2) | NOT NULL | Значення метрики |
| period_start | DATE | NOT NULL | Початок періоду |
| period_end | DATE | NOT NULL | Кінець періоду |
| created_at | TIMESTAMP | DEFAULT NOW() | Дата створення |

#### Індекси
- `reports_type_idx` на `reports(type)` для швидкого пошуку звітів за типом
- `report_executions_report_id_idx` на `report_executions(report_id)` для швидкого пошуку виконань звіту
- `report_executions_status_idx` на `report_executions(status)` для швидкого пошуку виконань за статусом
- `kpi_metrics_category_idx` на `kpi_metrics(category)` для швидкого пошуку метрик за категорією
- `kpi_values_metric_id_idx` на `kpi_values(metric_id)` для швидкого пошуку значень метрики
- `kpi_values_period_start_end_idx` на `kpi_values(period_start, period_end)` для швидкого пошуку значень за періодом

## Зв'язки між схемами

Для забезпечення цілісності даних між різними схемами використовуються зовнішні ключі та події бази даних. Наприклад:

1. Замовлення (order_service.orders) посилаються на клієнтів (crm_service.customers)
2. Транзакції інвентаря (inventory_service.inventory_transactions) можуть посилатися на замовлення (order_service.orders)
3. Фінансові транзакції (finance_service.transactions) можуть посилатися на замовлення або рахунки

## Стратегія міграцій

Для кожного мікросервісу створюються окремі міграційні скрипти, які виконуються в рамках розгортання сервісу. Міграції використовують систему версіонування для відстеження змін схеми бази даних.

## Оптимізація продуктивності

Для оптимізації продуктивності бази даних використовуються:

1. Індекси на полях, які часто використовуються в запитах WHERE, JOIN та ORDER BY
2. Партиціонування таблиць з великим обсягом даних (наприклад, transactions, inventory_transactions)
3. Матеріалізовані представлення для складних аналітичних запитів
4. Кешування результатів запитів на рівні додатку
