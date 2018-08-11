var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");


function generateRandomString() {
  var lottery = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function randomString(){
  	var random = "";
  	for(var count = 0; count < 6; count++){
  		var index = Math.floor(Math.random()*lottery.length);
  		random += lottery[index];
  	}
  	return random;
  }
  return randomString();
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // debug statement to see POST parameters
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = "https://www." + req.body["longURL"];
  res.redirect("/urls");    
});


app.post("/login", (req, res) => {
  res.cookie('cookiesUsername', req.body['username']);
  console.log('this is the cookie', res.cookie);
  console.log("got into log in");
  console.log(req.body);
  res.redirect("/urls");    
});


app.get("/u/:shortURL", (req, res) => {
  console.log(req.params);
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
	console.log(req.params.id);
	delete urlDatabase[req.params.id];
	res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  console.log(req.params.id);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
	console.log(req.params.id);
  let templateVars = { shortURL: req.params.id,
  						longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

