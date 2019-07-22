Your preferred cause probably deserves its own culottes.

# How to create your own culottes

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

6. Setup your culottes smart contract

  * Open contracts/Revolution.sol in a text editor
  * Set the criteria to match for your cause (e.g. is this the address of "a frequent contributor to open source projects" ?)
  * Set the probability that a new vote will close its election (e.g. res > 6 means there is a 60% probability a new vote won't close their election)
  * Set the minimum number of blockchain blocks that any election will last
  * truffle compile
  * truffle build
  * truffle migrate -f 2 --network rinkebyInfura --reset --compile-all

7. Setup your Twitter bot

  * Login to a Twitter account
  * Register for a Twitter developer account
  * Create a new app
  * Copy its API key
  * Paste it in the twitter .py script from the culottes project
  * Set cron jobs to run this script several times per minutes (e.g. sleep 15 && python update.py)

8. Publish your dapp pages
9. Promote your culottes dapp

