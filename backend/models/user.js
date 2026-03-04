const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tenantId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'ID de la sucursal/negocio principal'
  },
  branchId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'ID de la sucursal física asignada'
  },
  role: {
    type: DataTypes.ENUM('SUPER_ADMIN', 'ADMIN', 'OWNER', 'EMPLOYEE', 'USER'),
    allowNull: false,
    defaultValue: 'EMPLOYEE'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACTIVE', 'BLOCKED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  ownerId: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  maxUsers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  },
  shift: {
    type: DataTypes.ENUM('Matutino', 'Vespertino'),
    allowNull: true
  },
  lastConnection: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

User.prototype.isAdmin = function () {
  return ['SUPER_ADMIN', 'ADMIN'].includes(this.role);
};

User.prototype.isOwner = function () {
  return ['SUPER_ADMIN', 'ADMIN', 'OWNER'].includes(this.role);
};

module.exports = User;