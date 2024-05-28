const { connect } = require("./connectDB.js");
const Todo = require("./TodoModel.js");

// const createTodo = async () => {
//   try {
//     await connect();
//     const todo = await Todo.addTask({
//       title: "Second Item",
//       dueDate: new Date(),
//       completed: false,
//     });
//     console.log(`Created todo with ID : ${todo.id}`);
//   } catch (error) {
//     console.error(error);
//   }
// };
// const countItems = async () => {
//   try {
//     const totalCount = await Todo.count();
//     console.log(`Found ${totalCount} items in the table!`);
//   } catch (error) {
//     console.error(error);
//   }
// };

const getAllTodos = async () => {
  try {
    const todos = await Todo.findAll();
    const todoList = todos.map((todo) => todo.displayableString()).join("\n");
    console.log(todoList);
  } catch (error) {
    console.error(error);
  }
};
const getSingleTodo = async () => {
  try {
    const todo = await Todo.findOne({
      where: {
        completed: false,
      },
      order: [["id", "DESC"]],
    });

    console.log(todo.displayableString());
  } catch (error) {
    console.error(error);
  }
};
// const updateItem = async (id) => {
//   try {
//     const todo = await Todo.update(
//       { completed: true },
//       {
//         where: {
//           id: id,
//         },
//       }
//     );

//     console.log(todo.displayableString());
//   } catch (error) {
//     console.error(error);
//   }
// };

const deleteItem = async (id) => {
  try {
    const deletedRowCount = await Todo.destroy({
      where: {
        id: id,
      },
    });

    console.log(`Deleted ${deletedRowCount} rows!`);
  } catch (error) {
    console.error(error);
  }
};
const run = async () => {
  // await createTodo();
  // await countItems();
  await getAllTodos();
  // await updateItem(2);
  await deleteItem(2);
  await getAllTodos();
};

run();

// (async () => {
//   // await createTodo();
//   // await countItems();
//   await getAllTodos();
//   // await updateItem(2);
//   await deleteItem(2);
//   await getAllTodos();
// })();
// (async () => {
//   // await createTodo();
//   // await countItems();
//   await getAllTodos();
//   await updateItem(2);
//   await getAllTodos();
// })();
(async () => {
  // await createTodo();
  // await countItems();
  await getSingleTodo();
})();
(async () => {
  // await createTodo();
  // await countItems();
  await getAllTodos();
})();

// (async () => {
//   // await createTodo();
//   await countItems();
// })();

// (async () => {
//   await createTodo();
// })();