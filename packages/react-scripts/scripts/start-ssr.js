/* eslint-disable no-undef */
// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end

// @brs-begin
/**
 * This script is a copy of start.js with an SSR compiler included. It runs
 * both the `web` and `ssr` builds at once, serving the `web` build exactly as
 * start does (with a WebpackDevServer), and spawning the `ssr` build in a
 * forked process.
 */
// @brs-end

'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const fs = require('fs');
const chalk = require('react-dev-utils/chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const {
  choosePort,
  prepareProxy,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const semver = require('semver');
const paths = require('../config/paths');
const configFactory = require('../config/webpack.config');
const createDevServerConfig = require('../config/webpackDevServer.config');
const getClientEnvironment = require('../config/env');
const react = require(require.resolve('react', { paths: [paths.appPath] }));

const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

// @brs-begin
const statusFile = require('../backpack-addons/ssr/statusFile');
const {
  createCustomCompiler,
} = require('../backpack-addons/ssr/customWebpackUtils');
const {
  MultiCompilerUi,
  WebCompilerUi,
  ProcessMessageCompilerUi,
} = require('../backpack-addons/ssr/MultiCompilerUi');
// @brs-end

const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  );
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  );
  console.log(
    `Learn more here: ${chalk.yellow('https://cra.link/advanced-config')}`
  );
  console.log();
}

// @brs-begin

const isDebugMode = !!process.argv.includes('--debug');

const ui = new MultiCompilerUi();
// @brs-end

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
const { checkBrowsers } = require('react-dev-utils/browsersHelper');
checkBrowsers(paths.appPath, isInteractive)
  .then(() => {
    // We attempt to use the default port but if it is busy, we offer the user to
    // run on a different port. `choosePort()` Promise resolves to the next free port.
    return choosePort(HOST, DEFAULT_PORT);
  })
  .then(port => {
    if (port == null) {
      // We have not found a port.
      return;
    }

    const config = configFactory('development');
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    const appName = require(paths.appPackageJson).name;

    const useTypeScript = fs.existsSync(paths.appTsConfig);
    const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';
    const urls = prepareUrls(
      protocol,
      HOST,
      port,
      paths.publicUrlOrPath.slice(0, -1)
    );
    const devSocket = {
      warnings: warnings =>
        devServer.sendMessage(devServer.sockets, 'warnings', warnings),
      errors: errors =>
        devServer.sendMessage(devServer.sockets, 'errors', errors),
    };

    // @brs-begin
    const webUi = new WebCompilerUi(
      'web',
      { color: 'bgBlue' },
      { appName, urls, useYarn }
    );
    ui.register(webUi);

    const compiler = createCustomCompiler(webUi, {
      appName,
      config,
      devSocket,
      urls,
      useYarn,
      useTypeScript,
      tscCompileOnError,
      webpack,
    });

    statusFile.init(compiler, paths.appBuildWeb);
    // @brs-end

    // Load proxy config
    const proxySetting = require(paths.appPackageJson).proxy;
    const proxyConfig = prepareProxy(
      proxySetting,
      paths.appPublic,
      paths.publicUrlOrPath
    );
    // Serve webpack assets generated by the compiler over a web server.
    const serverConfig = {
      ...createDevServerConfig(proxyConfig, urls.lanUrlForConfig),
      host: HOST,
      port,
    };

    // @brs-begin
    serverConfig.devMiddleware.writeToDisk = filePath => {
      return /loadable-stats\.json/.test(filePath);
    };
    // @brs-end

    const devServer = new WebpackDevServer(serverConfig, compiler);
    // Launch WebpackDevServer.
    devServer.startCallback(() => {
      if (isInteractive && !isDebugMode) {
        clearConsole();
      }

      if (env.raw.FAST_REFRESH && semver.lt(react.version, '16.10.0')) {
        console.log(
          chalk.yellow(
            `Fast Refresh requires React 16.10 or higher. You are using React ${react.version}.`
          )
        );
      }

      console.log(chalk.cyan('Starting the development server...\n'));
      openBrowser(urls.localUrlForBrowser);

      // @brs-begin
      // This method will clear the console, so we put it after CRA has logged the messages above.
      ui.start();
      // @brs-end
    });

    // @brs-begin
    const { fork } = require('child_process');
    const { join } = require('path');

    // We do this in a background process for performance - multicore, yo.
    const ssr = fork(join(__dirname, '../backpack-addons/ssr/forkSsr'));

    const ssrUi = new ProcessMessageCompilerUi(ssr, 'ssr', {
      color: 'bgMagenta',
    });
    ui.register(ssrUi);

    ssr.on('exit', code => {
      ssrUi.log(chalk.red(`Fatal! Process ended with code ${code}`));
      devServer.close();
      process.exit();
    });
    // @brs-end

    ['SIGINT', 'SIGTERM'].forEach(function (sig) {
      process.on(sig, function () {
        devServer.close();
        // @brs-begin
        ssr.kill();
        process.exit();
        // @brs-end
      });
    });

    if (process.env.CI !== 'true') {
      // Gracefully exit when stdin ends
      process.stdin.on('end', function () {
        devServer.close();
        // @brs-begin
        ssr.kill();
        process.exit();
        // @brs-end
      });
    }
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
