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
const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const LocalStrategy = require('passport-local');

const saltRounds = 10;
const { title } = require('process');
const app = express();

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,'public')));

const { error } = require('console');

app.use(bodyParser.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser('ssh some secret string!'));

app.use(session({
  secret:'my-super-secret-key-3122817622345656',
  cookie:{
    maxAge : 24*60*60*1000
  }
}));
app.use(
  csrf(
    "123456789iamasecret987654321look", 
    ["POST",'PUT','DELETE'] 
));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField : 'email',
  passwordField : 'password'
},async (username,password,done)=>{
  
  User.findOne({where:{email:username}})
    .then(async (user)=>{
      if (!user) return done(null, false, { message: 'Incorrect username.' });
      const result = await bcrypt.compare(password, user.password);
      if (result) return done(null, user);
      return done(null, false, { message: 'Incorrect password.' });
    })
    .catch((err) => done(err));
}))

passport.serializeUser((user,done)=>{
  console.log("Serialising user in session",user.id)
  done(null,user.id)
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});



app.get('/',async (req,res)=>{
    res.render('index', {
      title : 'Todo application',
      csrfToken : req.csrfToken()
    })
})

app.get('/todos', connectEnsureLogin.ensureLoggedIn(),async (req,res)=>{
  if(req.accepts('html')){
    const loggedInUser = req.user.id;
    const overdue = await Todo.overdue(loggedInUser);
    const dueToday = await Todo.dueToday(loggedInUser);
    const dueLater =await Todo.dueLater(loggedInUser);
    const completed =await Todo.completed(loggedInUser);

    res.render('todo', { title:'Todo application',overdue, dueToday, dueLater,completed,
      csrfToken : req.csrfToken(),
     });
    
  }else{
    res.json({
      overdue, dueToday, dueLater
    })
  }
})

app.get('/signup',(req,res)=>{
  res.render('signup',{title:'Sign-up', csrfToken:req.csrfToken()})
})
 
app.post('/users', async (req, res) => {
  const hashedPwd = await bcrypt.hash(req.body.password, 10);
  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPwd
    });

    req.login(user, (err) => {
      if (err) {
        console.log(err);
        return res.redirect('/signup'); // Handle login error
      }
      return res.redirect('/todos'); // Successful login
    });
  } catch (err) {
    console.log(err);
    return res.redirect('/signup'); // Handle sign-up error
  }
});


app.get('/todos',connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const todos = await Todo.findAll();
    return res.json(todos);
    console.log(todos)
  } catch (error) {
    console.error(error);
    return res.status(500).json( );
  }
});

app.get('/login',(req,res)=>{
  res.render('login',{title:"login",csrfToken : req.csrfToken()});
})

app.post('/session',passport.authenticate('local',{failureRedirect:'/login'}),(req,res)=>{
  console.log(req.user); 
  res.redirect('/todos');
})

app.get('/signout',(req,res,next)=>{
  req.logout((err)=>{
    if(err) {return next(err);}
    res.redirect('/')
  })
})

app.post('/todos', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  console.log('Creating a todo', req.body);
  console.log('CSRF Token:', req.body._csrf);
  console.log('Authenticated user:', req.user);

  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    await Todo.addTodo({ title: req.body.title, dueDate: req.body.dueDate, userId: req.user.id });
    return res.redirect('/todos');
  } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});

app.put('/todos/:id',connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
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


app.delete('/todos/:id',connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  console.log(`Deleting a todo with ID:`, req.params.id);
  const loggedInUser = req.user.id;
  try {
    await Todo.remove(req.params.id,loggedInUser);
     return res.json({success:true});
  } catch (error) {
    return res.status(422).json( error);
  }
});


module.exports = app