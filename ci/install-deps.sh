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
# You can check Travis logs in order to identify the available chrome version on your system
# or run chrome --version to read it from the command line
bin/webdriver-manager clean
bin/webdriver-manager update --chrome=true --gecko=false --standalone=false --versions.chrome 83.0.4103.97-1
# 81.0.4044.138-1
# 80.0.3987.106
# 79.0.3945.130
cd ../..
