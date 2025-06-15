#!/bin/bash

echo "🔍 Діагностика віддаленого сервера ERP системи"
echo "=============================================="

# Перевірка статусу всіх контейнерів
echo "📋 Статус контейнерів:"
docker-compose ps

echo ""
echo "🔗 Перевірка мережевого з'єднання між сервісами:"

# Перевірка доступності сервісів зсередини API Gateway
echo "   API Gateway -> CRM Service:"
docker-compose exec api-gateway curl -f -s http://crm-service:8003/health || echo "   ❌ CRM Service недоступний"

echo "   API Gateway -> Inventory Service:"
docker-compose exec api-gateway curl -f -s http://inventory-service:8004/health || echo "   ❌ Inventory Service недоступний"

echo "   API Gateway -> Order Service:"
docker-compose exec api-gateway curl -f -s http://order-service:8002/health || echo "   ❌ Order Service недоступний"

echo "   API Gateway -> Auth Service:"
docker-compose exec api-gateway curl -f -s http://auth-service:8001/health || echo "   ❌ Auth Service недоступний"

echo ""
echo "🗄️  Перевірка підключення до бази даних:"
echo "   PostgreSQL:"
docker-compose exec postgres psql -U admin -d erp_crm -c "SELECT 1;" || echo "   ❌ PostgreSQL недоступний"

echo ""
echo "📊 Логи сервісів (останні 20 рядків):"
echo "   API Gateway:"
docker-compose logs --tail=20 api-gateway

echo ""
echo "   CRM Service:"
docker-compose logs --tail=20 crm-service

echo ""
echo "   Auth Service:"
docker-compose logs --tail=20 auth-service

echo ""
echo "🌐 Перевірка портів ззовні:"
echo "   Порт 3000 (Frontend):"
curl -f -s http://localhost:3000 > /dev/null && echo "   ✅ Доступний" || echo "   ❌ Недоступний"

echo "   Порт 8000 (API Gateway):"
curl -f -s http://localhost:8000/health > /dev/null && echo "   ✅ Доступний" || echo "   ❌ Недоступний"

echo ""
echo "🔧 Рекомендації для виправлення:"
echo "1. Якщо сервіси не запущені - запустіть: docker-compose up -d"
echo "2. Якщо проблеми з мережею - перезапустіть: docker-compose down && docker-compose up -d"
echo "3. Якщо проблеми з базою даних - перевірте міграції: docker-compose exec [service] npm run db:migrate"
echo "4. Якщо порт 8000 недоступний ззовні - відкрийте порт у firewall або налаштуйте проксування"
