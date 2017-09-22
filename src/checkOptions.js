/**
 * Validates the options.
 * Return true if errors are found.
 *
 * @param {Object} options Parameters paased to the program
 */
module.exports = function(options) {
  if (!options.url && !options.url) {
    console.log('Error. Mandatory URL & HTTP type parameters not provided.');
    return true;
  } else if (!options.url) {
    console.log('Error. Mandatory URL parameter not provided.');
    return true;
  } else if (!options.type) {
    console.log('Error. Mandatory HTTP request type parameter not provided.');
    return true;
  } else if (options.type.match(/post/i) && !options.file) {
    console.log('Error. Missing JSON file for POST request.');
    return true;
  }
};
