// require npm modules
const app = require('express')();
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

// set default port to 8080
const port = 8080;
const urlDatabase = {
  'b2xVn2': {
    id: 'b2xVn2',
    address: 'http://www.lighthouselabs.ca',
    owner: 'user2RandomID',
    count: {}
  },
  '9sm5xK': {
    id: '9sm5xK',
    address: 'http://www.google.com',
    owner: 'VVikGbDTtA',
    count: {}
  },
  '12ohzf': {
    id: '12ohzf',
    address: 'http://www.youtube.com',
    owner: 'VVikGbDTtA',
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

// add ejs as a view engine
app.set('view engine', 'ejs');


// get
app.get('/', (req, res) => {
  const cookieUserId = req.session.user_id;
  (cookieUserId === undefined) ? res.redirect('/login') : res.redirect('/urls');
  // res.redirect('/urls');
});

// login
app.get('/login', (req, res) => {
  res.render('login_form');
});

// app.get('/register', (req, res) => {
//   res.render('register_form');
// });

// app.get('/logout', (req, res) => {
//   res.redirect('/urls');
// })

// render urls_index.ejs and display a table of shortURL and longURL
app.get('/urls', (req, res) => {
  // check cookie to see if user id is stored
  const cookieUserId = req.session.user_id;
  const matchingIdRecords = Object.keys(users).filter(key => key === cookieUserId);

  if (matchingIdRecords.length) {
    // matching record found. render urls_index.ejs with data filtered for the logged-in user
    const templateVars = {
      urls: urlsForUser(cookieUserId, urlDatabase),
      user: users[cookieUserId]
    };
    res.render('urls_index', templateVars);
  } else {
    // no matching record. user must log in
    res.render('login_form');
  }
});

// // if user id found in cookie, render urls_new.ejs. otherwise redirect to login page
// app.get('/urls/new', (req, res) => {
//   const cookieUserId = req.session.user_id;
//   if (cookieUserId) {
//     res.render('urls_new', { user: users[cookieUserId] });
//   } else {
//     res.redirect('/login');
//   }
// });

// // when shortURL used, redirect to the original URL and store each visit numbers in cookie
// app.get('/u/:shortURL', (req, res) => {
//   const cookieUserId = req.session.user_id;
//   const shortURL = req.params.shortURL;
//   const {address, count} = urlDatabase[shortURL];
  
//   // if (!urlDatabase[shortURL]) {
//   //   // entered incorrect shortURL 
//   //   const templateVars = {
//   //     user: users[cookieUserId],
//   //     authMessage: `${shortURL} does not exist!`
//   //   }
//   //   res.render('urls_show', templateVars);
//   //   return;
//   // }

//   // check if the current user id is found in count.
//   if(Object.keys(count).indexOf(cookieUserId) === -1){
//     // if not found, add the first count
//     urlDatabase[shortURL].count[cookieUserId] = {
//       visit_count: 1
//     }
//   }else{
//     // if found, add 1
//     urlDatabase[shortURL].count[cookieUserId].visit_count++;
//   }
//   // redirect to the original URL
//   res.redirect(address);
// });

// if user is already logged in, render urls_show.ejs. otherwise, redirect to login
app.get('/urls/:id', (req, res) => {
  const cookieUserId = req.session.user_id;
  // if there is no cookie user_id, redirect to /login
  if (!cookieUserId) {
    res.redirect('/login');
    return;
  }
  
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    // entered incorrect shortURL 
    const templateVars = {
      user: users[cookieUserId],
      authMessage: `${shortURL} does not exist!`
    }
    res.render('urls_show', templateVars);
    return;
  }

  // user already logged in and correct shortURL entered
  if (urlDatabase[shortURL].owner === cookieUserId) {
    // owner of shortURL is the current user
    // count in urlDatabase
    const countField = urlDatabase[shortURL].count;
    let totalVisitCount = 0;
    Object.keys(countField).forEach(user_id => {
      totalVisitCount += countField[user_id].visit_count;
    })
    const templateVars = {
      shortURL: shortURL,
      longURL: urlDatabase[shortURL].address,
      user: users[cookieUserId],
      totalVisitCount: totalVisitCount
    };
    res.render('urls_show', templateVars);
  } else {
    const templateVars = {
      user: users[cookieUserId],
      authMessage: `You cannot view details for ${shortURL}`
    };
    // shortURL doesn't belong to the current user
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

// app.post('/logout', (req, res) => {
//   // destroy session when logging out
//   req.session = null;
//   res.redirect('/urls');
// });


// app.post('/register', (req, res) => {
//   // receive email and password from request body
//   const { email, password } = req.body;
//   // number of matching records
//   const matchingRecords = Object.values(users).filter(user => user.email === email);

//   // empty email or password
//   if (!email || !password) {
//     res.status(400).render('register_form', { message: 'Registration form incomplete!' });
//     return;
//   }

//   if (matchingRecords.length) {
//     // no matching record. add the registration data form into db
//     // make sure password is hashed with 13 salts
//     newKey = generateRandomString(10);
//     users[newKey] = {
//       id: newKey,
//       email: email,
//       password: bcrypt.hashSync(password, 13)
//     };
//     // return back to the log in form and ask user to log in again
//     res.render('login_form', { message: 'Please log in with your new credentials' });
//   } else {
//     // there is a matching record. render the registration form with a message.
//     res.status(400).render('register_form', { message: 'Email already in use' });
//   }
// });

// // create URL button clicked. redirect to /urls/new
// app.post('/urls/new', (req, res) => {
//   res.redirect('/urls/new');
// });

// // new longURL submitted check if it has no error
// app.post('/urls', (req, res) => {
//   // trim white spaces and convert everything to lowercase
//   const longURL = req.body.longURL.toLowerCase().trim();
//   // options for request() function
//   const options = {
//     url: longURL,
//     timeout: 3000
//   };
//   // create object to compile results of getRequestResults()
//   const reqInput = {
//     user: users[req.session.user_id],
//     longURL: longURL,
//     suggestion: ''
//   };

//   // send a request to a new URL and receive a response
//   getRequestResults(request, options, reqInput).then(templateVars => {
//     if (templateVars.errName) {
//       // error found. render urls_new with a error message
//       res.render('urls_new', templateVars);
//     } else {
//       // longURL works fine. Update the database
//       const newKey = generateRandomString(6);
//       urlDatabase[newKey] = {
//         id: newKey,
//         address: longURL,
//         owner: req.session.user_id
//       };
//       res.redirect('/urls');
//     }
//   });
// });

// // go to update page via update button
// app.post('/urls/:id', (req, res) => {
//   const shortURL = req.params.id;
//   const cookieUserId = req.session.user_id;
//   // if visitCount is undefined, set it to 0
//   const visitCount = (req.session[`${shortURL}_visit`] === undefined) ? 0 : req.session[`${shortURL}_visit`];
//   const templateVars = {
//     shortURL: shortURL,
//     longURL: urlDatabase[shortURL].address,
//     user: users[cookieUserId],
//     visitCount: visitCount
//   };
//   res.render('urls_show', templateVars);
// });


// // put: update
// app.put('/urls/:id', (req, res) => {
//   const {shortURL, newLongURL} = req.body;
//   const options = {
//     url: newLongURL,
//     timeout: 3000
//   };
//   // create object to compile results of getRequestResults()
//   const reqInput = {
//     user: users[req.session.user_id],
//     shortURL: shortURL,
//     longURL: newLongURL,
//     suggestion: ''
//   };

//   // send a request to a new URL and receive a response
//   getRequestResults(request, options, reqInput).then(templateVars => {
//     if (templateVars.errName) {
//       // error found in URL. render urls_show.ejs to show error message
//       res.render('urls_show', templateVars);
//     } else {
//       // longURL works fine. Update the database
//       urlDatabase[shortURL].address = newLongURL;
//       res.redirect('/urls');
//     }
//   });
// });


// // delete
// // post -> delete by method-override
// app.delete('/urls/:id', (req, res) => {
//   const shortURL = req.params.id;
//   delete urlDatabase[shortURL];
//   res.redirect('/urls');
// });


app.listen(port, () => {
  console.log(`Example app listening to port ${port}!`);
});