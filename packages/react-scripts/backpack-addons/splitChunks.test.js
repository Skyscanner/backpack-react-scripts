'use strict';

let mockPackageJson = {};

jest.mock('../package.json', () => ({
  'backpack-react-scripts': mockPackageJson,
}));

describe('splitChunks addon', () => {
  let splitChunks;
  beforeEach(() => {
    mockPackageJson = {};
    jest.isolateModules(() => {
      splitChunks = require('./splitChunks');
    });
  });

  it('by default is {}', () => {
    expect(splitChunks()).toEqual({ splitChunks: {} });
  });

  it('enableBpkStylesChunk should define a bpkStyles cache group', () => {
    mockPackageJson.enableBpkStylesChunk = true;
    expect(splitChunks().splitChunks.cacheGroups.bpkStyles).toBeDefined();
  });

  it('enableAutomaticChunking should add chunks: all and have an empty cacheGroups', () => {
    mockPackageJson.enableAutomaticChunking = true;
    expect(splitChunks()).toEqual({
      splitChunks: {
        chunks: 'all',
        cacheGroups: {},
      },
    });
  });

  it('enableAutomaticChunking & vendorsChunkRegex should add chunks: all and have a user customised cacheGroup', () => {
    mockPackageJson.enableAutomaticChunking = true;
    mockPackageJson.vendorsChunkRegex =
      '[\\/]node_modules[\\/]((?!bpk-.*?)(?!@skyscanner.*?).*?)[\\/]';
    expect(splitChunks()).toEqual({
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          defaultVendors: {
            test: new RegExp(mockPackageJson.vendorsChunkRegex),
          },
        },
      },
    });
  });

  it('splitChunksConfig should allow custom cache groups to be defined by users', () => {
    mockPackageJson.splitChunksConfig = {
      chunks: 'async',
      cacheGroups: {
        myCacheGroup: {
          test: '/myModule/',
        },
      },
    };

    expect(splitChunks()).toEqual({
      splitChunks: {
        chunks: 'async',
        cacheGroups: {
          myCacheGroup: {
            test: /\/myModule\//,
          },
        },
      },
    });
  });
});
