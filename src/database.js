const { Sequelize } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(config.DATABASE.name, config.DATABASE.username, config.DATABASE.password, {
  host: config.DATABASE.host,
  dialect: config.DATABASE.dialect
});

module.exports = sequelize;