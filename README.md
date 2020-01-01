[![Build Status](https://travis-ci.org/Siggg/culottes.svg?branch=master)](https://travis-ci.org/Siggg/culottes)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Coveralls](http://img.shields.io/coveralls/Siggg/culottes.svg)](https://coveralls.io/r/Siggg/culottes)
[![Maintainability](https://api.codeclimate.com/v1/badges/46003502d86e3dbcf15e/maintainability)](https://codeclimate.com/github/Siggg/culottes/maintainability)
[![Last commit](https://img.shields.io/github/last-commit/Siggg/culottes.svg)](https://github.com/Siggg/culottes/commits/master)
[![Issues](https://img.shields.io/codeclimate/issues/Siggg/culottes.svg)](https://codeclimate.com/github/Siggg/culottes/issues)

# culottes

This blockchain application distributes cryptomoney from donors to people who match criteria specific to your cause. 100% decentalized and autonomous redistribution of wealth, without intermediaries. Culottes disrupts social justice systems and redistributes additional income to people who need or deserve it.

Culottes lets your community vote and bet on whoever deserves or needs additional income according to your cause criteria. Their votes select beneficiaries. It collects volunteer donations (and taxes on dapp votes) then redistributes that cryptomoney as additional income to selected beneficiaries.

Anybody can claim they match the cause criteria and apply for income. Anybody can vote for or against any candidate.

See [the live prototype being built](https://siggg.github.io/culottes).

Specific culottes could redistribute income for specific causes:

* [big contributors to **opensource software projects**](https://siggg.github.io/culottes)
* [great **artists** with not so great income](how_to.md)
* [winners of oceans cleaning bounties who keep **cleaning beaches** once bounties are over](how_to.md)
* [big contributors to the **Wikipedia**](how_to.md)
* [**social entrepreneurs** with a proven track of record](how_to.md)
* [people currently living in **Mali**](how_to.md)
* [people struggling with **less than 1 dollar of income per day*](how_to.md)
* [volunteers who give almost 100% of their culottes income directly to **homeless people**](how_to.md)
* [_What's your social justice cause ? It probably deserves its own culottes game and source of income!_](how_to.md)
* ...

Thanks to the culottes system, truth about "who matches your cause criteria" prevails more often than not and your revolution can enable social justice. Game theorists call this voting and betting system a "Schelling game". It can serve any cause and you can [create your own culottes for your community cause](how_to.md). It runs on the Ethereum blockchain. It is distributed under the GNU Affero General Public License 3.0.

See also [the culottes board game](https://siggg.gitlab.io/culottes) : it is a paper-based simulation of this software application and can be played with your friends. You can get familiar with this voting and betting system using this board game.

# What does "culottes" mean ?

Culottes were fashionable silk knee-breeches (fancy trousers) typical of the French aristocracy in 1789 during the French Revolution. The "Sans-Culottes" were litterally "Without-Breeches". They were starving and had enough with privileges and social injustice. So they stormed the Bastille, abolished privileges and beheaded their king. If only they had had a culottes dapp...

# Demo use case

See [the description of our demo use case](demo_use_case.md).

# If you want to contribute

Here are some useful command lines for contributing code once you have cloned this repo. This is more or less my workflow.

Will incorporate latest changes from the remote repo into the current branch of your local repo :

  git pull

Will build and test your code :

  export CHROME_BIN=/usr/bin/chromium-browser
  ci/build.sh

If ever you run into an error where it's being complained that your version of Chrome (chromium-browser --version) is ahead of the version supported by the chromedriver used for running tests, then you may have to upgrade chromedriver accordingly.

Will run a local version of your dapp so that you can live test your changes :

  ng serve

Will tell you about the differences between your local files and files on the remote git repo :

  git diff HEAD

Will show you which files are to be pushed to the git repo :

  git status

Will add those modified files to the git working copy :

  git add <filename>

Will commit and push these to the git repo :

  git commit -m "<some commit message>" && git push

Will deploy your smart contract :

  truffle compile && truffle build && truffle migrate -f 2 --network rinkebyInfura --reset --compile-all

Will update your node then angular dependencies and audit them for issues then possibly fix these issues :

  npm install-test
  ng update
  ng update --all
  ng audit
  ng audit fix
