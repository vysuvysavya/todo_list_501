'use strict'
const { Model, Op } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      Todo.belongsTo(models.User, { foreignKey: 'userId' });
    }
    
    static getTodos () {
      return this.findAll()
    }

    static overdueTodos (userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date()
          },
          userId,
          completed: false
        }
      })
    }

    static dueLaterTodos (userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date()
          },
          userId,
          completed: false
        }
      })
    }

    static dueTodayTodos (userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date()
          },
          userId,
          completed: false
        }
      })
    }

    static completedTodos (userId) {
      return this.findAll({
        where: {
          completed: true,
          userId
        }
      })
    }

    static addTodo (title, dueDate, userId) {
      try {
        return this.create({ title, dueDate, completed: false, userId })
      } catch (error) {
        console.error('Error adding a task', error)
      }
    }

    static remove (id, userId) {
      return this.destroy({
        where: {
          id,
          userId
        }
      })
    }

    static async setCompletionStatus(id, userId, status) {
      try {
        const [numRows, [updatedTodo]] = await this.update({ completed: status }, {
          returning: true,
          where: {
            id,
            userId,
          },
        });
        if (numRows === 0) {
          throw new Error('Todo not found or unauthorized');
        }
        return updatedTodo;
      } catch (error) {
        console.error('Error marking a task as completed', error);
        throw error;
      }
    }
  }  
  
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        }
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notEmpty: true,
        }
      },
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Todo',
    }
  );
  return Todo;
};
