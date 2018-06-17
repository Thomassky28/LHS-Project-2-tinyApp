const getRequestResults = function (request, options, message) {
  // reference to Promise(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
  return new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (err) {
        // add error name and message to message obj
        message.errName = err.name;
        message.errMessage = err.message;
        message.suggestion = '- Please enter a valid URL';
        // return message as error;
        reject(message);
        return;
      } else if (400 <= res.statusCode) {
        // status code 400 series: client errors, status code 500 series: server errors
        message.errName = `Error ${res.statusCode}`;
        message.errMessage = res.statusMessage;
        message.suggestion = '';
        reject(message);
        return;
      } else {
        // if everything's good, resolve with no error message
        resolve();
      }

    }).setMaxListeners(0);
  });
};

// Generate a string of 6 random alphanumeric characters
function generateRandomString(length) {
  const ingredient = '0123456789albcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * ingredient.length);
    result += ingredient[index];
  }

  return result;
}

function urlsForUser(id, urlDatabase) {
  const result = {};
  Object.values(urlDatabase).forEach(item => {
    if (item.owner === id) {
      result[item.id] = item;
    }
  });
  return result;
}

// Trim http:// or https://
function trimHTTP(string) {
  return string.replace(/^(h(t+)p(s)?)(:|;)?(\/+)?/ig, '');
}

// Export the function
module.exports = {
  getRequestResults: getRequestResults,
  generateRandomString: generateRandomString,
  urlsForUser: urlsForUser,
  trimHTTP: trimHTTP
};