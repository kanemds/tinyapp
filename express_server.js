const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(morgan('dev')); // terminal will tell us time user connect to server exsample: GET /urls 304 1.657 ms
app.use(cookieParser());


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

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"],
    urls:urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let redirectUrl = '/urls';
  if (req.params.shortURL && urlDatabase[req.params.shortURL]) {
    redirectUrl = urlDatabase[req.params.shortURL];
  }
  res.status(302).redirect(redirectUrl);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { longURL:urlDatabase[shortURL],shortURL };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const url = req.params.shortURL;
  delete urlDatabase[url];
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render('/partials/_header',templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const url = req.params.shortURL;
  urlDatabase[url] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const userName = req.body.username;
  res.cookie("username",userName);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('urls');
});