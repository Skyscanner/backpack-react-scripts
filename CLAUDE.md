# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **backpack-react-scripts**, a Skyscanner fork of Facebook's Create React App (specifically the `react-scripts` package). It provides a customized build toolchain for React applications that use Skyscanner's Backpack design system. The fork is based on Create React App v5+ and adds Skyscanner-specific configuration and build features.

## Monorepo Structure

This is a Lerna monorepo with workspaces defined in the root `package.json`. Key packages:

- **`packages/react-scripts/`**: The main package containing webpack configs, build scripts, and the Backpack addons
- **`packages/create-react-app/`**: Global CLI for bootstrapping new apps
- **`packages/babel-preset-react-app/`**: Babel preset configuration
- **`packages/eslint-config-react-app/`**: ESLint configuration
- **`packages/react-dev-utils/`**: Shared utilities for development tooling
- **`packages/react-error-overlay/`**: Development error overlay UI
- **Other packages**: Templates, polyfills, and supporting packages

## Build Commands

### Root Level Commands

```bash
# Install dependencies (runs postinstall to build react-error-overlay)
npm install

# Run development server (uses template in packages/cra-template/template)
npm start

# Build production bundle
npm run build

# Run tests
npm test

# Run integration tests
npm run test:integration

# Run tests for backpack-addons specifically
npm run test:addons

# End-to-end tests (requires setup)
npm run e2e

# End-to-end tests in Docker
npm run e2e:docker

# Lint entire codebase
npm run eslint

# Format code with Prettier
npm run format

# Create a new app using local version
npm run create-react-app
```

### Testing End-to-End

To test locally without full e2e setup:

```bash
npx jest test/ --watchAll
```

To filter tests (e.g., webpack messages only):

- Press `p`
- Type pattern like `webpack-message`
- Press enter

## Architecture: Backpack Addons System

The key architectural feature is the **backpack-addons** system located in `packages/react-scripts/backpack-addons/`. This provides customization points for webpack configuration without ejecting.

### Adding New Backpack Addons

1. Create the feature module in `packages/react-scripts/backpack-addons/`
2. In webpack config files that use the addon (e.g., `webpack.config.js`, `webpack.config.ssr.js`):
   - Add `// #backpack-addon {{featureName}}` comment on every modified line
   - Require the addon module rather than writing inline code
3. Document the addon in `packages/react-scripts/backpack-addons/README.md`

### Available Backpack Addons

Configuration is read from `"backpack-react-scripts"` field in consuming app's `package.json`:

- **`babelIncludePrefixes`**: Module name prefixes to opt into Babel compilation (default: `["@skyscanner/bpk-", "bpk-"]`)
- **`sriEnabled`**: Enable Subresource Integrity for security (default: `false`)
- **`crossOriginLoading`**: Configure cross-origin loading for chunks (default: `false`)
- **`ignoreCssWarnings`**: Suppress CSS ordering warnings (default: `false`)
- **`cssModules`**: Enable CSS modules (default: `true`)
- **`amdExcludes`**: Modules to exclude from AMD parsing (default: `["lodash"]`)
- **`externals`**: Webpack externals configuration (default: `{}`)
- **`ssrExternals`**: Externals for SSR bundle only (default: `{}`)
- **`enableAutomaticChunking`**: Enable vendor/common chunk splitting (default: `false`)
- **`vendorsChunkRegex`**: Regex for vendor chunk content (requires `enableAutomaticChunking`)
- **`splitChunksConfig`**: Direct webpack splitChunks config (ignored if `enableAutomaticChunking` is true)
- **`enableBpkStylesChunk`**: Create single chunk for all Backpack CSS (default: `false`)

### Server-Side Rendering (SSR)

The fork includes SSR support with a separate webpack config:

- **`config/webpack.config.ssr.js`**: SSR-specific webpack configuration
- **`scripts/start-ssr.js`**: Development script that runs both client and SSR builds
- **`backpack-addons/ssr/`**: SSR-specific utilities including:
  - `forkSsr.js`: Forking logic for parallel client/SSR builds
  - `isSsr.js`: Detection of SSR environment
  - `customWebpackUtils.js`: SSR webpack customization utilities
  - `MultiCompilerUi.js`: UI for displaying parallel build status
  - `statusFile.js`: Status reporting for multi-compiler setup

## Key Webpack Configuration Files

- **`config/webpack.config.js`**: Main client-side webpack config
- **`config/webpack.config.ssr.js`**: Server-side rendering webpack config
- **`config/webpackDevServer.config.js`**: Dev server configuration
- **`config/paths.js`**: Path resolution and structure
- **`config/env.js`**: Environment variable handling

## Build Output Differences

Beyond standard CRA output, this fork generates:

- **`build/css.html`**: HTML partial with `<link>` tags for all CSS files
- **`build/js.html`**: HTML partial with `<script>` tags for all JS files
- These partials are useful when automatic chunking is enabled

## Upgrading from Upstream CRA

Process documented in `packages/react-scripts/backpack-addons/README.md`:

1. Replace all of `packages/react-scripts/` with upstream version
2. Restore `packages/react-scripts/backpack-addons/` folder from old version
3. Restore every line marked with `// #backpack-addon` comments
4. Compare and restore other modified files
5. Test thoroughly

## Release Process

This project uses Lerna for versioning and publishing:

```bash
# Generate changelog (requires GITHUB_AUTH env var)
npm run changelog

# Publish packages
npm run publish
```

Detailed release steps in `CONTRIBUTING.md`.

## Configuration Philosophy

Inherited from CRA: Prefer **convention over configuration**. Most settings are preconfigured, with customization available through:

1. The backpack-addons system for webpack config
2. Environment variables (e.g., `PORT`, `CI`)
3. Package.json fields (e.g., `browserslist`, `backpack-react-scripts`)

## Important Notes

- **Node version**: Requires Node >= 18.0.0
- **React version**: Requires React >= 18. The repo's own devDependencies use React 19
- **JSX runtime**: The babel preset defaults to the `automatic` JSX transform (React 17+). The `classic` runtime is still supported via the `runtime` option
- **CRA version compatibility**: Based on CRA v5+, newer versions may not work
- **Monorepo tooling**: Uses Lerna with npm workspaces
- **Husky hooks**: Pre-commit hook runs prettier on staged files
- **CSS Modules**: Enabled by default for `.css` and `.scss` files
- **Backpack compilation**: JSX in Backpack packages is automatically compiled
