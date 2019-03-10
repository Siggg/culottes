Your preferred cause probably deserves its own culottes.

# How to create your own culottes

1. Use a linux computer
2. Open a terminal
3. Clone the culottes project from github
4. Connect to the Ethereum blockchain
4.1. Install Metamask
4.2. Create an Ethereum account with Metamask
4.3. Send some Ether to that Ethereum account
4.4. Copy the secret passphrase of that account
4.5. Paste and save that passphrase in a file named .secret and put it at the root folder of your culottes project clone
5. Get an Infura API Key
5.1. Sign-up at infura.com
5.2. Register a new project
5.3. Copy its public key
5.4. Open truffle.js in a text editor
5.5. Paste the value of the infura key where appropriate
6. Setup your culottes smart contract
6.1. Open contracts/Culotte.sol in a text editor
6.2. Set the criteria to match for your cause (e.g. is this the address of "a frequent contributor to open source projects" ?)
6.3. Set the probability that a new vote will close its election (e.g. res > 6 means there is a 60% probability a new vote won't close their election)
6.4. Set the minimum number of blockchain blocks that any election will last
6.5. truffle compile
6.6. truffle build
6.7. truffle migrate
7. Setup your Twitter bot
7.1. Login to a Twitter account
7.2. Register for a Twitter developer account
7.3. Create a new app
7.4. Copy its API key
7.5. Paste it in the twitter .py script from the culottes project
7.6. Set cron jobs to run this script several times per minutes (e.g. sleep 15 && python update.py)
8. Publish your dapp pages
9. Promote your culottes dapp

