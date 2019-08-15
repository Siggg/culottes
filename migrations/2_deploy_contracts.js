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
   * // Number of the block at last distribution
   * uint lastDistributionBlockNumber;
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
    'a frequent contributor to open source projects', // criteria
    4, // distributionBlockPeriod in blocks (about 15 secondes per block ?)
    625000000000000, // distributionAmount in Wei
    true, // withLottery 
    true  // withDistribution
  );
};

