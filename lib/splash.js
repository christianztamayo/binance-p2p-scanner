const fs = require('fs');
const path = require('path');

// This neat splash is generated from https://patorjk.com/software/taag/
// Font Name: Slant

module.exports = () => {
  // Read the file and print its contents.
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'splash.txt'), 'utf8', (error, data) => {
      if (error) {
        reject(error);
      }
      console.log(data);
      resolve();
    });
  });
};
