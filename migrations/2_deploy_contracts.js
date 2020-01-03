var Revolution = artifacts.require("./Revolution.sol");

module.exports = function(deployer) {

  /* Below is where you setup the parameters of your Revolution instance.
   *
   * Please refer to the source code of the Revolution contract in order to understand
   * the exact meaning of each parameter.
   *
   * For more convenience the definition of these parameters was copied from the contract
   * to here but this copy might be obsolete. Please refer to the source code of the Revolution
   * contract in order to get the exact and current meaning of each parameter.
   *
   * // Criteria the citizen should match to win votes
   * // e.g. : "a sans-culotte"
   * string criteria;
   *
   * // Minimum number of blocks before next cake distribution from the Revolution
   * uint distributionBlockPeriod;
   *
   * // Amount of WEI to be distributed to each citizen matching criteria
   * uint distributionAmount;
   *
   * // Will this Revolution randomly close its trials ?
   * bool withLottery;
   *
   * // Will this Revolution automatically consider distributing cakes after each vote ?
   * bool withDistribution;
   *
   */

  deployer.deploy(
    Revolution,
    'a frequent contributor to open source or copyleft-based projects who deserves a daily cup of thanks for their contributions', // criteria
    '#FrequentContributorRevolution', // hashtag to be used to discuss this contract
    3, // 5760, // distributionBlockPeriod in blocks (about 15 seconds per block so one day is approximately 5760 blocks)
    7, // web3.utils.toBN(web3.utils.toWei('0.025', 'ether')), // distributionAmount, for instance web3.utils.toBN(web3.utils.toWei('0.025', 'ether'))
    true // false, // testingMode, set to false unless you want to run automated tests 
  );
};

