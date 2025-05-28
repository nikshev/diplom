/**
 * Customer model for CRM service
 */

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Україна'
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'active'
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'customers',
    schema: 'crm_service',
    timestamps: true,
    underscored: true
  });

  Customer.associate = function(models) {
    Customer.hasMany(models.Contact, {
      foreignKey: 'customer_id',
      as: 'contacts'
    });
    
    Customer.hasMany(models.Interaction, {
      foreignKey: 'customer_id',
      as: 'interactions'
    });
  };

  // Віртуальне поле для повного імені
  Customer.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
  };

  return Customer;
};
