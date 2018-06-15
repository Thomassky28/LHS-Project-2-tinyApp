const getRequestResults = function(request, options, message){
  return new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if(err){
        // add error name and message to message obj
        message.errName = err.name;
        message.errMessage = err.message;
        if(/^invalid url|uri/i.test(err.message)){
          // for invalid URL, add the cause of the error to err.suggestion
          message.suggestion =  '- Make sure your URL contains http://';
        }else if (/timedout/i.test(err.message)){
          // add a useful comment to err.suggestion
          message.suggestion = '- Check if your URL is valid!';
        }
        // return message;
        resolve(message);
        return;
      }

      switch(true){
        case (400 <= res.statusCode):
          // status code 400 series: client errors, status code 500 series: server errors
          message.errName = `Error ${res.statusCode}`;
          message.errMessage = res.statusMessage;
          message.suggestion = '';
          resolve(message);
          // break;
        default:
          resolve(message);
      }
    }).setMaxListeners(0);
  });
};

// Generate a string of 6 random alphanumeric characters
function generateRandomString(length){
  const ingredient = '0123456789albcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
 
  for(let i = 0; i < length; i++){
    const index = Math.floor(Math.random() * ingredient.length);
    result += ingredient[index];
  }
  
  return result;
}

/*
  Find a value (needle) in an object (haystack). If the value exists, return the value, if not return an empty array
  Options for identity: 
  1. key: find needle in a haystack as a key
  2. value: find needle in a haystack as a value
*/
function lookUpObj(needle, identity, haystack){
  if(identity === 'key'){
    return Object.keys(haystack).filter(key => needle === key);
  }else if(identity === 'value'){
    return Object.values(haystack).filter(val => needle === val);
  }
}

function urlsForUser(id, urlDatabase){
  const result = {};
  Object.values(urlDatabase).forEach(item => {
    if(item.user_id === id){
      result[item.id] = item;
    }
  });
  return result;
}

// Export the function
module.exports = {
  getRequestResults: getRequestResults,
  generateRandomString: generateRandomString,
  lookUpObj: lookUpObj,
  urlsForUser: urlsForUser
};