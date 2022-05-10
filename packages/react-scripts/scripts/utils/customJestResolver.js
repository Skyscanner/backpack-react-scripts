// Temporary workaround until Jest 28
const resolver = require('enhanced-resolve').create.sync({
  conditionNames: ['require', 'node', 'default'],
  extensions: ['.js', '.jsx', '.json', '.node', '.ts', '.tsx'],
});

module.exports = function (request, options) {
  // list global module that must be resolved by defaultResolver here
  if (['fs', 'http', 'path'].includes(request)) {
    return options.defaultResolver(request, options);
  }
  return resolver(options.basedir, request);
};
