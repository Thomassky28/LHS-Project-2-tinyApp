// require and execute express module. require body-parser module
const app = require('express')();
const request = require('request');
// body-parser allows us to access POST request parameters
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const generateRandomString = require('./libs/tinyApp-functions');

// set default port to 8080
const port = 8080;
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};


/*
  the code below allows the returned value to be of any type.
  if extended: false, value can be a string or array
*/
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// add ejs as a view engine
app.set('view engine', 'ejs');


// root function
app.get('/', (req, res) => {
  res.end('Hello!');
});

// login
app.post('/login', (req, res) => {
  // get username from the form
  const username = req.body.username;
  // store username in the cookies
  res.cookie('username', username);
  res.redirect('/urls');
});

// logout
app.post('/logout', (req, res) => {
  // upon logging out, remove username stored in cookies
  res.clearCookie('username');
  res.redirect('/urls');
});

// get + /urls rendered to urls_index.ejs. display a table of shortURL and longURL
app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

// 'Create new short URL' button -> POST -> redirect to urls_new.ejs
app.post('/urls/new', (req, res) => {
  res.redirect('/urls/new');
});

// get + /urls/new rendered to urls_new.ejs. triggered when you go to /urls/new
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
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
      suggestion: ''
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
      // longURL works fine. Update the database
      urlDatabase[generateRandomString()] = longURL;
      res.redirect('/urls');
    }
  });
});

// When you use a shortURL to go its corresponding website
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// triggered when `delete` button is clicked
app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

// triggered when `update` button is clicked
app.post('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render('urls_show', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id/update', (req, res) => {
  const shortURL = req.body.shortURL;
  const newLongURL = req.body.newLongURL;
  
  const options = {
    url: newLongURL,
    timeout: 3000
  };

  request(options, (reqErr, reqRes, reqBody) => {
    const err = {
      shortURL: shortURL,
      errURL: newLongURL,
      suggestion: ''
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

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(port, () => {
  console.log(`Example app listening to port ${port}!`);
});