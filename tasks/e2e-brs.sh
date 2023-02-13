#!/bin/bash

# Start in tasks/ even if run from root directory
cd "$(dirname "$0")"

# App temporary location
# http://unix.stackexchange.com/a/84980
temp_app_path=`mktemp -d 2>/dev/null || mktemp -d -t 'temp_app_path'`

function cleanup {
  echo 'Cleaning up.'
  cd "$root_path"
  rm -rf "$temp_app_path"
}

# Error messages are redirected to stderr
function handle_error {
  echo "$(basename $0): ERROR! An error was encountered executing line $1." 1>&2;
  cleanup
  echo 'Exiting with error.' 1>&2;
  exit 1
}

function handle_exit {
  cleanup
  echo 'Exiting without error.' 1>&2;
  exit
}

# Check for the existence of one or more files.
function exists {
  for f in $*; do
    test -e "$f"
  done
}

# Exit the script with a helpful error message when any error is encountered
trap 'set +x; handle_error $LINENO $BASH_COMMAND' ERR

# Cleanup before exit on any termination signal
trap 'set +x; handle_exit' SIGQUIT SIGTERM SIGINT SIGKILL SIGHUP

# Echo every command being executed
set -x

# Go to root
cd ..
root_path=$PWD

# Pack PR version
cd packages/react-scripts
npm pack

# Install the app in a temporary location
cd $temp_app_path
npx create-react-app test-app --scripts-version=@skyscanner/backpack-react-scripts --template @skyscanner/backpack --use-npm

# Enter the app directory
cd test-app

# Install PR version
package_version=$(node -p -e "require('$root_path/packages/react-scripts/package.json').version")
npm install "$root_path"/packages/react-scripts/skyscanner-backpack-react-scripts-"$package_version".tgz

# Test the build
npm run build
# Check for expected output
exists build/*.html
exists build/static/js/*.js
exists build/static/css/*.css
# exists build/static/media/*.svg
exists build/favicon.ico

# Cleanup
cleanup
