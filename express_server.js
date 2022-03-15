const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(morgan('dev')); // terminal will tell us time user connect to server exsample: GET /urls 304 1.657 ms
app.use(cookieSession({
  name: 'user_id',
  keys: ['wepgoawht2p350ruhw3o2p405iu0th23=='],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  }
};

const urlsForUser = (userId) => {
  const myUrls = {};
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === userId) {
      myUrls[id] = urlDatabase[id];
    }
  }
  return myUrls;
};

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (!users[userId]) {
    return res.redirect('/login');
  }
  const templateVars = {
    user: users[userId] ? users[userId] : undefined
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const templateVars = {
    user: users[userId] ? users[userId] : undefined,
    longURL: urlDatabase[shortURL].longURL,
    shortURL
  };
  res.render("urls_show", templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userId = req.session.user_id;
  if (!users[userId]) {
    return res.redirect('/login');
  }
  const url = req.params.shortURL;
  if (urlDatabase[url] && urlDatabase[url].userID === userId) {
    delete urlDatabase[url];
    return res.redirect('/urls');
  }
  res.status(400).send('unauthorized');
});

app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  if (!users[userId]) {
    return res.redirect('/login');
  }
  const url = req.params.shortURL;
  if (urlDatabase[url] && urlDatabase[url].userID === userId) {
    urlDatabase[url] = {
      longURL: req.body.longURL,
      userID: userId
    };
    return res.redirect('/urls');
  }
  res.status(400).send('unauthorized');
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!users[userId]) {
    return res.redirect('/login');
  }
  const myUrls = urlsForUser(userId);
  const templateVars = {
    user: users[userId] ? users[userId] : undefined,
    urls: myUrls
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userId
  };
  res.redirect('/urls');
});


app.get("/u/:shortURL", (req, res) => {
  let redirectUrl = '/urls';
  if (req.params.shortURL && urlDatabase[req.params.shortURL]) {
    redirectUrl = urlDatabase[req.params.shortURL].longURL;
  }
  res.status(302).redirect(redirectUrl);
});



app.get('/login', (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {
    user: users[userId] ? users[userId] : undefined,
    buttonName: 'Login'
  };
  res.render('login',templateVars);
});

app.post('/login', (req, res, next) => {
  const { email, password } = req.body;
  let userId;
  for (const id in users) {
    if (users[id].email === email && bcrypt.compareSync(password, users[id].password)) {
      userId = id;
    }
  }
  // eslint-disable-next-line camelcase
  req.session.user_id = userId;
  res.redirect('/urls');
  next();
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('urls');
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
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
  
  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  // eslint-disable-next-line camelcase
  req.session.user_id = id;
  res.redirect('/urls');
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/", (req, res) => {
  res.send("Hello!");
});
