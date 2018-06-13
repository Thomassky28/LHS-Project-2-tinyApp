// Generate a string of 6 random alphanumeric characters
function generateRandomString(){
  const stringLen = 6;
  let result = '';

  for(let i = 0; i < stringLen; i++){
    // Generate a random integer between 0 - 2
    const cases = Math.floor(Math.random() * 3);

    if(cases === 0){
      // Number between 0 - 9
      result += Math.floor(Math.random() * 9);
    }else if(cases === 1){
      // Uppercase letter
      result += String.fromCharCode(65 + Math.floor(Math.random() * 25));
    }else if(cases ===2){
      // Lowercase letter
      result += String.fromCharCode(97 + Math.floor(Math.random() * 25));
    }
  }

  return result;
}

// Export the function
module.exports = generateRandomString;