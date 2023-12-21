const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');  // Path to your sequelize instance

class Link extends Model {}

Link.init({
  // Define attributes
  discord_server_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  protocol: {
    type: DataTypes.STRING,
    unique: false,
    allowNull: false
  },
  domain: {
    type: DataTypes.STRING,
    unique: false,
    allowNull: false
  },
  api_key: {
    type: DataTypes.STRING,
    unique: false,
    allowNull: false
  }
  // add more attributes as needed
}, {
  sequelize,
  modelName: 'servers'  // This is the table name
});

module.exports = Link;
