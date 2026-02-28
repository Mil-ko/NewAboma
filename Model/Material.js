 const sequelize = require("../Model/db");
const { DataTypes } = require("sequelize");
const Material = sequelize.define(
  "Material",
  {
    material_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
   
  },
  {
    tableName: "materials", // exact table name
    timestamps: false        // disable createdAt/updatedAt
  }
);

module.exports = Material;