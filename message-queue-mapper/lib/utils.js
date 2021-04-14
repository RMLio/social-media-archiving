const path = require('path');

module.exports = {
  appendDateToFilename: (filename) => {
    const date = new Date().toISOString().replace('T', ' ').substr(0, 10);
    return filename.replace('$date$', date);
  }
}
