'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if customers already exist
    const existingCustomers = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM crm_service.customers',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingCustomers[0].count > 0) {
      console.log('Customers already exist, skipping seed data insertion');
      return;
    }

    // Generate 50 customers
    const customers = [];
    const firstNames = [
      'Олександр', 'Марія', 'Андрій', 'Анна', 'Володимир', 'Катерина', 'Дмитро', 'Ольга',
      'Сергій', 'Наталія', 'Михайло', 'Ірина', 'Василь', 'Тетяна', 'Павло', 'Людмила',
      'Юрій', 'Світлана', 'Роман', 'Галина', 'Віктор', 'Лариса', 'Олег', 'Валентина',
      'Ігор', 'Ніна', 'Богдан', 'Раїса', 'Станіслав', 'Любов', 'Артем', 'Оксана',
      'Максим', 'Вікторія', 'Денис', 'Алла', 'Костянтин', 'Лідія', 'Євген', 'Зінаїда',
      'Ростислав', 'Надія', 'Тарас', 'Валерія', 'Ярослав', 'Інна', 'Віталій', 'Жанна',
      'Федір', 'Маргарита'
    ];

    const lastNames = [
      'Іваненко', 'Петренко', 'Сидоренко', 'Коваленко', 'Бондаренко', 'Ткаченко', 'Кравченко',
      'Шевченко', 'Поліщук', 'Лисенко', 'Гриценко', 'Марченко', 'Савченко', 'Руденко',
      'Мельник', 'Король', 'Левченко', 'Дмитренко', 'Романенко', 'Волошин', 'Гончаренко',
      'Павленко', 'Михайленко', 'Андрієнко', 'Васильєв', 'Семенов', 'Федоров', 'Морозов',
      'Новіков', 'Козлов', 'Соколов', 'Волков', 'Зайцев', 'Попов', 'Орлов', 'Медведєв',
      'Лебедєв', 'Егоров', 'Макаров', 'Алексєєв', 'Степанов', 'Сміrnов', 'Васнецов',
      'Кузнецов', 'Никітін', 'Соловйов', 'Борисов', 'Матвєєв', 'Богданов', 'Дмитрієв'
    ];

    const cities = [
      'Київ', 'Харків', 'Одеса', 'Дніпро', 'Донецьк', 'Запоріжжя', 'Львів', 'Кривий Ріг',
      'Миколаїв', 'Маріуполь', 'Луганськ', 'Вінниця', 'Макіївка', 'Севастополь', 'Сімферополь',
      'Херсон', 'Полтава', 'Чернігів', 'Черкаси', 'Житомир', 'Суми', 'Хмельницький',
      'Чернівці', 'Горлівка', 'Рівне', 'Кропивницький', 'Кам\'янське', 'Тернопіль',
      'Івано-Франківськ', 'Кременчук', 'Білгород-Дністровський', 'Краматорськ', 'Мелітополь',
      'Керч', 'Нікополь', 'Слов\'янськ', 'Ужгород', 'Бердянськ', 'Алчевськ', 'Павлоград',
      'Євпаторія', 'Лисичанськ', 'Кам\'янець-Подільський', 'Бровари', 'Дрогобич', 'Конотоп',
      'Умань', 'Мукачево', 'Ялта', 'Коломия'
    ];

    const companyNames = [
      'ТОВ "Україна-Буд"', 'ПП "Київ-Сервіс"', 'ТОВ "Дніпро-Трейд"', 'ПАТ "Харків-Енерго"',
      'ТОВ "Одеса-Логістик"', 'ПП "Львів-Консалт"', 'ТОВ "Запоріжжя-Метал"', 'ПАТ "Полтава-Агро"',
      'ТОВ "Вінниця-ІТ"', 'ПП "Суми-Текстиль"', 'ТОВ "Житомир-Деревообробка"', 'ПАТ "Черкаси-Хім"',
      'ТОВ "Хмельницький-Фарма"', 'ПП "Чернівці-Туризм"', 'ТОВ "Рівне-Електро"', 'ПАТ "Тернопіль-Молоко"',
      'ТОВ "Івано-Франківськ-Нафта"', 'ПП "Ужгород-Вино"', 'ТОВ "Луцьк-Меблі"', 'ПАТ "Кропивницький-Машбуд"'
    ];

    const customerTypes = ['individual', 'business'];
    const statuses = ['active', 'inactive', 'potential'];

    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const city = cities[i % cities.length];
      const customerType = customerTypes[i % customerTypes.length];
      const status = statuses[i % statuses.length];
      
      const customer = {
        id: uuidv4(),
        first_name: firstName,
        last_name: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`,
        phone: `+380${Math.floor(Math.random() * 900000000) + 100000000}`,
        address: `вул. ${['Центральна', 'Головна', 'Шевченка', 'Франка', 'Лесі Українки', 'Грушевського'][i % 6]}, ${Math.floor(Math.random() * 200) + 1}`,
        city: city,
        postal_code: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'Україна',
        status: status,
        type: customerType,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)), // Random date within last year
        updated_at: new Date()
      };

      // Add company fields for business customers
      if (customerType === 'business') {
        customer.company_name = companyNames[i % companyNames.length];
        customer.tax_id = `${Math.floor(Math.random() * 900000000) + 100000000}`;
      }

      customers.push(customer);
    }

    await queryInterface.bulkInsert({
      tableName: 'customers',
      schema: 'crm_service'
    }, customers);

    // Create some contacts for customers
    const contacts = [];
    for (let i = 0; i < 25; i++) { // Create contacts for first 25 customers
      const customer = customers[i];
      contacts.push({
        id: uuidv4(),
        customer_id: customer.id,
        first_name: `Контакт${i + 1}`,
        last_name: `Особа${i + 1}`,
        position: ['Менеджер', 'Директор', 'Координатор', 'Спеціаліст'][i % 4],
        email: `contact${i + 1}@${customer.email.split('@')[1]}`,
        phone: `+380${Math.floor(Math.random() * 900000000) + 100000000}`,
        is_primary: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await queryInterface.bulkInsert({
      tableName: 'contacts',
      schema: 'crm_service'
    }, contacts);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove contacts
    await queryInterface.bulkDelete({
      tableName: 'contacts',
      schema: 'crm_service'
    }, {});

    // Remove customers
    await queryInterface.bulkDelete({
      tableName: 'customers',
      schema: 'crm_service'
    }, {});
  }
};
