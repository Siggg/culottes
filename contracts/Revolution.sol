pragma solidity ^0.5.0;

contract Revolution {

  // Criteria the citizen should match to win votes
  // e.g. : "a sans-culotte"
  string public criteria;

  // Minimum number of blocks before next cake distribution from the Revolution
  uint public distributionBlockPeriod;

  // Amount of WEI to be distributed to each citizen matching criteria
  uint public distributionAmount;

  // Number of the block at last distribution
  uint lastDistributionBlockNumber;

  // Will this Revolution randomly close its trials ?
  bool public withLottery;

  // Will this Revolution automatically consider distributing cakes after each vote ?
  bool public withDistribution;

  // For a given citizen, let's put all positive (or negative) votes
  // received into a positive (or negative) justice scale.
  struct JusticeScale {
    address payable [] voters;
    mapping (address => uint) votes;
    uint amount;
  }

  // This the revolutionary trial for a given citizen
  struct Trial {
    address payable citizen;
    JusticeScale sansculotteScale;
    JusticeScale privilegedScale;
    uint blockNumber;
    bool opened;
    bool matchesCriteria;
  }

  // Citizens known at this Revolution
  address payable [] public citizens;
  // Trials known at this Revolution
  mapping (address => Trial) private trials;

  // This is the amount of cakes in the Bastille
  uint public bastilleBalance;

  // Start of new trial for a given citizen
  event TrialOpened(string indexed _eventName, address indexed _citizen);
  // End of trial for a given citizen
  event TrialClosed(string indexed _eventName, address indexed _citizen);
  // New cake-vote received for a given citizen
  event VoteReceived(string indexed _eventName, address _from, address indexed _citizen, bool _vote, uint indexed _amount);
  // 
  event Distribution(string indexed _eventName, address indexed _citizen, uint _distributionAmount);


  constructor(string memory _criteria, uint _distributionBlockPeriod, uint _distributionAmount, bool _withLottery, bool _withDistribution) public{
    criteria = _criteria;
    distributionBlockPeriod = _distributionBlockPeriod;
    distributionAmount = _distributionAmount;
    lastDistributionBlockNumber = block.number;
    withLottery = _withLottery;
    withDistribution = _withDistribution;
  }

  function vote(bool _vote, address payable _citizen) public payable {
    Trial storage trial = trials[_citizen];
    if (trial.citizen == address(0x0) ) {
      // this is a new trial, emit an event
      emit TrialOpened('TrialOpened', _citizen);
      citizens.push(_citizen);
      trial.citizen = _citizen;
    }

    JusticeScale storage scale = trial.sansculotteScale;
    if (!_vote) {
      scale = trial.privilegedScale;
    }
    scale.voters.push(msg.sender);
    scale.votes[msg.sender] += msg.value;
    scale.amount+= msg.value;

    emit VoteReceived('VoteReceived', msg.sender, _citizen, _vote, msg.value);

    if(withLottery && block.number > trial.blockNumber) {
      // update trial block number
      trial.blockNumber = block.number;
      // start closing trial lottery
      if(closingLottery()) {
        trial.opened = false;
        emit TrialClosed('TrialClosed', _citizen);
        closeTrial(_citizen);
      }
    }

    if(withDistribution) {
      distribute();
    }
  }

  function closeTrial(address payable _citizen) public {
    Trial storage trial = trials[_citizen];
    // Issue a verdict : is this citizen a sans-culotte or a privileged ?
    // By default, citizens are seen as privileged...
    JusticeScale storage winnerScale = trial.privilegedScale;
    JusticeScale storage loserScale = trial.sansculotteScale;
    trial.matchesCriteria = false;
    // .. unless they get more votes on their sans-culotte scale than on their privileged scale.
    if (trial.sansculotteScale.amount > trial.privilegedScale.amount) {
      winnerScale = trial.sansculotteScale;
      loserScale = trial.privilegedScale;
      trial.matchesCriteria = true;
    }

    // Compute Bastille virtual vote
    uint bastilleVote = winnerScale.amount - loserScale.amount;

    // Distribute cakes to winners as rewards
    // Side note : the reward scheme slightly differs from the culottes board game rules
    // regarding the way decimal fractions of cakes to be given as rewards to winners are managed.
    // The board game stipulates that fractions are rounded to the nearest integer and reward cakes
    // are given in the descending order of winners (bigger winners first). But the code below
    // states that only the integer part of reward cakes is taken into account. And the remaining
    // reward cakes are put back into the Bastille. This slightly lessens the number of cakes
    // rewarded to winners and slightly increases the number of cakes given to the Bastille.
    // The main advantage is that it simplifies the algorithm a bit.
    // But this rounding difference should not matter when dealing with Weis instead of real cakes.
    uint remainingRewardCakes = loserScale.amount;
    for (uint i = 0; i < winnerScale.voters.length; i++) {
      address payable voter = winnerScale.voters[i];
      // First distribute cakes from the winner scale, also known as winning cakes
      // How many cakes did this voter put on the winnerScale ?
      uint winningCakes = winnerScale.votes[voter];
      // Send them back
      winnerScale.votes[voter]=0;
      voter.transfer(winningCakes);
      // How many cakes from the loser scale are to be rewarded to this winner citizen ?
      // Rewards should be a share of the lost cakes that is proportionate to the fraction of
      // winning cakes that were voted by this voting citizen, pretending that the Bastille
      // itself took part in the vote.
      uint rewardCakes = loserScale.amount * winningCakes / ( winnerScale.amount + bastilleVote );
      // Send their fair share of lost cakes as reward.
      voter.transfer(rewardCakes);
      remainingRewardCakes -= rewardCakes;
    }
   
    // distribute cakes to the Bastille
    bastilleBalance += remainingRewardCakes;

    // Empty the winner scale
    winnerScale.amount = 0;

    // Empty the loser scale
    for (uint i = 0; i < loserScale.voters.length; i++) {
      address payable voter = loserScale.voters[i];
      loserScale.votes[voter]=0;
    }
    loserScale.amount = 0;

  }

  function distribute() public {
    // For each citizen trial
    for (uint i = 0; i < citizens.length; i++) {
      address payable citizen = citizens[i];
      Trial memory trial = trials[citizen];
      // Is the trial closed ?
      // Was the verdict "sans-culotte" (citizen does match criteria according to winners) ?
      // Does the Bastille have more cakes left than the amount to be distributed ?
      // Did the last distribution happen long enough ago ?
      if (!trial.opened &&
          trial.matchesCriteria &&
          bastilleBalance > distributionAmount &&
          (block.number - lastDistributionBlockNumber >= distributionBlockPeriod)) {
        // Then send this sans-culotte its fair share of Bastille cakes.
        citizen.transfer(distributionAmount);
        bastilleBalance -= distributionAmount;
        // Remember when this distribution happened.
        lastDistributionBlockNumber = block.number;
      }
      emit Distribution('Distribution', citizen, distributionAmount);
    }
  }

  function getScaleAmount(bool _vote, address _citizen) public view returns (uint){
    Trial storage trial = trials[_citizen]; 
    if (_vote)
      return trial.sansculotteScale.amount;
    else
      return trial.privilegedScale.amount;
  }

  function closingLottery() private view returns (bool) {
    // returns true with a 30% probability ; false otherwise
    uint randomHash = uint(keccak256(abi.encodePacked(block.difficulty,block.timestamp)));
    uint res = randomHash % 10;
    if(res > 6) {
      return true;
    }
    return false;
  }

  function trialStatus(address _citizen) public view returns(bool opened, bool matchesCriteria, uint sansculotteScale, uint privilegedScale) {
    Trial memory trial = trials[_citizen];
    return (trial.opened, trial.matchesCriteria, trial.sansculotteScale.amount, trial.privilegedScale.amount);
  }

  function() payable external {
    bastilleBalance += msg.value;
  }
}
