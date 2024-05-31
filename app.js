// const { connect } = require("./connectDB.js");
// const Todo = require("./TodoModel.js");

// // const createTodo = async () => {
// //   try {
// //     await connect();
// //     const todo = await Todo.addTask({
// //       title: "Second Item",
// //       dueDate: new Date(),
// //       completed: false,
// //     });
// //     console.log(`Created todo with ID : ${todo.id}`);
// //   } catch (error) {
// //     console.error(error);
// //   }
// // };
// // const countItems = async () => {
// //   try {
// //     const totalCount = await Todo.count();
// //     console.log(`Found ${totalCount} items in the table!`);
// //   } catch (error) {
// //     console.error(error);
// //   }
// // };

// const getAllTodos = async () => {
//   try {
//     const todos = await Todo.findAll();
//     const todoList = todos.map((todo) => todo.displayableString()).join("\n");
//     console.log(todoList);
//   } catch (error) {
//     console.error(error);
//   }
// };
// const getSingleTodo = async () => {
//   try {
//     const todo = await Todo.findOne({
//       where: {
//         completed: false,
//       },
//       order: [["id", "DESC"]],
//     });

//     console.log(todo.displayableString());
//   } catch (error) {
//     console.error(error);
//   }
// };
// // const updateItem = async (id) => {
// //   try {
// //     const todo = await Todo.update(
// //       { completed: true },
// //       {
// //         where: {
// //           id: id,
// //         },
// //       }
// //     );

// //     console.log(todo.displayableString());
// //   } catch (error) {
// //     console.error(error);
// //   }
// // };

// const deleteItem = async (id) => {
//   try {
//     const deletedRowCount = await Todo.destroy({
//       where: {
//         id: id,
//       },
//     });

//     console.log(`Deleted ${deletedRowCount} rows!`);
//   } catch (error) {
//     console.error(error);
//   }
// };
// const run = async () => {
//   // await createTodo();
//   // await countItems();
//   await getAllTodos();
//   // await updateItem(2);
//   await deleteItem(2);
//   await getAllTodos();
// };

// run();

// // (async () => {
// //   // await createTodo();
// //   // await countItems();
// //   await getAllTodos();
// //   // await updateItem(2);
// //   await deleteItem(2);
// //   await getAllTodos();
// // })();
// // (async () => {
// //   // await createTodo();
// //   // await countItems();
// //   await getAllTodos();
// //   await updateItem(2);
// //   await getAllTodos();
// // })();
// (async () => {
//   // await createTodo();
//   // await countItems();
//   await getSingleTodo();
// })();
// (async () => {
//   // await createTodo();
//   // await countItems();
//   await getAllTodos();
// })();

// // (async () => {
// //   // await createTodo();
// //   await countItems();
// // })();

// // (async () => {
// //   await createTodo();
// // })();
const express = require('express');
const bodyParser = require('body-parser');
const { Todo } = require('./models');  // Ensure this is the correct path to your models file
const db = require('./models'); 
const path = require('path');

const app = express();
app.use(bodyParser.json());

app.set("view engine","ejs");

app.get('/',async (req,res)=>{
  const allTodos = await Todo.getTodos();
  if(req.accepts('html')){
    const overdueTodos = allTodos.filter(todo => new Date(todo.dueDate) < new Date());
    const dueTodayTodos = allTodos.filter(todo => new Date(todo.dueDate).toDateString() === new Date().toDateString());
    const dueLaterTodos = allTodos.filter(todo => new Date(todo.dueDate) > new Date());
  
    res.render('index', { overdueTodos, dueTodayTodos, dueLaterTodos });
    
  }else{
    res.json(allTodos)
  }
})

app.use(express.static(path.join(__dirname,'public')));

app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.findAll();
    res.json(todos);
    console.log(todos)
  } catch (error) {
    console.error(error);
    res.status(500).json( );
  }
});

app.post('/todos', async (req, res) => {
  console.log('Creating a todo', req.body);
  try {
    const todo = await Todo.addTodo({ title: req.body.title, dueDate: req.body.dueDate });
    res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(422).json(error);
  }
});

app.put('/todos/:id/markAsCompleted', async (req, res) => {
  console.log('We have to update a todo with ID:', req.params.id);
  try {
    const todo = await Todo.findByPk(req.params.id);
    const updatedTodo = await todo.markAsCompleted();
    res.json(updatedTodo);
  } catch (error) {
    console.error(error);
    res.status(422).json(error);
  }
});


app.delete('/todos/:id', async (req, res) => {
  const todoID = req.params.id;
  console.log(`Deleting a todo with ID: ${todoID}`);
  try {
    const result = await db.Todo.destroy({ where: { id: todoID } });
    if (result) {
      res.json({ message: 'Todo deleted successfully' });
    } else {
      res.status(404).json({ message: 'Todo not found' });
    }
  } catch (error) {
    res.status(422).json( error);
  }
});


module.exports = app