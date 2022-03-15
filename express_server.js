const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { use } = require("express/lib/application");

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(morgan('dev')); // terminal will tell us time user connect to server exsample: GET /urls 304 1.657 ms
app.use(cookieParser());
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const getUserByEmail = (email) => {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
};


const generateRandomString = () => {
  const string = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let url = "";
  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * string.length);
    url += string[index];
  }
  return url;
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};



app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId] ? users[userId] : undefined,
    longURL:urlDatabase[shortURL],
    shortURL
  };
  res.render("urls_show", templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const url = req.params.shortURL;
  delete urlDatabase[url];
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  const url = req.params.shortURL;
  urlDatabase[url] = req.body.longURL;
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId] ? users[userId] : undefined,
    urls:urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


app.get("/u/:shortURL", (req, res) => {
  let redirectUrl = '/urls';
  if (req.params.shortURL && urlDatabase[req.params.shortURL]) {
    redirectUrl = urlDatabase[req.params.shortURL];
  }
  res.status(302).redirect(redirectUrl);
});



app.get('/login', (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId] ? users[userId] : undefined,
    buttonName: 'Login'
  };
  res.render('login',templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let userId;
  for (const id in users) {
    if (users[id].email === email && users[id].password === password) {
      userId = id;
    }
  }
  res.cookie("user_id", userId);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('urls');
});

app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId] ? users[userId] : undefined,
    buttonName: 'Register'
  };
  res.render("register", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("email and password can't be empty ");
  }
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    return res.status(400).send("user already exist");
  }
  const id = generateRandomString();
  
  users[id] = {id,email,password};
  res.cookie('users',{id: users.id, name: users.name});
  res.redirect('/urls');
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/", (req, res) => {
  res.send("Hello!");
});
