pragma solidity ^0.5.0;

contract Revolution {

  // Criteria the citizen should match to win votes
  // e.g. : "a sans-culotte"
  string public criteria;

  // Minimum number of blocks before next cake distribution from the Revolution
  uint distributionBlockPeriod;

  // Amount of ETH to be distributed to each citizen matchin criteria
  uint distributionAmount;

  // Number of the block at last distribution
  uint lastDistributionBlockNumber;

  // Will this Revolution randomly close its votes ?
  bool withLottery;

  // Will this Revolution distribute cakes ?
  bool withDistribution;

  // For a given citizen, let's put all positive (or negative) votes
  // received into a positive (or negative) justice scale.
  struct JusticeScale {
    address payable [] voters;
    mapping (address => uint256) votes;
    uint256 amount;
  }

  // This the revolutionary trial for a given citizen
  struct Trial {
    address payable citizen;
    JusticeScale sansculotteScale;
    JusticeScale privilegedScale;
    uint blockNumber;
    bool opened;
    bool isSansculotte;
  }

  // Citizens known at this Revolution
  address payable [] citizens;
  // Trials known at this Revolution
  mapping (address => Trial) private trials;

  // This is the amount of cakes in the Bastille
  uint256 public bastilleBalance;

  // Start of new trial for a given citizen
  event TrialOpened(string indexed _eventName, address indexed _citizen);
  // End of trial for a given citizen
  event TrialClosed(string indexed _eventName, address indexed _citizen);
  // New cake-vote received for a given citizen
  event VoteReceived(string indexed _eventName, address _from, address indexed _citizen, bool _vote, uint256 indexed _amount);
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
    trial.isSansculotte = false;
    // .. unless they get more votes on their sans-culotte scale than on their privileged scale.
    if (trial.sansculotteScale.amount > trial.privilegedScale.amount) {
      winnerScale = trial.sansculotteScale;
      loserScale = trial.privilegedScale;
      trial.isSansculotte = true;
    }

    // Compute Bastille virtual vote
    uint256 bastilleVote = winnerScale.amount - loserScale.amount;

    // distribute cakes to winners
    for (uint i = 0; i < winnerScale.voters.length; i++) {
      address payable voter = winnerScale.voters[i];
      // First distribute cakes from the winner scale, also known as winning cakes
      // How many cakes did this voter put on the winnerScale ?
      uint256 winningCakes = winnerScale.votes[voter];
      // Send them back
      winnerScale.votes[voter]=0;
      voter.transfer(winningCakes);
      // How many cakes from the loser scale are to be rewarded to this winner citizen ?
      // Rewards should be a share of the lost cakes that is proportionate to the fraction of
      // winning cakes that were voted by this voting citizen, pretending that the Bastille
      // itself took part in the vote.
      uint256 rewardCakes = loserScale.amount * winningCakes / ( winnerScale.amount + bastilleVote );
      // Send their fair share of lost cakes as reward.
      voter.transfer(rewardCakes);
    }
   
    // distribute cakes to the Bastille
    bastilleBalance += loserScale.amount * bastilleVote / ( winnerScale.amount + bastilleVote );

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
    for (uint i = 0; i < citizens.length; i++) {
      address payable citizen = citizens[i];
      Trial memory trial = trials[citizen];
      if (!trial.opened &&
          trial.isSansculotte &&
          bastilleBalance > distributionAmount &&
          (block.number >= lastDistributionBlockNumber + distributionBlockPeriod)) {
        citizen.transfer(distributionAmount);
        bastilleBalance -= distributionAmount;
        lastDistributionBlockNumber = block.number;
      }
      emit Distribution('Distribution', citizen, distributionAmount);
    }
  }

  function getAmount(bool _vote, address _citizen) public view returns (uint256){
    Trial storage trial = trials[_citizen]; 
    if (_vote)
      return trial.sansculotteScale.amount;
    else
      return trial.privilegedScale.amount;
  }

  function closingLottery() private view returns (bool) {
    uint randomHash = uint(keccak256(abi.encodePacked(block.difficulty,block.timestamp)));
    uint res = randomHash % 10;
    if(res > 6) {
      return true;
    }
    return false;
  }

  function trialStatus(address _citizen) public view returns(bool opened, bool isSansculotte, uint256 sansculotteScale, uint256 privilegedScale) {
    Trial memory trial = trials[_citizen];
    return (trial.opened, trial.isSansculotte, trial.sansculotteScale.amount, trial.privilegedScale.amount);
  }

  function() payable external {
    bastilleBalance += msg.value;
  }
}
