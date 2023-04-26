"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Todo, {
        foreignKey: "userId",
      });
    }
    static async allusers() {
      return this.findAll({});
    }

    static async deleteUser() {
      return this.destroy({ truncate: { cascade: true } });
    }
  }
  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len: { args: 1, msg: "FirstName Required" },
        },
      },
      lastName: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "Credentials already existing , Try Sign-in",
        },
        validate: {
          notNull: true,
          len: {
            args: 1,
            msg: "Email Required",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          async isNotNullString(value) {
            if (await bcrypt.compare("", value)) {
              throw new Error("Password Required");
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};