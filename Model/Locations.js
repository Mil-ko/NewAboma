 const sequelize = require("../Model/db");
const { DataTypes } = require("sequelize");
const Location = sequelize.define(
  "Location",
  {
    location_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    location_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
   status: {
    type: DataTypes.ENUM('store', 'site'),
    allowNull: false,
    defaultValue: 'store'
  }
    ,
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "locations", // exact table name
    timestamps: true        // disable createdAt/updatedAt
  }
);

module.exports = Location;