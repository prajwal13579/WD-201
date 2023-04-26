"use strict";
const { Model, where, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }

    static addTodo({ title, dueDate, userId }) {
      return this.create({
        userId: userId,
        title: title,
        dueDate: dueDate,
        completed: false,
      });
    }

    static async getTodos(userId) {
      return this.findAll({
        where: {
          userId,
        },
      });
    }

    static async dueToday(userId) {
      try {
        return this.findAll({
          where: {
            dueDate: {
              [Op.eq]: new Date(),
            },
            completed: false,
            userId,
          },
          order: [["id", "ASC"]],
        });
      } catch (error) {
        console.error(error);
      }
    }

    static async overDue(userId) {
      try {
        return this.findAll({
          where: {
            dueDate: {
              [Op.lt]: new Date(),
            },
            completed: false,
            userId,
          },
          order: [["id", "ASC"]], //idk if it still rejects :/
        });
      } catch (error) {
        console.error(error);
      }
    }



    static async dueLater(userId) {
      try {
        return this.findAll({
          where: {
            dueDate: {
              [Op.gt]: new Date(),
            },
            completed: false,
            userId, //shorthand notation for userId: userId, .
          },
          order: [["id", "ASC"]],
        });
      } catch (error) {
        console.error(error);
      }
    }

    static async completed(userId) {
      try {
        return this.findAll({
          where: {
            completed: true,
            userId,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }

    setCompletionStatus(bool) {
      return this.update({ completed: bool });
    }

    markAsCompleted() {
      return this.update({ completed: !this.completed });
    }

    static async remove(id, userId) {
      return this.destroy({ where: { id: id, userId } });
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};