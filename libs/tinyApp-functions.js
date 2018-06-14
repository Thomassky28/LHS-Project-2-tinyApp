// Generate a string of 6 random alphanumeric characters
function generateRandomString(){
  const ingredient = '0123456789albcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const stringLen = 6;
  let result = '';
 
  for(let i = 0; i < stringLen; i++){
    const index = Math.floor(Math.random() * ingredient.length);
    result += ingredient[index];
  }
  
  return result;
}

// Add cookies to an input object
function addCookiesToObj(req, inputObj){
  inputObj.cookies = req.cookies;
  return inputObj;
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


// Export the function
module.exports = {
  generateRandomString: generateRandomString,
  addCookiesToObj: addCookiesToObj,
  lookUpObj: lookUpObj
};