'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Generate 50 orders
    const orders = [];
    const orderItems = [];
    
    const statuses = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];
    const shippingMethods = ['Нова Пошта', 'Укрпошта', 'Кур\'єр', 'Самовивіз', 'Meest Express'];
    const paymentMethods = ['Готівка', 'Картка', 'Банківський переказ', 'Накладений платіж', 'PayPal'];
    
    const cities = [
      'Київ', 'Харків', 'Одеса', 'Дніпро', 'Донецьк', 'Запоріжжя', 'Львів', 'Кривий Ріг',
      'Миколаїв', 'Маріуполь', 'Луганськ', 'Вінниця', 'Макіївка', 'Севастополь', 'Сімферополь',
      'Херсон', 'Полтава', 'Чернігів', 'Черкаси', 'Житомир', 'Суми', 'Хмельницький',
      'Чернівці', 'Горлівка', 'Рівне', 'Кропивницький', 'Кам\'янське', 'Тернопіль',
      'Івано-Франківськ', 'Кременчук'
    ];

    // Generate some sample customer IDs and product IDs
    // In a real scenario, these would be fetched from the respective services
    const sampleCustomerIds = [];
    const sampleProductIds = [];
    
    for (let i = 0; i < 50; i++) {
      sampleCustomerIds.push(uuidv4());
      sampleProductIds.push(uuidv4());
    }

    for (let i = 0; i < 50; i++) {
      const customerId = sampleCustomerIds[i % sampleCustomerIds.length];
      const status = statuses[i % statuses.length];
      const city = cities[i % cities.length];
      const shippingMethod = shippingMethods[i % shippingMethods.length];
      const paymentMethod = paymentMethods[i % paymentMethods.length];
      
      const orderId = uuidv4();
      const orderNumber = `ORD-${String(i + 1).padStart(6, '0')}`;
      
      // Generate random order date within last 6 months
      const orderDate = new Date(Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000));
      
      // Generate 1-5 items per order
      const itemCount = Math.floor(Math.random() * 5) + 1;
      let totalAmount = 0;
      
      for (let j = 0; j < itemCount; j++) {
        const productId = sampleProductIds[Math.floor(Math.random() * sampleProductIds.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;
        const unitPrice = Math.floor(Math.random() * 5000) + 100; // Price from 100 to 5100
        const totalPrice = quantity * unitPrice;
        totalAmount += totalPrice;
        
        orderItems.push({
          id: uuidv4(),
          order_id: orderId,
          product_id: productId,
          quantity: quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          created_at: orderDate,
          updated_at: orderDate
        });
      }
      
      const order = {
        id: orderId,
        customer_id: customerId,
        order_number: orderNumber,
        status: status,
        total_amount: totalAmount,
        shipping_address: `вул. ${['Центральна', 'Головна', 'Шевченка', 'Франка', 'Лесі Українки', 'Грушевського'][i % 6]}, ${Math.floor(Math.random() * 200) + 1}`,
        shipping_city: city,
        shipping_postal_code: `${Math.floor(Math.random() * 90000) + 10000}`,
        shipping_country: 'Україна',
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        notes: i % 3 === 0 ? `Замовлення №${orderNumber}. Додаткові побажання клієнта.` : null,
        created_at: orderDate,
        updated_at: orderDate
      };
      
      orders.push(order);
    }

    // Insert orders
    await queryInterface.bulkInsert({
      tableName: 'orders',
      schema: 'order_service'
    }, orders);

    // Insert order items
    await queryInterface.bulkInsert({
      tableName: 'order_items',
      schema: 'order_service'
    }, orderItems);

    console.log(`Created ${orders.length} orders with ${orderItems.length} order items`);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove order items first (due to foreign key constraint)
    await queryInterface.bulkDelete({
      tableName: 'order_items',
      schema: 'order_service'
    }, {});

    // Remove orders
    await queryInterface.bulkDelete({
      tableName: 'orders',
      schema: 'order_service'
    }, {});
  }
};
