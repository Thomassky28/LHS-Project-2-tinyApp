// require npm modules
const express = require('express');
const app = express();
const request = require('request');
const bodyParser = require('body-parser'); // for post method
const cookieSession = require('cookie-session'); // for encrypting cookie
const methodOverride = require('method-override'); // for enabling put and delete methods
const bcrypt = require('bcryptjs'); // for password hasing

// require function library from libs
const tinyAppFunctions = require('./libs/tinyApp-functions');
const getRequestResults = tinyAppFunctions.getRequestResults;
const generateRandomString = tinyAppFunctions.generateRandomString;
const urlsForUser = tinyAppFunctions.urlsForUser;
const trimHTTP = tinyAppFunctions.trimHTTP;

// set default port to 8080
const port = 8080;
const urlDatabase = {
  'b2xVn2': {
    id: 'b2xVn2',
    address: 'http://www.lighthouselabs.ca',
    owner: 'user2RandomID',
    birthInMs: 1519187812865,
    count: {}
  },
  '9sm5xK': {
    id: '9sm5xK',
    address: 'http://www.google.com',
    owner: 'VVikGbDTtA',
    birthInMs: 132918741865,
    count: {}
  },
  '12ohzf': {
    id: '12ohzf',
    address: 'http://www.youtube.com',
    owner: 'VVikGbDTtA',
    birthInMs: 1229187812235,
    count: {
      userRandomID: {
        visit_count: 1
      },
      user2RandomID: {
        visit_count: 3
      }
    }
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$13$fmXWnm0tC2LVVUegJz5aY.GKaTvJnyl9CVkZfJ/knjDP.JmA2efwe" // purple-monkey-dinosaur
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$13$LeUJ6iHqh.6mOQLVYIkVHejODwtdiSQUCS6qrFubgJYdqwdKjckpS" // dishwasher-funk
  },
  "VVikGbDTtA": {
    id: "VVikGbDTtA",
    email: "byeong.kim0430@gmail.com",
    password: "$2a$13$jvmek0ZdLYA65QNFfLbNw.Tz2WlDyzbs3cyYfP4m9Pt5MxF0gaSUa"
  }
}

// when extended: true, url-encoded data is parsed with the `qs` library
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
// override with POST having ?_method=DELETE and ?_method=PUT
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/'));

// add ejs as a view engine
app.set('view engine', 'ejs');


// get
app.get('/', (req, res) => {
  const {user_id} = req.session;
  (user_id) ? res.redirect('/urls') : res.redirect('/login');
});

// login
app.get('/login', (req, res) => {
  const {user_id} = req.session;
  (user_id) ? res.redirect('/urls') : res.render('login_form');
});

app.get('/register', (req, res) => {
  const {user_id} = req.session;
  (user_id) ? res.redirect('/urls') : res.render('register_form');
});

// render urls_index.ejs and display a table of shortURL and longURL
app.get('/urls', (req, res) => {
  // check cookie to see if user id is stored
  const {user_id} = req.session;
  const matchingIdRecords = Object.keys(users).filter(key => key === user_id);
  
  if (matchingIdRecords.length) {
    // matching record found. render urls_index.ejs with data FILTERED for the logged-in user
    const templateVars = {
      urls: urlsForUser(user_id, urlDatabase),
      user: users[user_id]
    };
    res.render('urls_index', templateVars);
  } else {
    // no matching record. user must log in
    res.render('login_form', { message: 'Please log in' });
  }
});

// if user id found in cookie, render urls_new.ejs. otherwise redirect to login page
app.get('/urls/new', (req, res) => {
  const {user_id} = req.session;
  if (user_id) {
    res.render('urls_new', { user: users[user_id] });
  } else {
    res.redirect('/login');
  }
});

// when shortURL used, redirect to the original URL and store each visit numbers in cookie
app.get('/u/:shortURL', (req, res) => {
  const {user_id} = req.session;
  const {shortURL} = req.params;
  
  // check if the shortURL exists. if not redner urls_show.ejs with a message
  if (!urlDatabase[shortURL]) {
    // entered incorrect shortURL 
    const templateVars = {
      user: users[user_id],
      authMessage: `'${shortURL}' does not exist`
    }
    res.render('urls_show', templateVars);
    return;
  }

  // if shortURL exists in db, then add the number of visits to db and redirect to the address
  const {address, count} = urlDatabase[shortURL];
  // check if the current user id is found in count.
  if(Object.keys(count).indexOf(user_id) === -1){
    // if not found, add the first count
    urlDatabase[shortURL].count[user_id] = {
      visit_count: 1
    }
  }else{
    // if found, add 1 to the existing visit count
    urlDatabase[shortURL].count[user_id].visit_count++;
  }
  // redirect to the original URL
  res.redirect(address);
});

