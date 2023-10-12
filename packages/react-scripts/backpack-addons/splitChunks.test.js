'use strict';

jest.mock('../config/paths', () => ({
  appPackageJson: './test/mockPackage.json',
}));

describe('splitChunks', () => {
  const mockData = {
    name: 'test',
    version: '1.0.0',
    'backpack-react-scripts': {},
  };

  let isEnvDevelopment = true;

  beforeEach(() => {
    jest.resetModules();
  });

  test('should return default if no config defined', () => {
    jest.doMock('./test/mockPackage.json', () => ({
      ...mockData,
      'backpack-react-scripts': {},
    }));
    const splitChunks = require('../backpack-addons/splitChunks');

    let res = splitChunks(isEnvDevelopment);

    expect(res).toEqual({ splitChunks: {} });
  });

  test('should apply basic defaults if automatic chunking enabled without vendors regex', () => {
    jest.doMock('./test/mockPackage.json', () => ({
      ...mockData,
      'backpack-react-scripts': {
        enableAutomaticChunking: true,
      },
    }));
    const splitChunks = require('../backpack-addons/splitChunks');

    let res = splitChunks(isEnvDevelopment);

    expect(res).toEqual({
      splitChunks: { chunks: 'all', name: true, cacheGroups: {} },
    });
  });

  test('should return empty if automatic chunking false and no other config is defined', () => {
    jest.doMock('./test/mockPackage.json', () => ({
      ...mockData,
      'backpack-react-scripts': {
        enableAutomaticChunking: false,
      },
    }));
    const splitChunks = require('../backpack-addons/splitChunks');

    let res = splitChunks(isEnvDevelopment);

    expect(res).toEqual({ splitChunks: {} });
  });

  test('should apply basic defaults and cacheGroup with vendors RegExp when automatic chunking enabled and vendors regex provided', () => {
    jest.doMock('./test/mockPackage.json', () => ({
      ...mockData,
      'backpack-react-scripts': {
        enableAutomaticChunking: true,
        vendorsChunkRegex: '[\\/]node_modules[\\/]',
      },
    }));
    const splitChunks = require('../backpack-addons/splitChunks');

    let res = splitChunks(isEnvDevelopment);

    expect(res).toEqual({
      splitChunks: {
        chunks: 'all',
        name: true,
        cacheGroups: { vendors: { test: expect.any(RegExp) } },
      },
    });
  });

  test('should return empty when automatic chunking disabled and vendors regex provided', () => {
    jest.doMock('./test/mockPackage.json', () => ({
      ...mockData,
      'backpack-react-scripts': {
        enableAutomaticChunking: false,
        vendorsChunkRegex: '[\\/]node_modules[\\/]',
      },
    }));
    const splitChunks = require('../backpack-addons/splitChunks');

    let res = splitChunks(isEnvDevelopment);

    expect(res).toEqual({ splitChunks: {} });
  });

  test('should ignore custom config when automatic chunking enabled and splitChunksConfig is also defined', () => {
    jest.doMock('./test/mockPackage.json', () => ({
      ...mockData,
      'backpack-react-scripts': {
        enableAutomaticChunking: true,
        splitChunksConfig: {
          cacheGroups: {
            vendors: {
              test: '[\\/]node_modules[\\/]',
            },
            someCustomChunk: {
              test: '[\\/]some_regex[\\/]',
              priority: 100,
              chunks: 'all',
              name: 'someCustomChunk',
            },
          },
        },
      },
    }));
    const splitChunks = require('../backpack-addons/splitChunks');

    let res = splitChunks(isEnvDevelopment);

    expect(res).toEqual({
      splitChunks: { chunks: 'all', name: true, cacheGroups: {} },
    });
  });

  test('should not ignore custom config when automatic chunking disabled and splitChunksConfig is defined', () => {
    jest.doMock('./test/mockPackage.json', () => ({
      ...mockData,
      'backpack-react-scripts': {
        enableAutomaticChunking: false,
        splitChunksConfig: {
          chunks: 'all',
          cacheGroups: {
            vendors: {
              test: '[\\/]node_modules[\\/]',
            },
          },
        },
      },
    }));
    const splitChunks = require('../backpack-addons/splitChunks');

    let res = splitChunks(isEnvDevelopment);

    expect(res).toEqual({
      splitChunks: {
        chunks: 'all',
        name: true,
        cacheGroups: {
          vendors: {
            test: expect.any(RegExp),
          },
        },
      },
    });
  });

  test('should apply only the name field when splitChunks is empty', () => {
    jest.doMock('./test/mockPackage.json', () => ({
      ...mockData,
      'backpack-react-scripts': {
        enableAutomaticChunking: false,
        splitChunksConfig: {},
      },
    }));
    const splitChunks = require('../backpack-addons/splitChunks');

    let res = splitChunks(isEnvDevelopment);

    expect(res).toEqual({ splitChunks: { name: true } });
  });

  test('should apply Regexes when multiple cacheGroups are applied', () => {
    jest.doMock('./test/mockPackage.json', () => ({
      ...mockData,
      'backpack-react-scripts': {
        enableAutomaticChunking: false,
        splitChunksConfig: {
          chunks: 'all',
          cacheGroups: {
            vendors: {
              test: '[\\/]node_modules[\\/]',
            },
            someCustomChunk: {
              test: '[\\/]some_regex[\\/]',
              priority: 100,
              chunks: 'all',
              name: 'someCustomChunk',
            },
          },
        },
      },
    }));
    const splitChunks = require('../backpack-addons/splitChunks');

    let res = splitChunks(isEnvDevelopment);

    expect(res).toEqual({
      splitChunks: {
        chunks: 'all',
        name: true,
        cacheGroups: {
          vendors: {
            test: expect.any(RegExp),
          },
          someCustomChunk: {
            test: expect.any(RegExp),
            priority: 100,
            chunks: 'all',
            name: 'someCustomChunk',
          },
        },
      },
    });
  });

  test('should apply isEnvDevelopment boolean as name value', () => {
    let isEnvDevelopment = false;
    jest.doMock('./test/mockPackage.json', () => ({
      ...mockData,
      'backpack-react-scripts': {
        enableAutomaticChunking: true,
      },
    }));
    const splitChunks = require('../backpack-addons/splitChunks');

    let res = splitChunks(isEnvDevelopment);

    expect(res).toEqual({
      splitChunks: { chunks: 'all', name: false, cacheGroups: {} },
    });
  });
});
