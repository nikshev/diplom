/**
 * Interaction model for CRM service
 */

module.exports = (sequelize, DataTypes) => {
  const Interaction = sequelize.define('Interaction', {
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['call', 'email', 'meeting', 'note', 'task']]
      }
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
    tableName: 'interactions',
    schema: 'crm_service',
    timestamps: true,
    underscored: true
  });

  Interaction.associate = function(models) {
    Interaction.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      as: 'customer'
    });
  };

  return Interaction;
};
