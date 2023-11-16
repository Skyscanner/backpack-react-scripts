'use strict';

const { resolveToEsbuildTarget } = require('esbuild-plugin-browserslist');
const browserslist = require('browserslist');
const getCacheIdentifier = require('react-dev-utils/getCacheIdentifier');

const target = resolveToEsbuildTarget(browserslist(), {
  printUnknownTargets: false,
});

function getEsbuildCustomLoaders(
  prefixes,
  isEnvProduction,
  isEnvDevelopment,
  shouldUseReactRefresh
) {
  return [
    {
      // Loadable Components require special treatment with Babel plugin
      // When used with Esbuild loader, they should still be transpiled with Babel first
      test: /\.loadable\.(ts|js)$/,
      include: prefixes,
      loader: require.resolve('babel-loader'),
      options: {
        customize: require.resolve('babel-preset-react-app/webpack-overrides'),
        presets: [[require.resolve('babel-preset-react-app')]],
        // @remove-on-eject-begin
        babelrc: false,
        configFile: false,
        // Make sure we have a unique cache identifier, erring on the
        // side of caution.
        // We remove this when the user ejects because the default
        // is sane and uses Babel options. Instead of options, we use
        // the react-scripts and babel-preset-react-app versions.
        cacheIdentifier: getCacheIdentifier(
          isEnvProduction ? 'production' : isEnvDevelopment && 'development',
          [
            'babel-plugin-named-asset-import',
            'babel-preset-react-app',
            'react-dev-utils',
            'react-scripts',
          ]
        ),
        plugins: [
          require.resolve('@loadable/babel-plugin'),
          isEnvDevelopment &&
            shouldUseReactRefresh &&
            require.resolve('react-refresh/babel'),
        ].filter(Boolean),
        // This is a feature of `babel-loader` for webpack (not Babel itself).
        // It enables caching results in ./node_modules/.cache/babel-loader/
        // directory for faster rebuilds.
        cacheDirectory: true,
        // See #6846 for context on why cacheCompression is disabled
        cacheCompression: false,
        compact: isEnvProduction,
      },
    },
    {
      test: /\.(mjs|cjs|ts|tsx)$/,
      loader: require.resolve('esbuild-loader'),
      include: prefixes,
      options: {
        target,
      },
    },
    {
      test: /\.(js|jsx)$/,
      loader: require.resolve('esbuild-loader'),
      include: prefixes,
      options: {
        target,
        loader: 'jsx',
      },
    },
    {
      test: /\.(js|mjs|cjs)$/,
      loader: require.resolve('esbuild-loader'),
      exclude: [/@babel(?:\/|\\{1,2})runtime/, ...prefixes],
      options: {
        target,
        loader: 'js',
      },
    },
  ];
}

module.exports = {
  getEsbuildCustomLoaders,
};
