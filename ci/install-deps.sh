#!/usr/bin/env sh
set -x
npm install -g truffle
npm install -g ganache-cli
npm install typescript@3.5.3
npm install

# Lines below because of https://github.com/angular/webdriver-manager/issues/404
cd node_modules/protractor
# npm install webdriver-manager@latest
# Sometimes webdriver-manager will know of a chrome version which is not already available on your system.
# Then you have to force that system version on webdriver-manager or it will fail.
bin/webdriver-manager clean
bin/webdriver-manager update --versions.chrome 79.0.3945.130
cd ../..
