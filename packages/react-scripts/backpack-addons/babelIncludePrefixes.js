'use strict';

const paths = require('../config/paths');
const path = require('path');
const appPackageJson = require(paths.appPackageJson);
const bpkReactScriptsConfig = appPackageJson['backpack-react-scripts'] || {};
const customModuleRegexes = bpkReactScriptsConfig.babelIncludePrefixes
  ? bpkReactScriptsConfig.babelIncludePrefixes.map(prefix => {
      if (prefix && /^(\.|\/)/.test(prefix)) {
        // if the prefixes starts with '.' or '/', e.g. '../common' './common' '/common'
        // That means it is a relative path which doesn't need to be in the node_modules folder
        return path.resolve(paths.appPath, prefix);
      }
      return new RegExp(`node_modules[\\/]${prefix}`);
    })
  : [];

// Backpack / saddlebag node module regexes
const backpackModulesRegex = /node_modules[\\/]bpk-/;
const saddlebagModulesRegex = /node_modules[\\/]saddlebag-/;
const scopedBackpackModulesRegex = /node_modules[\\/]@skyscanner[\\/]bpk-/;
const backpackSinglePackageModulesRegex = /node_modules[\\/]@skyscanner[\\/]backpack-web/;

module.exports = () => {
  return [
    paths.appSrc,
    backpackModulesRegex,
    saddlebagModulesRegex,
    scopedBackpackModulesRegex,
    backpackSinglePackageModulesRegex,
    ...customModuleRegexes,
  ];
};
