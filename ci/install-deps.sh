#!/usr/bin/env sh
set -x
npm install -g truffle
npm install -g ganache-cli
npm install

# Lines below because of https://github.com/angular/webdriver-manager/issues/404
cd node_modules/protractor
npm install webdriver-manager@latest
cd ../..
