var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser"); //allow access POST request parameters ie: req.body.longURL
app.use(bodyParser.urlencoded({extended: true})); 
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs");

// remember template vars just means template variables

//**FUNCTION TO GENERATE RANDOM ID  (THE DRAW BACK TO THIS  is that the probability of an id collison increases with the size of our database. 
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


//**THIS IS THE DATA BASE
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//**THIS IS THE USERS DATA BASE
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

//*****ROOT URLS GET REQUEST  ==>  URLS_INDEX.ejs*****
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["cookiesUsername"],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//*****************NEW URL******************************************\\
//**REQUEST TO ADD NEW URL  POINTING TO THE FORM @ URLS_NEW
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["cookiesUsername"],
  }
  res.render("urls_new", templateVars);
});

//** POST REQUEST  WITH THE INFO FROM THE URLS/NEW FORM  (in the form of req.body)
app.post("/urls", (req, res) => {
  console.log("these are the post request paramaters", req.body); // debug statement to see POST request parameters. Body should contain one URL-encoded name-value pair with the name longURL.
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = "https://www." + req.body["longURL"];  //Note that it's been parsed into a JS object, where longURL is a key, and the value is no longer URL-encoded. That's the work of the bodyParser.urlEncoded() middleware
  res.redirect("/urls");    
});
//====================================================================//
              

//*****************LOGIN & LOG OUT******************************************\\
//**LOGIN POST
app.post("/login", (req, res) => {
  res.cookie('cookiesUsername', req.body['username']);
  // console.log('this is the cookie', res.cookie);
  console.log('this is the cookie username', req.cookies['cookiesUsername']); // why does it only show the last username value not the current one? 
  console.log("got into log in");
  console.log(req.body);
  res.redirect("/urls");    
});

//**LOG-OUT POST
app.post("/logout", (req, res) => {
  res.clearCookie('cookiesUsername', req.body['username']);
  console.log(req.body);
  res.redirect("/urls");    
});
//==========================================================================//



//*****************REGISTER GET &  POST**************************************\\
//**REQUEST TO ADD NEW URL  POINTING TO THE FORM @ URLS_NEW
app.get("/register", (req, res) => {
  res.clearCookie('cookiesUsername', req.body['username']);  //delete any previous cookie
  let templateVars = {
    username: req.cookies["cookiesUsername"],
  }
  res.render("register_form", templateVars);
});

//** POST REQUEST  WITH THE INFO FROM THE REGISTER/NEW FORM  (in the form of req.body)
app.post("/register", (req, res) => {
  console.log("these are the post request paramaters", req.body); // debug statement to see POST request parameters. Body should contain one URL-encoded name-value pair with the name longURL.
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = "https://www." + req.body["longURL"];  //Note that it's been parsed into a JS object, where longURL is a key, and the value is no longer URL-encoded. That's the work of the bodyParser.urlEncoded() middleware
  res.redirect("/urls");    
});
//============================================================================//



//**SHORT URL REQUESTS   Redirecting to the long URL 
app.get("/u/:shortURL", (req, res) => {
  console.log("this is req.params the shortURL in the URL reqeust from client this will be the id key for the urlDatabase", req.params.shortURL);  // remember request params is the <:shortURL> in the url request from client
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//**DELETE POST
app.post("/urls/:id/delete", (req, res) => {
	console.log(req.params.id);
	delete urlDatabase[req.params.id];
	res.redirect("/urls");  // redirect to urls_index.ejs
});

//*****************EDIT URL******************************************\\
//**EDIT URL GET REQUEST ===> Renders form at urls_show.ejs
app.get("/urls/:id", (req, res) => {
  console.log("this is the request.params.id from the get request:", req.params.id);
  let templateVars = { 
    username: req.cookies["cookiesUsername"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", templateVars);  
});

//**EDIT URL POST ====> send the request body and add to urlDatabase object
app.post("/urls/:id", (req, res) => {
  console.log(req.params.id);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");  // redirect to urls_index.ejs
});
//====================================================================//



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

