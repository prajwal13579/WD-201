"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static async getTodos() {
      return this.findAll();
    }
    
    static async overDue() {
      try{
        return this.findAll({
          where: {
            dueDate: {
              [Op.lt]: new Date(),
            },
            completed: false,
          },
          order: [['id', 'ASC']], 
        })
      }catch (error){
        console.log(error)
      }
    }

    static async dueToday() {
      try{
        return this.findAll({
          where: {
            dueDate:{
            [Op.eq]: new Date(),
          },
          completed: false,
        },
        order: [['id', 'ASC']],
      });
      }catch (error){
        console.log(error)
      }
    }

    static async dueLater() {
      try{
        return this.findAll({
          where: {
            dueDate: {
              [Op.gt]: new Date(),
            },
            completed: false,
          },
          order: [['id', 'ASC']],
        })
      }catch(error){
        console.log(error)
      }
    }

    static async completed(){
      try{
        return this.findAll({
          where: {
            completed: true,
          },
        })
      }catch(error){
        console.log(error)
      }
    }

    setCompletionStatus(bool){
      return this.update({ completed: bool });
    }

    static async remove(id){
      return this.destroy({where: {id: id}})
    }

    static addTodo({title, dueDate}){
      return this.create({title: title, dueDate: dueDate, completed: false});
    }
    
    markAsCompleted() {
      return this.update({ completed: !this.completed });
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
