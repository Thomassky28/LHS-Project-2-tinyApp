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


// Export the function
module.exports = {
  generateRandomString: generateRandomString,
  lookUpObj: lookUpObj
};