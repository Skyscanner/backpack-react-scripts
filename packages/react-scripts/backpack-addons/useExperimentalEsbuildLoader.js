'use strict';

const paths = require('../config/paths');
const appPackageJson = require(paths.appPackageJson);
const bpkReactScriptsConfig = appPackageJson['backpack-react-scripts'] || {};
const useExperimentalEsbuildLoader =
  bpkReactScriptsConfig.useExperimentalEsbuildLoader || false;

module.exports = {
  useExperimentalEsbuildLoader,
};
