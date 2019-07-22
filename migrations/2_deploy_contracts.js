var Revolution = artifacts.require("./Revolution.sol");

module.exports = function(deployer) {
  deployer.deploy(
    Revolution,
    'a frequent contributor to open source projects', // string _criteria  defines who this Revolution is for
    3, // uint _distributionBlockPeriod is the number of blocks before another distribution can happen
    7, // uint _distributionAmount is the amount of Wei to be distributed at each distribution
    false, // bool _withLottery specifies if trials are to be randomly and automatically closed (else they must be closed manually) 
    false  // bool _withDistribution specifies if the Bastille automatically distributes cakes to sans-culottes or not (else distribute must be called manually)
  );
};
