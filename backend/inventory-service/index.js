require('dotenv').config();
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'inventory-service' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

const app = express();
const PORT = process.env.PORT || 8004;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'erp_inventory',
  process.env.DB_USER || 'admin',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

// Define Product model
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  reorderLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
});

// Define Inventory Transaction model
const InventoryTransaction = sequelize.define('InventoryTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('purchase', 'sale', 'adjustment', 'return'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  referenceId: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT
  }
});

// Define relationships
Product.hasMany(InventoryTransaction, { foreignKey: 'productId' });
InventoryTransaction.belongsTo(Product, { foreignKey: 'productId' });

// Sync models with database
sequelize.sync({ alter: true })
  .then(() => {
    logger.info('Database synchronized');
  })
  .catch(err => {
    logger.error('Error synchronizing database:', err);
  });

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'inventory-service' });
});

// Create product endpoint
app.post('/products', async (req, res) => {
  try {
    const { name, sku, description, category, price, costPrice, stockQuantity, reorderLevel } = req.body;
    
    // Check if product already exists
    const existingProduct = await Product.findOne({ where: { sku } });
    if (existingProduct) {
      return res.status(409).json({ message: 'Product with this SKU already exists' });
    }
    
    // Create product
    const product = await Product.create({
      name,
      sku,
      description,
      category,
      price,
      costPrice,
      stockQuantity,
      reorderLevel
    });
    
    // Create initial inventory transaction if stock quantity > 0
    if (stockQuantity > 0) {
      await InventoryTransaction.create({
        productId: product.id,
        type: 'adjustment',
        quantity: stockQuantity,
        notes: 'Initial inventory'
      });
    }
    
    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    logger.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all products endpoint
app.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    
    res.status(200).json({ products });
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get product by ID endpoint
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findOne({
      where: { id }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({ product });
  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update product endpoint
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, costPrice, reorderLevel, status } = req.body;
    
    const product = await Product.findOne({ where: { id } });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update product
    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.price = price || product.price;
    product.costPrice = costPrice || product.costPrice;
    product.reorderLevel = reorderLevel || product.reorderLevel;
    product.status = status || product.status;
    
    await product.save();
    
    res.status(200).json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    logger.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update stock quantity endpoint
app.post('/products/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, quantity, referenceId, notes } = req.body;
    
    const product = await Product.findOne({ where: { id } });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Calculate new stock quantity
    let newStockQuantity;
    if (type === 'purchase' || type === 'return') {
      newStockQuantity = product.stockQuantity + quantity;
    } else if (type === 'sale') {
      if (product.stockQuantity < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      newStockQuantity = product.stockQuantity - quantity;
    } else if (type === 'adjustment') {
      newStockQuantity = product.stockQuantity + quantity; // Can be negative for reduction
    }
    
    // Update product stock
    product.stockQuantity = newStockQuantity;
    await product.save();
    
    // Create inventory transaction
    const transaction = await InventoryTransaction.create({
      productId: id,
      type,
      quantity,
      referenceId,
      notes
    });
    
    res.status(200).json({
      message: 'Stock updated successfully',
      product,
      transaction
    });
  } catch (error) {
    logger.error('Error updating stock:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get low stock products endpoint
app.get('/products/low-stock', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        stockQuantity: {
          [Sequelize.Op.lt]: Sequelize.col('reorderLevel')
        },
        status: 'active'
      }
    });
    
    res.status(200).json({ products });
  } catch (error) {
    logger.error('Error fetching low stock products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get inventory transactions for a product endpoint
app.get('/products/:id/transactions', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findOne({ where: { id } });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const transactions = await InventoryTransaction.findAll({
      where: { productId: id },
      order: [['date', 'DESC']]
    });
    
    res.status(200).json({ transactions });
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Inventory Service running on port ${PORT}`);
});
