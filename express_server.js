// require and execute express module. require body-parser module
const app = require('express')();
const request = require('request');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// require function library from libs
const tinyAppFunctions = require('./libs/tinyApp-functions');
const generateRandomString = tinyAppFunctions.generateRandomString;
const lookUpObj = tinyAppFunctions.lookUpObj;
const urlsForUser = tinyAppFunctions.urlsForUser;

// set default port to 8080
const port = 8080;
const urlDatabase = {
  'b2xVn2': {
    id: 'b2xVn2',
    address: 'http://www.lighthouselabs.ca',
    user_id: 'user2RandomID'
  },
  '9sm5xK': {
    id: '9sm5xK',
    address: 'http://www.google.com',
    user_id: 'user3RandomID'
  },
  '12ohzf': {
    id: '12ohzf',
    address: 'http://www.youtube.com',
    user_id: 'user3RandomID'
  }
};

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
  },
  "user3RandomID": {
    id: "user3RandomID", 
    email: "byeong.kim0430@gmail.com", 
    password: "123"
  }
}

/*
  the code below allows the returned value to be of any type.
  if extended: false, value can be a string or array
*/
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// add ejs as a view engine
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
  res.redirect('/urls');
});

// logout
app.post('/logout', (req, res) => {
  // upon logging out, remove username stored in cookies
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// login
app.get('/login', (req, res) => {
  res.render('login_form');
});

// re-attempt logins. error message will be triggered if incorrect login credentials were passed.
app.post('/login', (req, res) => {
  const {username, password} = req.body;
  const user_id = Object.keys(users).filter(key => users[key].email === username && users[key].password === password)[0];

  if(user_id){
    res.cookie('user_id', user_id);
    res.redirect('/urls');
  }else{
    // unable to find login credentials
    res.status(403).render('login_form', {message: 'Incorrect login credentials!'});
  }
});

app.get('/register', (req, res) => {
  res.render('register_form');
});

app.post('/register', (req, res) => {
  const {email, password} = req.body;
  const checkEmail = Object.values(users).filter(user => user.email === lookUpObj(email, 'value', user)[0]);
  const checkPassword = Object.values(users).filter(user => user.password === lookUpObj(password, 'value', user)[0]);

  // If the returned email OR password were not found in the users database, add them to the database!
  if(email === '' || password === ''){
    res.status(400).render('register_form', {message: 'Registration form incomplete!'});
  }else if(checkEmail.length + checkPassword.length === 0){
    const newKey = generateRandomString(10);
    users[newKey] = {
      id: newKey,
      email: email,
      password: password
    };
    // Add user_id in cookies
    res.cookie('user_id', users[newKey].id);
    res.render('login_form', {message: 'Please log in with your new credentials.'});
  }else{
    res.status(400).render('register_form', {message: 'Email already in use.'});
  }
});

// get + /urls rendered to urls_index.ejs. display a table of shortURL and longURL
app.get('/urls', (req, res) => {  
  const userId = Object.keys(users).filter(key => key === req.cookies.user_id)[0];

  
  const templateVars = { 
    urls: urlsForUser(userId),
    user: users[userId]
  };
  // console.log(templateVars);
  res.render('urls_index', templateVars);
});

// 'Create new short URL' button -> POST -> redirect to urls_new.ejs
app.post('/urls/new', (req, res) => {
  res.redirect('/urls/new');
});

// get + /urls/new rendered to urls_new.ejs. triggered when you go to /urls/new
app.get('/urls/new', (req, res) => {
  if(req.cookies.user_id){
    res.render('urls_new', {user: users[req.cookies.user_id]});
  }else{
    res.redirect('/login');
  }
});

// longURL submitted -> POST -> urls_index
app.post('/urls', (req, res) => {
  const originalURL = req.body.longURL;
  // trim white spaces and convert everything to lowercase
  const longURL = originalURL.toLowerCase().trim();
  const options = {
    url: longURL,
    timeout: 3000
  };

  request(options, (reqErr, reqRes, reqBody) => {
    const err = {
      errURL: longURL,
      suggestion: '',
      user: users[req.cookies.user_id]
    };

    if(reqErr){
      // Add the error name and message to err Object
      err.name = reqErr.name;
      err.message = reqErr.message;
      
      if(/^invalid url|uri/i.test(err.message)){
        // For invalid URL, add the cause of the error to err.suggestion
        err.suggestion =  '- Make sure your URL contains http://';
      }else if (/timedout/i.test(err.message)){
        // Add a useful comment to err.suggestion
        err.suggestion = '- Check if your URL is valid!';
      }
      res.render('urls_new', err);
      return;
    }

    // Error 400: client error, 500: server error. Print out the status code and message
    if(400 <= reqRes.statusCode){
      err.name = `Error ${reqRes.statusCode}`;
      err.message = reqRes.statusMessage;
      res.render('urls_new', err);
    }else{
      const newKey = generateRandomString(6);
      // longURL works fine. Update the database
      urlDatabase[newKey] = {
        id: newKey,
        address: longURL,
        user_id: req.cookies.user_id
      };
      res.redirect('/urls');
    }
  });
});

// triggered when `update` button is clicked
app.post('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].address,
    user: users[req.cookies.user_id]
  };
  res.render('urls_show', templateVars);
});

app.get('/urls/:id/update', (req,res) => {
  res.redirect('/urls');
});

app.post('/urls/:id/update', (req, res) => {
  const {shortURL, newLongURL} = req.body;
  const options = {
    url: newLongURL,
    timeout: 3000
  };

  request(options, (reqErr, reqRes, reqBody) => {
    const err = {
      shortURL: shortURL,
      errURL: newLongURL,
      suggestion: '',
      user: users[req.cookies.user_id]
    };
    
    if(reqErr){
      // Add the error name and message to err Object
      err.name = reqErr.name;
      err.message = reqErr.message;
      
      if(/^invalid url|uri/i.test(err.message)){
        // For invalid URL, add the cause of the error to err.suggestion
        err.suggestion =  '- Make sure your URL contains http://';
      }else if (/timedout/i.test(err.message)){
        // Add a useful comment to err.suggestion
        err.suggestion = '- Check if your URL is valid!';
      }
      res.render('urls_show', err);
      return;
    }

    // Error 400: client error, 500: server error. Print out the status code and message
    if(400 <= reqRes.statusCode){
      err.name = `Error ${reqRes.statusCode}`;
      err.message = reqRes.statusMessage;
      res.render('urls_show', err);
    }else{
      // longURL works fine. Update the database
      urlDatabase[shortURL] = newLongURL;
      res.redirect('/urls');
    }
  });
});

// When you use a shortURL to go its corresponding website
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls/:id/delete', (req, res) => {
  res.redirect('/urls');
});

// triggered when `delete` button is clicked
app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

app.get('/urls/:id', (req, res) => {
  if(req.cookies.user_id){
    // user_id exists in cookie
    const templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id],
      user: users[req.cookies.user_id]
    };
    res.render('urls_show', templateVars);
  }else{
    res.redirect('/login');
  }

});


app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(port, () => {
  console.log(`Example app listening to port ${port}!`);
});