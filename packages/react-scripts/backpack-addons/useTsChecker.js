'use strict';

const ForkTsCheckerWebpackPlugin =
  process.env.TSC_COMPILE_ON_ERROR === 'true'
    ? require('react-dev-utils/ForkTsCheckerWarningWebpackPlugin')
    : require('react-dev-utils/ForkTsCheckerWebpackPlugin');

const paths = require('../config/paths');
const appPackageJson = require(paths.appPackageJson);
const resolve = require('resolve');
const bpkReactScriptsConfig = appPackageJson['backpack-react-scripts'] || {};
const skipProductionTypeCheck =
  bpkReactScriptsConfig.skipProductionTypeCheck || false;

const useTsChecker = (
  isEnvDevelopment,
  isEnvProduction,
  shouldUseSourceMap
) => {
  if (skipProductionTypeCheck && isEnvProduction) {
    return;
  }

  return new ForkTsCheckerWebpackPlugin({
    async: isEnvDevelopment,
    typescript: {
      typescriptPath: resolve.sync('typescript', {
        basedir: paths.appNodeModules,
      }),
      configOverwrite: {
        compilerOptions: {
          sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
          skipLibCheck: true,
          inlineSourceMap: false,
          declarationMap: false,
          noEmit: true,
          incremental: true,
          tsBuildInfoFile: paths.appTsBuildInfoFile,
        },
      },
      context: paths.appPath,
      diagnosticOptions: {
        syntactic: true,
      },
      mode: 'write-references',
      // profile: true,
    },
    issue: {
      // This one is specifically to match during CI tests,
      // as micromatch doesn't match
      // '../cra-template-typescript/template/src/App.tsx'
      // otherwise.
      include: [
        { file: '../**/src/**/*.{ts,tsx}' },
        { file: '**/src/**/*.{ts,tsx}' },
      ],
      exclude: [
        { file: '**/src/**/__tests__/**' },
        { file: '**/src/**/?(*.){spec|test}.*' },
        { file: '**/src/setupProxy.*' },
        { file: '**/src/setupTests.*' },
      ],
    },
    logger: {
      infrastructure: 'silent',
    },
  });
};

module.exports = {
  useTsChecker,
};
