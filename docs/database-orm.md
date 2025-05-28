# Налаштування ORM та міграцій

Цей документ описує налаштування ORM (Object-Relational Mapping) та міграцій для інформаційної системи управління бізнес-діяльністю підприємства.

## Загальний підхід

Система використовує різні ORM для різних типів мікросервісів:

- **Node.js сервіси**: [Sequelize](https://sequelize.org/) - потужний ORM для Node.js, який підтримує PostgreSQL
- **Python сервіси**: [SQLAlchemy](https://www.sqlalchemy.org/) - гнучкий ORM для Python

## Структура бази даних

Кожен мікросервіс має свою окрему схему в базі даних PostgreSQL:

- `auth_service` - схема для сервісу автентифікації
- `crm_service` - схема для CRM сервісу
- `order_service` - схема для сервісу замовлень
- `inventory_service` - схема для сервісу управління товарами
- `finance_service` - схема для фінансового сервісу
- `analytics_service` - схема для аналітичного сервісу

## Node.js сервіси (Sequelize)

### Структура директорій

```
/backend
  /<service-name>
    /models         # Моделі даних
    /migrations     # Міграційні скрипти
```

### Моделі

Моделі визначають структуру таблиць та їх зв'язки. Кожна модель знаходиться в окремому файлі в директорії `models`.

Приклад моделі користувача:

```javascript
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    // інші поля...
  }, {
    tableName: 'users',
    schema: 'auth_service',
    timestamps: true,
    underscored: true
  });

  User.associate = function(models) {
    // визначення зв'язків
  };

  return User;
};
```

### Міграції

Міграції дозволяють керувати змінами структури бази даних. Кожна міграція знаходиться в окремому файлі в директорії `migrations`.

Приклад міграції:

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      // інші поля...
    }, {
      schema: 'auth_service'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({ tableName: 'users', schema: 'auth_service' });
  }
};
```

## Python сервіси (SQLAlchemy)

### Структура директорій

```
/backend
  /analytics-service
    /database
      /models.py     # Моделі даних
    /migrations      # Міграційні скрипти (Alembic)
```

### Моделі

Моделі визначають структуру таблиць та їх зв'язки. Всі моделі знаходяться в файлі `models.py`.

Приклад моделі звіту:

```python
class Report(Base):
    __tablename__ = 'reports'
    __table_args__ = {'schema': 'analytics_service'}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    # інші поля...
    
    # зв'язки
    executions = relationship("ReportExecution", back_populates="report")
```

### Міграції (Alembic)

Для Python сервісів використовується Alembic для керування міграціями.

## Спільний модуль для роботи з базою даних

Для спрощення роботи з базою даних створено спільні модулі:

- `backend/shared/database.js` - для Node.js сервісів
- `backend/shared/migrations.js` - для керування міграціями Node.js сервісів

## Команди для роботи з базою даних

### Запуск міграцій

```bash
# Запуск міграцій для всіх сервісів
npm run db:migrate

# Запуск міграцій для конкретного сервісу
npm run db:migrate:auth
npm run db:migrate:order
npm run db:migrate:crm
npm run db:migrate:inventory
npm run db:migrate:finance

# Відкат міграцій
npm run db:rollback

# Перевірка статусу міграцій
npm run db:status

# Створення нової міграції
npm run db:create-migration <service-name> create <migration-name>
```

### Запуск міграцій для Python сервісу

```bash
# Перейти в директорію сервісу
cd backend/analytics-service

# Створення нової міграції
alembic revision --autogenerate -m "description"

# Запуск міграцій
alembic upgrade head

# Відкат міграцій
alembic downgrade -1

# Перевірка статусу міграцій
alembic current
```

## Налаштування підключення до бази даних

Підключення до бази даних налаштовується через змінні середовища:

- `DB_HOST` - хост бази даних
- `DB_PORT` - порт бази даних
- `DB_NAME` - назва бази даних
- `DB_USER` - користувач бази даних
- `DB_PASSWORD` - пароль бази даних

Ці змінні визначені в файлах конфігурації середовища для кожного сервісу.

## Робота з моделями

### Node.js (Sequelize)

```javascript
// Ініціалізація бази даних
const db = await require('./models').init();

// Створення запису
const user = await db.User.create({
  email: 'user@example.com',
  password_hash: 'password123',
  first_name: 'John',
  last_name: 'Doe'
});

// Пошук запису
const user = await db.User.findOne({
  where: { email: 'user@example.com' }
});

// Оновлення запису
await user.update({ first_name: 'Jane' });

// Видалення запису
await user.destroy();
```

### Python (SQLAlchemy)

```python
from database.connection import get_db_session
from database.models import Report

# Створення запису
with get_db_session() as session:
    report = Report(
        name='Monthly Sales Report',
        type='sales',
        created_by=user_id
    )
    session.add(report)

# Пошук запису
with get_db_session() as session:
    report = session.query(Report).filter(Report.name == 'Monthly Sales Report').first()

# Оновлення запису
with get_db_session() as session:
    report = session.query(Report).filter(Report.id == report_id).first()
    report.name = 'Updated Report Name'

# Видалення запису
with get_db_session() as session:
    report = session.query(Report).filter(Report.id == report_id).first()
    session.delete(report)
```

## Транзакції

### Node.js (Sequelize)

```javascript
const transaction = await db.sequelize.transaction();

try {
  // Операції в рамках транзакції
  await db.User.create({ ... }, { transaction });
  await db.Role.create({ ... }, { transaction });
  
  // Підтвердження транзакції
  await transaction.commit();
} catch (error) {
  // Відкат транзакції у разі помилки
  await transaction.rollback();
  throw error;
}
```

### Python (SQLAlchemy)

```python
from database.connection import SessionFactory

session = SessionFactory()
try:
    # Операції в рамках транзакції
    report = Report(...)
    session.add(report)
    
    execution = ReportExecution(...)
    session.add(execution)
    
    # Підтвердження транзакції
    session.commit()
except Exception as e:
    # Відкат транзакції у разі помилки
    session.rollback()
    raise e
finally:
    session.close()
```

## Рекомендації

1. **Використовуйте міграції** для всіх змін структури бази даних
2. **Визначайте зв'язки** між таблицями на рівні моделей
3. **Використовуйте транзакції** для операцій, які змінюють кілька таблиць
4. **Не використовуйте raw SQL** без крайньої необхідності
5. **Індексуйте поля**, які часто використовуються в запитах WHERE, JOIN та ORDER BY
