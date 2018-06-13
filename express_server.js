// require and execute express module. require body-parser module
const app = require('express')();
const bodyParser = require('body-parser');
const generateRandomString = require('./libs/tinyApp-functions');

// ret default port to 8080
const port = 8080;
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};


/*
  body-parser allows us to access POST request parameters
  the code below allows the returned value to be of any type.
  if extended: false, value can be a string or array
*/
app.use(bodyParser.urlencoded({extended: true}));

// add ejs as a view engine
app.set('view engine', 'ejs');


// req: request, res: response
app.get('/', (req, res) => {
  res.end('Hello!');
});

// route: GET /urls -> render urls_index.ejs with templateVars and display the page
app.get('/urls', (req, res) => {
  // Object to pass to ./views/urls_index.ejs
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

/* 
  When you click on the 'Create new short URL' button, 
  it makes a POST request to /urls_new and triggers the code below.
  It will then render urls_new.ejs and display that template
*/
app.post('/urls_new', (req, res) => {
  res.render('urls_new');
});

// Triggered when the Submit button is clicked on.
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  // Update the object
  urlDatabase[shortURL] = longURL;
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
  // res.send('OK');
});


app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

/*
  This middleware function should come before app.get('urls/:id'). 
  Otherwise 'new' will bind to req.params.id 
*/
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  // console.log(templateVars);
  res.render('urls_show', templateVars);
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