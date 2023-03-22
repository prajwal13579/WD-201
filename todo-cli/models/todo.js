"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The models/index file will call this method automatically.
     */
    static async addTask(params) {
      return await Todo.create(params);
    }
    static associate(models) {
      // define association here
    }
    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      const overdue = await this.overdue();
      console.log(overdue.map((item) => item.displayableString()).join("\n"));
      console.log("\n");

      console.log("Due Today");
      const dueToday = await this.dueToday();
      console.log(dueToday.map((item) => item.displayableString()).join("\n"));
      console.log("\n");

      console.log("Due Later");
      const laterdue = await this.dueLater();
      console.log(laterdue.map((item) => item.displayableString()).join("\n"));
      // FILL IN HERE
    }

    static async overdue() {
      try{
        const todo = await Todo.findAll({
          where : {
            dueDate:{
              [Op.lt]: new Date(),
              // completed:false // changed
            },
          },
          order : [["id","ASC"]],
        });
        return todo;
      }catch (error) {
        console.error(error);
      }
    }

    static async dueToday() {
      try{
        const todo = await Todo.findAll({
          where : {
            dueDate:{
              [Op.eq]: new Date(),
            },
          },
          order : [["id","ASC"]],
        });
        return todo;
      }catch (error) {
        console.error(error);
      }
    }

    static async dueLater() {
      try{
        const todo = await Todo.findAll({
          where : {
            dueDate:{
              [Op.gt]: new Date(),
            },
          },
          order : [["id","ASC"]],
        });
        return todo;
      }catch (error) {
        console.error(error);
      }
    }

    static async markAsComplete(id) {
      const status =await Todo.update(
      
        { completed: true },
        {
          where: {
            id: id,
          },
        }
      );
      return status;
    }
    displayableString() {
      var today =new Date().toISOString().slice(0,10);
      return  `${this.id}. ${this.completed ? "[x]" : "[ ]"} ${this.title} ${this.dueDate === today ? "" : this.dueDate}`.trim();
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