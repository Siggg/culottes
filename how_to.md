Your preferred cause probably deserves its own revolution. See vélos how to spark it.

# Examples of causes in need of a revolution

A revolution for:

## deserving contributors 

* 0.05 ETH / week to winners of oceans cleaning bounties who keep cleaning beaches once they receive their initial bounty 

* 0.3 ETH / week to a person who usually gives more that this to homeless people

* 0.2 ETH / day for a person who really deserves it

* 2 ETH / day for a contributor to copyleft software, content or data who needs this money to  contribute full time and deserves being able to do so

* 1 ETH / day for an educator who spends this money effectively and efficiently to protect a group of children from the risk of moral or civic difficulty when they grow up

* 0.05 ETH / day for a deserving firefighter, first responder, policeman, customs officer or soldier seriously wounded while carrying out their duties

* 0.05 ETH / day for the child under the age of twenty-five years of a firefighter, first responder, policeman, customs officer or soldier who died while carrying out their duties

* 1 ETH / day for a person who efficiently spends more than this to fight climate change

* 0.3 ETH / week for a person who will donate back to this bastille at least 100,1% of the amount of ETH they get from it before 9 days from each moment they get it

* 0.025 ETH / day for a contributor to the Ethereum ecosystem who deserves their daily cup of thanks

* 0.3 ETH / month for a person who donated 3 times 0.001 ETH to this revolution and, by doing so, promises (1) during 6 months to donate 0.6 ETH per month to this revolution if the total income of their household that month is higher than the median household income in the country where they live in and (2) if they fail to do so before the end of the following month, to accept that any of their property, for a total value of up to twice the cumulated sum of unpaid amounts, is permanently taken from them, if necessary by resorting to a minimum and proportionate force or cunning, by anyone who donates this sum to this revolution and publicly attributes this donation to their failure.

## Necessity 

* 0.05 ETH / day for a person unable to work in normal conditions of profitability because of a physical or mental disability that occurred during the youth or the period generally considered as that of active life

* 0.05 ETH / day for a person under the age of eighteen who is unable to acquire education or vocational training of a standard level due to a physical or mental disability

* 0.02 ETH / day for a person who emigrated less than 3 years ago because or war in their country, who lives in a neighboring country and who can freely use this money

* 0.01 ETH / day for a person without any bank account

* 0.01 ETH / day for a person who needs it to live with dignity

* 0.01 ETH / day for a person living in one of the ten least developed countries (ranked adjusting for inequalities if possible)

* 0.01 ETH / day for a person living in one of these countries: Mali, Burkina Faso, Niger, Tchad, South Sudan, Érythrée, Djibouti, or Somalia, Cap Verde

* 20 ETH / year for a person under 25 who needs this money to succeed in their initial vocational training and will spend it effectively for that

* 0.01 ETH / day for the deserving human of a cat or dog who needs this money to live with them with dignity


# How to create your own revolution, the lazy way (recommended)

1. Open contracts/Revolution.sol
2. Update the parameters inside (criteria, amount to be distributed, period of distribution, ...)
3. Send me your setting by email to sig arobase akasig dot org
4. I may deploy your revolution smart contract and add it to main dapp

# How to spark your own revolution, the badass way

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


