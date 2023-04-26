/* eslint-disable no-undef */
/*eslint-disable no-unused-vars */

const express = require("express");
const app = express();
var tinyCsrf = require("tiny-csrf");
var cookieParser = require("cookie-parser");
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session"); //session handling
const flash = require("connect-flash");
const path = require("path");
const localStrategy = require("passport-local");
const saltRounds = 10;

app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(
  tinyCsrf("AOqrzzlAERfjp73oFLyc933D8VBfRrW6", ["POST", "PUT", "DELETE"])
);
app.use(
  session({
    secret: "abcisndonsdpgoiewr-120294382u0",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24 hour session
    },
  })
);

app.use(flash());

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          return done(error);
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing User: ", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.set("view engine", "ejs");

app.get("/", async (request, response) => {
  response.render("index", {
    csrfToken: request.csrfToken(),
  });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/signup", async (request, response) => {
  response.render("signup", { csrfToken: request.csrfToken() });
});

app.post("/users", async (request, response) => {
  //create new user
  // response.render("signup", { csrfToken: request.csrfToken() });
  const firstName = request.body.firstName;
  const email = request.body.email;
  const password = request.body.password;
  if (firstName.length == 0 || email.length == 0 || password.length == 0) {
    console.log("Credentials Empty!");
    request.flash("error", `Missing Credentials`);
    response.redirect("/signup");
  } else {
    const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);
    try {
      const user = await User.create({
        firstName: firstName,
        lastName: request.body.lastName,
        email: email,
        password: hashedPassword,
      });

      request.login(user, (err) => {
        if (err) {
          console.error(err);
        }
        response.redirect("/todos");
      });
    } catch (error) {
      console.log(error);
    }
  }
});

app.get("/login", (request, response) => {
  response.render("login", { csrfToken: request.csrfToken() });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    // console.log(request.user);

    response.redirect("/todos");
  }
);

app.get("/signout", (request, response, next) => {
  //next is to pass message to next route handler
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    // response.send("Todo List");
    try {
      const loggedInUser = request.user.id;
      console.log(`User logged in with ID: ${loggedInUser}`);
      const allTodos = await Todo.getAllTodos(loggedInUser);
      const todayItems = await Todo.dueToday(loggedInUser);
      const laterItems = await Todo.dueLater(loggedInUser);
      const overdueItems = await Todo.overdue(loggedInUser);
      const completedItems = await Todo.completed(loggedInUser);

      if (request.accepts("html")) {
        response.render("todos", {
          allTodos,
          todayItems,
          laterItems,
          overdueItems,
          completedItems,
          csrfToken: request.csrfToken(),
        });
      } else {
        response.json({
          allTodos,
          todayItems,
          laterItems,
          overdueItems,
          completedItems,
        });
      }
    } catch (error) {
      console.error(error);
      return response.status(422).json(error);
    }
  }
);

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    // console.log("Creating a todo", request.body);
    // console.log(request.user);
    const title = request.body.title;
    const dueDate = request.body.dueDate;

    if (title.length == 0 || dueDate.length != 10) {
      request.flash("error", `Fill in the proper details`);
      response.redirect("/todos");
    } else {
      try {
        const todo = await Todo.addTodo({
          title: title,
          dueDate: dueDate,
          userId: request.user.id,
        });

        return response.redirect("/todos");
      } catch (error) {
        console.log(error);
        return response.status(422).json(error); //unprocessable entity
      }
    }
  }
);

app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log("Update todo with ID: ", request.params.id);
    const todo = await Todo.findByPk(request.params.id);
    try {
      const updatedTodo = await todo.setCompletionStatus(
        request.body.completed
      );
      return response.json(updatedTodo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log("Delete a todo by ID: ", request.params.id);
    try {
      await Todo.remove(request.params.id, request.user.id);
      return response.json({ success: true });
    } catch (error) {
      return response.status(422).json(error);
    }
  }
);

module.exports = app;

/*eslint-disable no-unused-vars */