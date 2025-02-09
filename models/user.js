const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('./db');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

sequelize.sync(); // Sincronizar o modelo com o banco de dados

module.exports = User;
