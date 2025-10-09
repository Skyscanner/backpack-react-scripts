'use strict';

const paths = require('../../config/paths');

/**
 * Checking for loadable install, as there is need to set aliases when this is the case
 */
const isLocalComponents = () => {
  // Ensure `ssrEnabled` is on
  const appPackageJson = require(paths.appPackageJson);
  const isLocalComponentsInstalled =
    appPackageJson['@skyscanner-internal/local-components'] || {};

  return isLocalComponentsInstalled;
};

module.exports = isLocalComponents;
