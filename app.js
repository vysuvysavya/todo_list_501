const express = require('express');
const { Todo, User } = require('./models');
const bodyParser = require('body-parser');
const path = require('path');
const csurf = require('tiny-csrf');
const cookieParser = require('cookie-parser');

const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const LocalStrategy = require('passport-local');
const session = require('express-session');

const flash = require('connect-flash');

const bcrypt = require('bcrypt');

const saltRounds = 10;

const app = express();
app.use(bodyParser.json());

app.use(
  session({
    secret: 'my-super-secret-key-2348523542345',
    resave:false,
    saveUninitialized:false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 ,
      secure:false// 24 hrs
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    (username, password, done) => {
     User.findOne({ where: { email: username } })
       .then(async function (user) {
         const result = await bcrypt.compare(password, user.password);
         if (result) {
           return done(null, user);
         } else {
           return done(null, false, { message: "Invalid password" });
         }
       })
       .catch((error) => {
         return done(err);
       });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log('serializeUser', user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log('deserializeUser', id);
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
});

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('secret token'));
app.use(csurf('m7DdIYoarUfAhXTeGqepY5gMbBApfX4J', ['POST', 'PUT', 'DELETE']));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.get('/', async (req, res) => {
  return res.render('index', {
    csrfToken: req.csrfToken(),
    title: 'Todo App'
  });
});

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});


app.get('/signup', (req, res) => {
  return res.render('signup', { csrfToken: req.csrfToken(), title: 'Sign Up' });
});

app.get('/login', (req, res) => {
  return res.render('login', { csrfToken: req.csrfToken(), title: 'Login' });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    console.log(request.user);
    response.redirect("/todos");
  }
);

app.get('/signout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.redirect('/');
  });
});

app.get('/todos', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const overdueTodos = await Todo.overdueTodos(req.user.id);
  const dueLaterTodos = await Todo.dueLaterTodos(req.user.id);
  const dueTodayTodos = await Todo.dueTodayTodos(req.user.id);
  const completedTodos = await Todo.completedTodos(req.user.id);
  return res.render('todos', {
    overdueTodos,
    dueLaterTodos,
    dueTodayTodos,
    completedTodos,
    csrfToken: req.csrfToken(),
    title: 'My Todos'
  });
});

app.post('/todos', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const todo = await Todo.addTodo(
      req.body.title,
      req.body.dueDate,
      req.user.id
    );
    if (req.accepts('html')) {
      return res.redirect('/todos');
    } else {
      return res.json(todo);
    }
  } catch (error) {
    req.flash('error', 'Error creating to-do.');
  }
});

app.post('/users', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword
    });
    req.login(user, (err) => {
      if (err) {
        return res.status(422).send({ error: err.message });
      }
      res.redirect('/todos');
    });
  } catch (error) {
    req.flash('error', 'User with this email already exists.');  
    res.redirect('/signup');
  }
});

app.put('/todos/:id', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const todo = await Todo.setCompletionStatus(
      req.params.id,
      req.user.id,
      req.body.completed
    );
    if (req.accepts('html')) {
      return res.redirect('/todos');
    } else {
      return res.json(todo);
    }
  } catch (error) {
    return res.status(422).send({ error: error.message });
  }
});

app.delete(
  '/todos/:id',
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      await Todo.remove(req.params.id, req.user.id);
      if (req.accepts('html')) {
        return res.redirect('/todos');
      } else {
        return res.status(200).send(true);
      }
    } catch (error) {
      return res.status(422).send(false);
    }
  }
);

module.exports = app;