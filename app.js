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
const { Todo,User } = require('./models');  
const db = require('./models'); 
const path = require('path');
const csrf = require('tiny-csrf')
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const saltRounds = 10;
const { title } = require('process');
const app = express();


const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const LocalStrategy = require('passport-local');
const { error } = require('console');

app.use(session({
  secret:'my-super-secret-key-3122817622345656',
  cookie:{
    maxAge : 24*60*60*1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField : 'email',
  passwordField : 'password'
},(username,password,done)=>{
  User.findOne({where:{email:username,password:password}})
    .then((user)=>{
      return done(null,user)
    }).catch((err) => {
      return (err)
    })
}))

passport.serializeUser((user,done)=>{
  console.log("Serialising user in session",user.id)
  done(null,user.id)
});

passport.deserializeUser((id,none)=>{
  User.findByPk(id)
  .then(user=>{
    done(null,user)
  })
  .catch(error=>{
    done(error,null)
  })
})

app.use(bodyParser.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser('ssh some secret string!'));
app.use(
  csrf(
    "123456789iamasecret987654321look", 
    ["POST",'PUT','DELETE'] 
)

);
app.set("view engine","ejs");

app.get('/',async (req,res)=>{
    res.render('index', {
      title : 'Todo application',
      csrfToken : req.csrfToken()
    })
})

app.get('/todos', connectEnsureLogin.ensureLoggedIn(),async (req,res)=>{
  const allTodos = await Todo.getTodos();
  if(req.accepts('html')){
    const overdueTodos = allTodos.filter(todo => new Date(todo.dueDate) < new Date());
    const dueTodayTodos = allTodos.filter(todo => new Date(todo.dueDate).toDateString() === new Date().toDateString());
    const dueLaterTodos = allTodos.filter(todo => new Date(todo.dueDate) > new Date());
    const completedTodos = allTodos.filter(todo => todo.completed);

    res.render('todo', { title:'Todo application',overdueTodos, dueTodayTodos, dueLaterTodos,completedTodos,
      csrfToken : req.csrfToken(),
     });
    
  }else{
    res.json(allTodos)
  }
})

app.get('/signup',(req,res)=>{
  res.render('signup',{title:'Sign-up', csrfToken:req.csrfToken()})
})
 
app.post('/users',async(req,res)=>{
  const hashedPwd = await bcrypt.hash(req.body.password,saltRounds)

 try{
  const user = await User.create({
    firstName : req.body.firstName,
    lastName : req.body.lastName,
    email : req.body.email,
    password : hashedPwd
  });
  req.login(user,(err)=>{
    if(err){
      console.log(err)
    }
    res.redirect('/todos')
  })
  res.redirect('/todos');
 }catch(err){
  console.log(err);
 }
})
app.use(express.static(path.join(__dirname,'public')));

app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.findAll();
    return res.json(todos);
    console.log(todos)
  } catch (error) {
    console.error(error);
    return res.status(500).json( );
  }
});

app.post('/todos', async (req, res) => {
  console.log('Creating a todo', req.body);
  try {
    await Todo.addTodo({ title: req.body.title, dueDate: req.body.dueDate });
    return res.redirect('/');
  } 
  
  catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});

app.put('/todos/:id', async (req, res) => {
  console.log('We have to update a todo with ID:', req.params.id);
  try {
    const todo = await Todo.findByPk(req.params.id);
    const updatedTodo = await todo.setCompletionStatus(req.body.completed);
    return res.json(updatedTodo);
  } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});


app.delete('/todos/:id', async (req, res) => {
  console.log(`Deleting a todo with ID:`, req.params.id);
  try {
    await Todo.remove(req.params.id);
     return res.json({success:true});
  } catch (error) {
    return res.status(422).json( error);
  }
});


module.exports = app