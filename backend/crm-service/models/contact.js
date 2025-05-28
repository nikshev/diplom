/**
 * Contact model for CRM service
 */

module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define('Contact', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    tableName: 'contacts',
    schema: 'crm_service',
    timestamps: true,
    underscored: true,
    hooks: {
      afterCreate: async (contact, options) => {
        // Якщо це перший контакт клієнта і він відмічений як основний,
        // або якщо контакт відмічений як основний, оновлюємо інші контакти
        if (contact.is_primary) {
          await sequelize.models.Contact.update(
            { is_primary: false },
            { 
              where: { 
                customer_id: contact.customer_id,
                id: { [sequelize.Sequelize.Op.ne]: contact.id }
              },
              transaction: options.transaction
            }
          );
        }
      },
      afterUpdate: async (contact, options) => {
        // Якщо контакт відмічений як основний, оновлюємо інші контакти
        if (contact.is_primary) {
          await sequelize.models.Contact.update(
            { is_primary: false },
            { 
              where: { 
                customer_id: contact.customer_id,
                id: { [sequelize.Sequelize.Op.ne]: contact.id }
              },
              transaction: options.transaction
            }
          );
        }
      }
    }
  });

  Contact.associate = function(models) {
    Contact.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      as: 'customer'
    });
  };

  // Віртуальне поле для повного імені
  Contact.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
  };

  return Contact;
};
