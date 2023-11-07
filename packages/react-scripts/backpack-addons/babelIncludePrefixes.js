'use strict';

const paths = require('../config/paths');
const path = require('path');
const appPackageJson = require(paths.appPackageJson);
const bpkReactScriptsConfig = appPackageJson['backpack-react-scripts'] || {};
const customModuleRegexes = bpkReactScriptsConfig.babelIncludePrefixes
  ? bpkReactScriptsConfig.babelIncludePrefixes.map(prefix => {
      if (/^@skyscanner(.*)\/$/.test(prefix) || /^saddlebag-$/.test(prefix)) {
        console.warn(
          `Warning: Generic ${prefix} is not allowed as this could include transpilation of precompiled code. Please use a more specific prefix to transpile only the code you need.`
        );
      }
      if (prefix && /^(\.|\/)/.test(prefix)) {
        // if the prefixes starts with '.' or '/', e.g. '../common' './common' '/common'
        // That means it is a relative path which doesn't need to be in the node_modules folder
        return path.resolve(paths.appPath, prefix);
      }
      return new RegExp(`node_modules[\\/]${prefix}`);
    })
  : [];

// Backpack node module regexes
const scopedBackpackModulesRegex = /node_modules[\\/]@skyscanner[\\/]bpk-/;

module.exports = () => {
  return [paths.appSrc, scopedBackpackModulesRegex, ...customModuleRegexes];
};
