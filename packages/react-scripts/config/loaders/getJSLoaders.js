'use strict';

const withIncludedPrefixes = require('../../backpack-addons/babelIncludePrefixes');
const getCacheIdentifier = require('react-dev-utils/getCacheIdentifier');

function getJSLoaders(
  isEnvProduction,
  isEnvDevelopment,
  shouldUseReactRefresh,
  hasJsxRuntime,
  shouldUseSourceMap
) {
  return [
    // Process application JS with Babel.
    // The preset includes JSX, Flow, TypeScript, and some ESnext features.
    {
      test: /\.(js|mjs|cjs|jsx|ts|tsx)$/,
      include: withIncludedPrefixes(), // #backpack-addons babelIncludePrefixes
      loader: require.resolve('babel-loader'),
      options: {
        customize: require.resolve('babel-preset-react-app/webpack-overrides'),
        presets: [
          [
            require.resolve('babel-preset-react-app'),
            {
              runtime: hasJsxRuntime ? 'automatic' : 'classic',
            },
          ],
        ],
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
        // @remove-on-eject-end
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
      test: /\.(js|mjs|cjs)$/,
      exclude: [/@babel(?:\/|\\{1,2})runtime/, ...withIncludedPrefixes()],
      loader: require.resolve('babel-loader'),
      options: {
        babelrc: false,
        configFile: false,
        compact: false,
        presets: [
          [
            require.resolve('babel-preset-react-app/dependencies'),
            { helpers: true },
          ],
        ],
        cacheDirectory: true,
        // See #6846 for context on why cacheCompression is disabled
        cacheCompression: false,
        // @remove-on-eject-begin
        cacheIdentifier: getCacheIdentifier(
          isEnvProduction ? 'production' : isEnvDevelopment && 'development',
          [
            'babel-plugin-named-asset-import',
            'babel-preset-react-app',
            'react-dev-utils',
            'react-scripts',
          ]
        ),
        // @remove-on-eject-end
        // Babel sourcemaps are needed for debugging into node_modules
        // code.  Without the options below, debuggers like VSCode
        // show incorrect code and set breakpoints on the wrong lines.
        sourceMaps: shouldUseSourceMap,
        inputSourceMap: shouldUseSourceMap,
      },
    },
  ];
}

module.exports = {
  getJSLoaders,
};
