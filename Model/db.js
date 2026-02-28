const mysql =require('mysql2')

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "babbuu",   // your database
  "root",     // your username
  "",     // your password
  {
    host: "localhost",   // your host
    dialect: "mysql"     // e.g., 'mysql' | 'postgres' | 'sqlite'
  }
);
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected!");
  } catch (err) {
    console.error("Connection error:", err);
  }
})();

module.exports = sequelize;