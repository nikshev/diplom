'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, create some categories
    const categories = [
      {
        id: uuidv4(),
        name: 'Електроніка',
        description: 'Електронні пристрої та гаджети',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Одяг',
        description: 'Одяг та аксесуари',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Дім і сад',
        description: 'Товари для дому та саду',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Спорт',
        description: 'Спортивні товари та обладнання',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Книги',
        description: 'Книги та навчальні матеріали',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert({
      tableName: 'categories',
      schema: 'inventory_service'
    }, categories);

    // Create a warehouse
    const warehouseId = uuidv4();
    await queryInterface.bulkInsert({
      tableName: 'warehouses',
      schema: 'inventory_service'
    }, [{
      id: warehouseId,
      name: 'Головний склад',
      code: 'MAIN001',
      address: 'вул. Складська, 1',
      city: 'Київ',
      postal_code: '01001',
      country: 'Україна',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Generate 50 products
    const products = [];
    const productNames = [
      'Смартфон Samsung Galaxy', 'iPhone 15', 'Ноутбук Dell XPS', 'Планшет iPad Air',
      'Навушники Sony WH-1000XM4', 'Телевізор LG OLED', 'Миша Logitech MX Master',
      'Клавіатура Corsair K95', 'Монітор ASUS ProArt', 'Принтер HP LaserJet',
      'Футболка Nike', 'Джинси Levi\'s 501', 'Кросівки Adidas Ultraboost',
      'Куртка The North Face', 'Сукня Zara', 'Сорочка Hugo Boss',
      'Кепка New Era', 'Рюкзак Fjällräven', 'Окуляри Ray-Ban', 'Годинник Casio',
      'Кавоварка DeLonghi', 'Пилосос Dyson V15', 'Мікрохвильовка Samsung',
      'Холодильник Bosch', 'Пральна машина LG', 'Посудомийна машина Siemens',
      'Тостер Philips', 'Блендер Vitamix', 'Мультиварка Redmond', 'Чайник Tefal',
      'М\'яч футбольний Nike', 'Ракетка тенісна Wilson', 'Велосипед Trek',
      'Гантелі 10кг', 'Килимок для йоги', 'Фітнес-браслет Fitbit',
      'Протеїн Optimum Nutrition', 'Кросівки для бігу Asics', 'Рюкзак спортивний',
      'Пляшка для води Hydro Flask', 'Роман "1984"', 'Підручник з математики',
      'Енциклопедія Britannica', 'Словник англійської мови', 'Атлас світу',
      'Комікс Marvel', 'Журнал National Geographic', 'Дитяча книга казок',
      'Кулінарна книга', 'Біографія Стіва Джобса'
    ];

    for (let i = 0; i < 50; i++) {
      const categoryId = categories[i % categories.length].id;
      const productName = productNames[i % productNames.length];
      
      products.push({
        id: uuidv4(),
        sku: `SKU${String(i + 1).padStart(5, '0')}`,
        name: `${productName} ${i + 1}`,
        description: `Опис для ${productName} ${i + 1}. Високоякісний товар з відмінними характеристиками.`,
        category_id: categoryId,
        price: Math.floor(Math.random() * 10000) + 100, // Ціна від 100 до 10100
        cost: Math.floor(Math.random() * 5000) + 50, // Собівартість від 50 до 5050
        weight: (Math.random() * 10 + 0.1).toFixed(2), // Вага від 0.1 до 10.1 кг
        weight_unit: 'kg',
        dimensions: {
          length: Math.floor(Math.random() * 100) + 10,
          width: Math.floor(Math.random() * 100) + 10,
          height: Math.floor(Math.random() * 100) + 10
        },
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await queryInterface.bulkInsert({
      tableName: 'products',
      schema: 'inventory_service'
    }, products);

    // Create inventory records for products
    const inventoryRecords = products.map(product => ({
      id: uuidv4(),
      product_id: product.id,
      warehouse_id: warehouseId,
      quantity: Math.floor(Math.random() * 1000) + 10, // Кількість від 10 до 1010
      reserved_quantity: Math.floor(Math.random() * 50), // Зарезервовано від 0 до 50
      low_stock_threshold: Math.floor(Math.random() * 20) + 5, // Поріг від 5 до 25
      track_inventory: true,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert({
      tableName: 'inventory',
      schema: 'inventory_service'
    }, inventoryRecords);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove inventory records
    await queryInterface.bulkDelete({
      tableName: 'inventory',
      schema: 'inventory_service'
    }, {});

    // Remove products
    await queryInterface.bulkDelete({
      tableName: 'products',
      schema: 'inventory_service'
    }, {});

    // Remove warehouses
    await queryInterface.bulkDelete({
      tableName: 'warehouses',
      schema: 'inventory_service'
    }, {});

    // Remove categories
    await queryInterface.bulkDelete({
      tableName: 'categories',
      schema: 'inventory_service'
    }, {});
  }
};
