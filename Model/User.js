// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db"); // your sequelize instance

const User = sequelize.define("User", {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userName: { type: DataTypes.STRING, allowNull: false },
  Fname: { type: DataTypes.STRING, allowNull: false },
  jobPosition: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
},
{
  tableName: "users", // exact table name
  timestamps: false    // optional: disable createdAt/updatedAt
});

module.exports = User;