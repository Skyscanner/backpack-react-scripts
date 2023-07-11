'use strict';
const getBabelIncludePrefixes = require('../backpack-addons/babelIncludePrefixes');

jest.mock('../config/paths', () => ({
  appSrc: '/Users/xxx/backpack-react-scripts/client/src',
  appPackageJson: './test/mockPackage.json',
  appPath: '/Users/xxx/backpack-react-scripts/client',
}));

describe('babelIncludePrefixes', () => {
  test('should handler babelIncludePrefixes correctly', () => {
    const babelIncludePrefixes = getBabelIncludePrefixes();

    expect(babelIncludePrefixes).toEqual([
      '/Users/xxx/backpack-react-scripts/client/src',
      /node_modules[\\/]bpk-/,
      /node_modules[\\/]saddlebag-/,
      /node_modules[\\/]@skyscanner[\\/]bpk-/,
      /node_modules[\\/]@skyscanner[\\/]backpack-web/,
      new RegExp('node_modules[\\/]@skyscanner'),
      '/Users/xxx/backpack-react-scripts/client/common',
      '/Users/xxx/backpack-react-scripts/common',
      '/server',
    ]);
  });
});
