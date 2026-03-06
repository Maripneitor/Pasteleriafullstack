const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CashCut = sequelize.define('CashCut', {
    date: { type: DataTypes.DATEONLY, allowNull: false },
    tenantId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 1 },
    branchId: { type: DataTypes.BIGINT, allowNull: true },
    createdByUserId: { type: DataTypes.BIGINT, allowNull: true },
    totalIncome: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    totalExpense: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    finalBalance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    
    // Breakdown
    incomeCash: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    incomeCard: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    incomeTransfer: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },

    // Audit (Arqueo)
    physicalCount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    difference: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },

    closedAt: { type: DataTypes.DATE, allowNull: true },
    closedByUserId: { type: DataTypes.BIGINT, allowNull: true },
    status: { type: DataTypes.ENUM('Open', 'Closed'), defaultValue: 'Open' },
    notes: { type: DataTypes.TEXT, allowNull: true },
    emailStatus: { type: DataTypes.ENUM('PENDING', 'SENT', 'FAILED'), defaultValue: 'PENDING' },
    emailTo: { type: DataTypes.STRING, allowNull: true },
    emailError: { type: DataTypes.TEXT, allowNull: true }
}, {
    tableName: 'cash_cuts',
    indexes: [
        { unique: true, fields: ['date', 'tenantId', 'branchId'] }
    ]
});

const CashMovement = sequelize.define('CashMovement', {
    type: { type: DataTypes.ENUM('Income', 'Expense'), allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    paymentMethod: { type: DataTypes.ENUM('Efectivo', 'Tarjeta', 'Transferencia'), defaultValue: 'Efectivo' },
    status: { type: DataTypes.ENUM('Completado', 'Cancelado'), defaultValue: 'Completado' },
    tenantId: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 1 },
    branchId: { type: DataTypes.BIGINT, allowNull: true },
    category: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    referenceId: { type: DataTypes.STRING, allowNull: true },
    performedByUserId: { type: DataTypes.BIGINT, allowNull: false }
}, { tableName: 'cash_movements' });

CashMovement.belongsTo(CashCut, { foreignKey: 'cashCutId' });
CashCut.hasMany(CashMovement, { foreignKey: 'cashCutId' });

module.exports = { CashCut, CashMovement };
