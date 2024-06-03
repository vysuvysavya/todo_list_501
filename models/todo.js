// models/todo.js
'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
  //   static async addTask(params) {
  //     return await Todo.create(params);
  //   }

  //   static async showList() {
  //     console.log("My Todo list\n");

  //     console.log("Overdue");
  //     const overdueItems = await this.overdue();
  //     overdueItems.forEach(item => console.log(item.displayableString()));
  //     console.log("\n");

  //     console.log("Due Today");
  //     const dueTodayItems = await this.dueToday();
  //     dueTodayItems.forEach(item => console.log(item.displayableString()));
  //     console.log("\n");

  //     console.log("Due Later");
  //     const dueLaterItems = await this.dueLater();
  //     dueLaterItems.forEach(item => console.log(item.displayableString()));
  //   }

  //   static async overdue() {
  //     const today = new Date().toISOString().split('T')[0];
  //     return await Todo.findAll({
  //       where: {
  //         dueDate: {
  //           [Op.lt]: today
  //         },
  //         completed: false
  //       },
  //       order: [['dueDate', 'ASC']]
  //     });
  //   }

  //   static async dueToday() {
  //     const today = new Date().toISOString().split('T')[0];
  //     return await Todo.findAll({
  //       where: {
  //         dueDate: today,
  //         completed: false
  //       },
  //       order: [['dueDate', 'ASC']]
  //     });
  //   }

  //   static async dueLater() {
  //     const today = new Date().toISOString().split('T')[0];
  //     return await Todo.findAll({
  //       where: {
  //         dueDate: {
  //           [Op.gt]: today
  //         },
  //         completed: false
  //       },
  //       order: [['dueDate', 'ASC']]
  //     });
  //   }

  //   static async markAsComplete(id) {
  //     const todo = await Todo.findByPk(id);
  //     if (todo) {
  //       todo.completed = true;
  //       await todo.save();
  //     }
  //   }

    static associate(models) {
      // define association here if needed
    }

  //   displayableString() {
  //     const checkbox = this.completed ? "[x]" : "[ ]";
  //     const dueDateString = this.dueDate ? this.dueDate : "";
  //     return `${this.id}. ${checkbox} ${this.title.trim()} ${dueDateString}`;
  //   }
  // }
  static getTodos(){
    return this.findAll({ order: [['dueDate', 'ASC']] });
  }
    static addTodo({title,dueDate}){
      return this.create({title:title, dueDate:dueDate, completed:false})
    }

    setCompletionStatus = async function (completed) {
      this.completed = completed;
      await this.save();
      return this;
    }
    
    static async remove (id){
      return this.destroy({
        where:{
           id,
          }
      })
    }

  }
  Todo.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    sequelize,
    modelName: 'Todo',
  });

  return Todo;
};
