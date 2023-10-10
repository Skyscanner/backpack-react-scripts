'use strict';

const paths = require('../config/paths');
const appPackageJson = require(paths.appPackageJson);
const bpkReactScriptsConfig = appPackageJson['backpack-react-scripts'] || {};

/**
 * Defines a webpack splitChunks configuration, optionally based on consumer configuration.
 * 
 * For automatic configuration set enableAutomaticChunking and optionally provide a vendorsChunkRegex string, e.g:
 * 
 * // package.json
 * ...
 * "backpack-react-scripts": {
 *    ...
 *    "enableAutomaticChunking": true,
 *    "vendorsChunkRegex": "...",
 *    ...
 * }
 * ...
 * 
 * For custom configuration disable enableAutomaticChunking and provide a configuration object, e.g:
 * 
 * // package.json
 * ...
 * "backpack-react-scripts": {
 *    ...
 *    "enableAutomaticChunking": false,
 *    "splitChunksConfig": {
 *       "chunks": "all",
 *       ...
 *       "cacheGroups": {
 *         "vendors": {
 *           "test": "..."
 *         },
 *         "customChunk": {
 *           "test": "..."
 *           "priority": 100,
 *           "chunks": "all",
 *           "name": "customChunk",
 *         },
 *      },
 *    ...
 * }
 * ...
 * 
 * References:
 * https://webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks
 * https://webpack.js.org/plugins/split-chunks-plugin/#splitchunkscachegroups
 * https://twitter.com/wSokra/status/969633336732905474
 * https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
 */

module.exports = (isEnvDevelopment) => {

  let splitChunksConfig =  {}

  // If opted in to automatic chunking, apply default configuration
  if (bpkReactScriptsConfig.enableAutomaticChunking) {
    splitChunksConfig = {
      chunks: 'all',
      name: isEnvDevelopment,
      cacheGroups: {},
    };
    // Apply vendorsChunkRegex if provided
    if (bpkReactScriptsConfig.vendorsChunkRegex) {
      splitChunksConfig.cacheGroups = {
        vendors: {
          // Regexes are passed as strings in package.json config, but need constructed here.
          test: new RegExp(bpkReactScriptsConfig.vendorsChunkRegex),
        },
      };
    }
  }
  // If not opted in to automatic chunking, use custom configuration - if defined.
  else if(bpkReactScriptsConfig.splitChunksConfig) {
    // 
    splitChunksConfig = { ...bpkReactScriptsConfig.splitChunksConfig, name: isEnvDevelopment}
    // Regexes are passed as strings in package.json config, but need constructed here.
    for(let cacheGroup of Object.keys(splitChunksConfig.cacheGroups)){
      splitChunksConfig.cacheGroups[cacheGroup].test = new RegExp(splitChunksConfig.cacheGroups[cacheGroup].test);
    }
  }

  return {
    splitChunks: splitChunksConfig
  };
};
