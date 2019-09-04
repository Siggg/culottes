Your preferred cause probably deserves its own revolution.

# How to create your own revolution, the lazy way (recommended)

1. Open contracts/Revolution.sol
2. Update the parameters inside (criteria, amount to be distributed, period of distribution, ...)
3. Send me your setting by email to sig arobase akasig dot org
4. I may deploy your revolution smart contract and add it to main dapp

# How to create your own revolution, the badass way

1. Use a linux computer
2. Open a terminal
3. Clone the culottes project from github
4. Connect to the Ethereum blockchain

  * Install Metamask
  * Create an Ethereum account with Metamask
  * Send some Ether to that Ethereum account
  * Copy the secret passphrase of that account
  * Paste and save that passphrase in a file named .secret and put it at the root folder of your culottes project clone

5. Get an Infura API Key

  * Sign-up at infura.com
  * Register a new project
  * Copy its public key
  * Open truffle.js in a text editor
  * Paste the value of the infura key where appropriate

6. Setup your revolution smart contract

  * Open contracts/Revolution.sol in a text editor
  * Set the criteria to match for your cause (e.g. is this the address of "a frequent contributor to open source projects" ?)
  * Set the probability that a new vote will close its election (e.g. res > 6 means there is a 60% probability that the first vote in any block WILL NOT close their election, i.e. the first vote in a block will close its trial in 40% of cases)
  * Set the minimum number of blockchain blocks that any trial will last
  * truffle compile
  * truffle build
  * truffle migrate -f 2 --network rinkebyInfura --reset --compile-all
  * take not of the address your revolution smart contract was published to
  * paste it into a new entry of the revolutions object in src/app/utils/web3.service.ts
  * send it to sig arobase akasig dot org so that I may add it to the main dapp

7. Publish your version of the dapp

  * Setup your Travis-ci.org account
  * setup your github pages preferences
  * commit and push to your github account
  * travis should run your continuous integration scripts and deploy your version of the dapp to your github pages site.
  
  
8. Setup your Twitter bot

  * Login to a Twitter account
  * Register for a Twitter developer account
  * Create a new app
  * Copy its API key
  * Paste it in the twitter .py script from the culottes project
  * Set cron jobs to run this script several times per minutes (e.g. sleep 15 && python update.py)
 
9. Promote your revolution


