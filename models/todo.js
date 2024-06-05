'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }

    static getTodos() {
      return this.findAll({ order: [['dueDate', 'ASC']] });
    }

    static addTodo({ title, dueDate,userId }) {
      return this.create({ title, dueDate, completed: false ,userId});
    }
    static async overdue(userId){
      return this.findAll({
        where:{
          dueDate:{
            [Op.lt] : new Date(),
          },
          userId,
          completed:false,
        },
      })
    }
    static async dueLater(userId){
      return this.findAll({
        where:{
          dueDate:{
            [Op.gt] : new Date(),
          },
          userId,
          completed:false,
        },
      })
    }
    static async dueToday(userId){
      return this.findAll({
        where:{
          dueDate:{
            [Op.eq] : new Date(),
          },
          userId,
          completed:false,
        },
      })
    }
    static async completed(userId){
      return this.findAll({
        where:{
          completed:true,
          userId
        },
      })
    }
    async setCompletionStatus(completed) {
      this.completed = completed;
      await this.save();
      return this;
    }

    static async remove(id,userId) {
      return this.destroy({
        where: {
          id,
          userId
        },
      });
    }
  }

  Todo.init(
    {
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
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
    },
    {
      sequelize, // Pass the sequelize instance here
      modelName: 'Todo',
    }
  );

  return Todo;
};
