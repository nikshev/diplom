# CI/CD Пайплайн

Цей документ описує процес безперервної інтеграції та розгортання (CI/CD) для інформаційної системи управління бізнес-діяльністю підприємства.

## Огляд

CI/CD пайплайн автоматизує процеси тестування, збірки та розгортання додатку на різні середовища. Пайплайн налаштований за допомогою GitHub Actions і включає наступні етапи:

1. **Lint** - перевірка якості коду
2. **Security Scan** - сканування безпеки та вразливостей
3. **Test** - запуск автоматизованих тестів
4. **Build** - збірка Docker-образів
5. **Deploy** - розгортання на відповідне середовище
6. **Rollback** - автоматичний відкат у разі помилки

## Середовища розгортання

Система підтримує три середовища розгортання:

1. **Development** - для розробки та тестування нових функцій
2. **Testing** - для інтеграційного тестування
3. **Production** - виробниче середовище

## Стратегія гілок

Пайплайн інтегрований з наступною стратегією гілок:

- **feature/***: розробка нових функцій, розгортається в середовище development
- **develop**: основна гілка розробки, розгортається в середовище testing
- **main**: стабільна версія, розгортається в середовище production
- **release/***: підготовка релізу, розгортається в середовище testing

## Автоматичне розгортання

Розгортання відбувається автоматично при наступних умовах:

- Коміт в гілку **feature/*** → розгортання в **development**
- Коміт в гілку **develop** → розгортання в **testing**
- Коміт в гілку **main** → розгортання в **production**

## Ручне розгортання

Для ручного розгортання використовуйте функцію "workflow_dispatch" в GitHub Actions:

1. Перейдіть до вкладки "Actions" в репозиторії GitHub
2. Виберіть "CI/CD Pipeline" зі списку workflows
3. Натисніть "Run workflow"
4. Виберіть гілку та середовище для розгортання
5. Натисніть "Run workflow"

## Моніторинг розгортання

Статус розгортання можна перевірити:

1. У вкладці "Actions" на GitHub
2. У Slack-каналі #deployments (сповіщення надсилаються автоматично)

## Відкат змін

У разі невдалого розгортання система автоматично виконує відкат до попередньої стабільної версії. Сповіщення про відкат надсилається в Slack-канал #deployments.

## Налаштування секретів

Для роботи CI/CD пайплайну необхідно налаштувати наступні секрети в GitHub:

- `DOCKER_HUB_USERNAME` - ім'я користувача Docker Hub
- `DOCKER_HUB_TOKEN` - токен доступу Docker Hub
- `RAILWAY_TOKEN` - токен доступу Railway
- `SLACK_WEBHOOK` - URL для Slack-сповіщень
- `SNYK_TOKEN` - токен для сканування безпеки Snyk

## Додавання нового сервісу

Для додавання нового мікросервісу до CI/CD пайплайну:

1. Створіть Dockerfile для нового сервісу
2. Додайте назву сервісу до матриці в файлі `.github/workflows/ci-cd.yml`
3. Створіть конфігурації середовища для нового сервісу
4. Переконайтеся, що сервіс має тести та скрипти для міграції бази даних

## Налаштування Railway

Для кожного середовища в Railway необхідно:

1. Створити проект для кожного середовища (development, testing, production)
2. Налаштувати змінні середовища відповідно до конфігурацій
3. Додати сервіси до проектів

## Усунення несправностей

### Помилки збірки

Якщо збірка Docker-образу не вдалася:

1. Перевірте логи збірки в GitHub Actions
2. Переконайтеся, що Dockerfile правильно налаштований
3. Перевірте доступність залежностей

### Помилки розгортання

Якщо розгортання не вдалося:

1. Перевірте логи розгортання в GitHub Actions
2. Переконайтеся, що токен Railway дійсний
3. Перевірте налаштування проекту в Railway

### Помилки тестів

Якщо тести не проходять:

1. Перегляньте звіт про тести в артефактах GitHub Actions
2. Виправте помилки в коді
3. Запустіть тести локально для відтворення проблеми
