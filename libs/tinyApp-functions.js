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


// Export the function
module.exports = {
  generateRandomString: generateRandomString,
  addCookiesToObj: addCookiesToObj
};