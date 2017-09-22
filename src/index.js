const axios = require('axios');
const fs = require('fs');
var checkOptions = require('./checkOptions');

/**
 * Safely parse JSON
 * Returns parsed JSON. Throws error if parsing fails.
 *
 * @param {Object} json The json data to be parsed.
 * @param {Boolean} debug Flag to determine if logging should be displayed
 */
function parseJSON(json, debug) {
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    if (debug) console.log('Cannot parse file contents');
    throw err;
  }
  return parsed;
}

/**
 * Entry point into the module.
 * Parses and validates the options, then performs the request.
 *
 * @param {Object} options The parameter options.
 */
module.exports = function request(options) {
  const error = checkOptions(options);
  if (error) {
    return 0;
  }

  const outputFile = options.output || 'response.json';
  const timeout = options.timeout ? options.timeout : 3000;
  const debug = options.debug ? true : false;

  let fileContents;
  let data;

  // Check if method is POST, if so, read the JSON from file
  if (options.type.match(/post/i)) {
    try {
      fileContents = fs.readFileSync(options.file, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') {
        // File was not found
        if (debug) console.log(`Error. JSON file "${options.file}" not found.`);
        return 0;
      }
      // Some other error occurred when trying to read the file
      if (debug) console.log(`Error. Could not read JSON file "${options.file}"`);
      return 0;
    }
  }

  if (fileContents) {
    data = parseJSON(fileContents, debug);
  } else {
    data = '';
  }

  // HTTP request headers
  axios.defaults.headers.get['Content-Type'] = 'application/json';
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  if (options.token) axios.defaults.headers.common['Authorization'] = 'Bearer ' + options.token;

  // Make HTTP request
  axios({
    method: options.type,
    url: options.url,
    timeout: timeout,
    data: data,
  })
    .then(function(response) {
      fs.writeFile(outputFile, JSON.stringify(response.data), err => {
        if (err) {
          if (debug) console.log('Error.', err);
          // Something went wrong when trying to write to a file
          throw err;
        }
        if (debug) console.log(`Success. JSON response saved to file "${outputFile}"`);
        return 1;
      });
    })
    .catch(function(error) {
      if (error.response) {
        // Request was made and the server responded with status code outside 2xx
        if (debug) console.log('Error.', error.response.status);
      } else if (error.request) {
        // Request was made but no response was received
        if (debug) console.log('Error.', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        if (debug) console.log('Error.', error.message);
      }
      if (debug) console.log('Error.', error.config);
      return 0;
    });
};
