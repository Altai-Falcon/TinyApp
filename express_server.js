const express = require("express");
const app = express();
const PORT = process.env.PORT ||8080; // default port 8080
const bodyParser = require("body-parser"); //allow access POST request parameters ie: req.body.longURL
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

app.use(bodyParser.urlencoded({extended: true})); 
app.use(cookieSession({
  name: 'session',
  keys: ["asdfglkjh"],
}));

app.set("view engine", "ejs");

//*************Helper Functions*****************************\\


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

function checkIfUserExist(email) {
  for(var user in users) {
    if(email === users[user]["email"]) {
      return true;
    }
  }
}

function findUserIDbyEmail(email) {
  for(var user in users){
    if(users[user]["email"] === email) {
      return users[user].id;
    }
  }
}

function findPasswordByEmail(email) {
  for(var user in users) {
    if(email === users[user]["email"]) {
      return users[user]["password"];
    }
  }
}

function urlsCreatedBYtheUser(id) {
  var urlsCreatedBYtheUser = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url]["userID"]) {
      urlsCreatedBYtheUser[url] = urlDatabase[url];
    }
  }
  return urlsCreatedBYtheUser;
}
//================================================================\\





//****************DATA BASES **************************************\\
//**THIS IS THE URL DATA BASE
var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

//**THIS IS THE USERS DATA BASE
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("1", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("2", 10)
  }
};

//===============================================================//




app.get("/", (req, res) => {
  if (req.session["cookiesUserID"]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


//*****ROOT URLS GET REQUEST  ==>  URLS_INDEX.ejs*****
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session["cookiesUserID"]],
    urls: urlsCreatedBYtheUser(req.session["cookiesUserID"]),
  };
  res.render("urls_index", templateVars);
});





//*****************NEW URL******************************************\\
//**REQUEST TO ADD NEW URL  POINTING TO THE FORM @ URLS_NEW
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session["cookiesUserID"]],
  };
  if (req.session["cookiesUserID"]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

//** POST REQUEST  WITH THE INFO FROM THE URLS/NEW FORM  (in the form of req.body)
app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  let userID = req.session["cookiesUserID"]
  urlDatabase[newShortURL] = {
    longURL: "https://www." + req.body["longURL"],
    userID: userID
    }
  res.redirect("/urls");    
});
//====================================================================//
              





//*****************LOGIN & LOG OUT******************************************\\

//**LOGIN GET
app.get("/login", (req, res) => {
  res.render("login_form");
});

//**LOGIN POST
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  if (checkIfUserExist(email)) {
    if (bcrypt.compareSync(password, findPasswordByEmail(email))) {
      req.session.cookiesUserID=findUserIDbyEmail(email);
      res.redirect("/urls"); 
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }     
});

//**LOG-OUT POST
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");    
});
//==========================================================================//






//*****************REGISTER GET &  POST**************************************\\
//**REQUEST TO ADD NEW URL  POINTING TO THE FORM @ URLS_NEW
app.get("/register", (req, res) => {
  res.render("register_form");
});

//** POST REQUEST  WITH THE INFO FROM THE REGISTER/NEW FORM  (in the form of req.body)
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if(email === "" || password === ""){
    res.sendStatus(400);
  } else if (checkIfUserExist(email)){
    res.sendStatus(400);
  } else{
    let newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: email,
      password: hashedPassword
    }; 
    req.session.cookiesUserID=findUserIDbyEmail(email);  
    res.redirect("/urls");    
  }
  
});
//============================================================================//





//**SHORT URL REQUESTS   Redirecting to the long URL 
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//**DELETE POST
app.post("/urls/:id/delete", (req, res) => {
  if (req.session["cookiesUserID"] === urlDatabase[req.params.id]["userID"]){
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});






//*****************EDIT URL******************************************\\
//**EDIT URL GET REQUEST ===> Renders form at urls_show.ejs
app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    user: users[req.session["cookiesUserID"]],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  if (req.session["cookiesUserID"] === urlDatabase[req.params.id]["userID"]){
    res.render("urls_show", templateVars); 
  } else {
    res.sendStatus(403);
  }
   
});

//**EDIT URL POST ====> send the request body and add to urlDatabase object
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = {
    longURL: "https://www." + req.body.longURL,
    userID: req.session["cookiesUserID"]
  }
  res.redirect("/urls");  // redirect to urls_index.ejs
});
//====================================================================//



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