// if user is already logged in, render urls_show.ejs. otherwise, redirect to login
app.get('/urls/:id', (req, res) => {
  const {user_id} = req.session;
  // if there is no cookie user_id, redirect to /login
  if (!user_id) {
    res.render('login_form', { message: 'Please log in first' });
    return;
  }

  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    // entered incorrect shortURL 
    const templateVars = {
      user: users[user_id],
      authMessage: `'${shortURL}' does not exist`
    }
    res.render('urls_show', templateVars);
    return;
  }

  // user already logged in and correct shortURL entered
  if (urlDatabase[shortURL].owner === user_id) {
    // owner of shortURL is the current user
    const {count} = urlDatabase[shortURL];
    // stats
    // calculate the number of unique visitors
    const uniqueVisitors = Object.keys(count).length;
    // calculate the total number of visits
    let totalVisitCount = 0;
    Object.keys(count).forEach(user_id => {
      totalVisitCount += count[user_id].visit_count;
    })
    // end - stats

    // calculate the shortURL date from unix milliseconds
    const birthday = /\d{4}-\d{2}-\d{2}/.exec(new Date(1529187812865).toISOString());
    
    // `http://` is already pre-defined on the website. remove the protocol when you return the URL
    const trimmedURL = trimHTTP(urlDatabase[shortURL].address);
    const templateVars = {
      shortURL: shortURL,
      longURL: trimmedURL,
      user: users[user_id],
      stats: {
        uniqueVisitors: uniqueVisitors,
        totalVisitCount: totalVisitCount,
        birthday: birthday
      }
    };
    res.render('urls_show', templateVars);
  } else {
    // shortURL doesn't belong to the current user
    const templateVars = {
      user: users[user_id],
      authMessage: `You cannot view details for ${shortURL}`
    };
    res.render('urls_show', templateVars);
  }
});


// post
app.post('/login', (req, res) => {
  // receive usernamd and password from request body
  const { username, password } = req.body;
  // either username (email) or password empty
  if (!username || !password) {
    res.status(403).render('login_form', { message: "Please fill out the login form" });
    return;
  }

  // extract user info based on the input email
  const dbUser = Object.values(users).filter(value => value.email === username)[0];
  // user doesn't exist in the db
  if (!dbUser) {
    res.status(403).render('login_form', { message: "Email doesn't exist" });
    return;
  }

  // user exists. compare the password
  const comparePaswd = bcrypt.compareSync(password, dbUser.password);
  if (comparePaswd) {
    // correct password. set user_id on a cookie session
    req.session.user_id = dbUser.id;
    res.redirect('/urls');
  } else {
    // incorrect password
    const templateVars = {
      email: username,
      message: "Incorrect password!"
    };
    res.status(403).render('login_form', templateVars);
  }
});

app.post('/logout', (req, res) => {
  // destroy session when logging out
  req.session = null;
  res.redirect('/urls');
});


app.post('/register', (req, res) => {
  // receive email and password from request body
  const { email, password } = req.body;
  // number of matching records
  const matchingRecords = Object.values(users).filter(user => user.email === email);

  // empty email or password
  if (!email || !password) {
    res.status(400).render('register_form', { message: 'Registration form incomplete' });
    return;
  }
  
  if (matchingRecords.length) {
    // there is a matching record. render the registration form with a message.
    res.status(400).render('register_form', { message: 'Please select another email' });
  } else {
    // no matching record. add the registration data form into db
    // make sure password is hashed with 13 salts
    newKey = generateRandomString(10);
    users[newKey] = {
      id: newKey,
      email: email,
      password: bcrypt.hashSync(password, 13)
    };
    // set user_id on a cookie session
    req.session.user_id = newKey;
    res.redirect('/urls');
  }
});

