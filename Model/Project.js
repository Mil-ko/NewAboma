 const sequelize = require("../Model/db");
const { DataTypes } = require("sequelize");

const  Project = sequelize.define(
    "Project", {
    Project_id :{
        type :DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement: true
    },
    project_name :{
        type: DataTypes.STRING,
        allowNull: false
    },
    status : {
        type: DataTypes.ENUM('active', 'completed'),
        allowNull: false,
        defaultValue: 'active'
    }

},
{
    tableName : "projects",
    timestamps : false
}
)

module.exports = Project