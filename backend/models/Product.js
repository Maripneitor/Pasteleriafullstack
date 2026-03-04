const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
    tenantId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 1 },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    basePrice: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    cost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    category: { type: DataTypes.STRING, defaultValue: 'General' },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    leadTime: { type: DataTypes.STRING, defaultValue: 'Inmediato' }, // 'Inmediato' or 'Bajo Pedido'
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
    tableName: 'products',
    timestamps: true
});

module.exports = Product;