// new longURL submitted check if it has no error
app.post('/urls', (req, res) => {
  // check cookie to see if user id is stored
  const {user_id} = req.session;
  const matchingIdRecords = Object.keys(users).filter(key => key === user_id);
  if (!matchingIdRecords.length) {
    // no matching record. user must log in
    res.render('login_form', { message: 'Please log in first' });
    return;
  }

  // if user is logged in..
  /*
    trim white spaces and convert everything to lowercase
    `http://` is already pre-defined. if that is found in longURL, 
    remove it and add the pre-defined protocol
  */
  const originalURL = trimHTTP(req.body.longURL.toLowerCase().trim());
  const longURL = 'http://' + originalURL;
  
  // options for request() function
  const options = {
    url: longURL,
    timeout: 3000
  };
  // create object to compile results of getRequestResults()
  const reqInput = {
    user: users[user_id],
    originalURL: originalURL,
    longURL: longURL,
    suggestion: ''
  };
  // send a request to a new URL and receive a response
  getRequestResults(request, options, reqInput).then(templateVars => {
    if (templateVars.errName) {
      // error found. render urls_new with a error message
      res.render('urls_new', templateVars);
    } else {
      // longURL works fine. Update the database with a unixtime timestamp
      const newKey = generateRandomString(6);
      urlDatabase[newKey] = {
        id: newKey,
        address: longURL,
        owner: user_id,
        birthInMs: + new Date(), // creation time in unix milliseconds
        count: {}
      };
      res.redirect(`/urls/${newKey}`);
    }
  });
});

// triggered when longURL is updated
app.put('/urls/:id', (req, res) => {
  // check if user is logged in
  const {user_id} = req.session;
  const matchingIdRecords = Object.keys(users).filter(key => key === user_id);

  // user not logged in. redner login_form with a message
  if (!matchingIdRecords.length) {
    // no matching record. user must log in
    res.render('login_form', { message: 'Please log in first' });
    return;
  }

  // if user's logged in, check if the current user is the URL owner
  const {shortURL} = req.body;
  const urlMatch = urlDatabase[shortURL];
  if(!urlMatch){
    // URL does not exist in db
    const templateVars = {
      user: users[user_id],
      authMessage: `${shortURL} does not exist`
    };
    res.render('urls_show', templateVars);
    return;
  }

  if(urlMatch.owner === user_id){
    // current user owns the URL
    /*
      trim white spaces and convert everything to lowercase
      `http://` is already pre-defined. if that is found in longURL, 
      remove it and add the pre-defined protocol
    */
    const originalURL = trimHTTP(req.body.longURL.toLowerCase().trim());
    const longURL = 'http://' + originalURL;
    
    // options for request() function
    const options = {
      url: longURL,
      timeout: 3000
    };
    // create object to compile results of getRequestResults()
    const reqInput = {
      user: users[user_id],
      shortURL: shortURL,
      longURL: longURL,
      suggestion: ''
    };
    
    // send a request to a new URL and receive a response
    getRequestResults(request, options, reqInput).then(templateVars => {
      if (templateVars.errName) {
        // error found in URL. render urls_show.ejs to show error message
        // `http://` already pre-defined. remove it before sending it to urls_show.ejs
        templateVars.longURL = trimHTTP(templateVars.longURL);
        res.render('urls_show', templateVars);
      } else {
        // longURL works fine. Update the database
        urlDatabase[shortURL].address = longURL;
        res.redirect('/urls');
      }
    });
  }else{
    // current user DOES NOT own the URL
    const templateVars = {
      user: users[user_id],
      authMessage: `You cannot view details for ${shortURL}`
    };
    // shortURL doesn't belong to the current user
    res.render('urls_show', templateVars);
  }

  

});


// delete
// post -> delete by method-override
app.delete('/urls/:id', (req, res) => {
  // check if user is logged in
  const {user_id} = req.session;
  const matchingIdRecords = Object.keys(users).filter(key => key === user_id);

  // user not logged in. redner login_form with a message
  if (!matchingIdRecords.length) {
    // no matching record. user must log in
    res.render('login_form', { message: 'Please log in first' });
    return;
  }

  // user logged in. check if the user owns the URL to be deleted
  const shortURL = req.params.id;
  const {owner} = urlDatabase[shortURL];
  if(owner === user_id){
    // user owns the URL
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }else{
    res.render('urls_index', { message: 'You cannot delete this URL' });
  }
});


app.listen(port, () => {
  console.log(`Example app listening to port ${port}`);
});