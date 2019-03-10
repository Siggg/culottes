pragma solidity ^0.5.0;

contract Culotte {

  string public criteria;
  uint paybackBlockPeriod;
  uint paybackAmount;
  uint lastPaybackBlockNumber;

  bool withLottery;
  bool withPayback;

  struct Bucket {
    address payable [] voters;
    mapping (address => uint256) votes;
    uint256 amount;
  }

  struct Ballot {
    address payable candidate;
    Bucket pros;
    Bucket cons;
    uint blockNumber;
    bool opened;
    bool elected;
  }

  address payable [] candidates;
  mapping (address => Ballot) private ballots;

  uint256 public cashierBalance;

  event BallotOpened(string indexed _eventName, address indexed _candidate);
  event BallotClosed(string indexed _eventName, address indexed _candidate);
  event VoteReceived(string indexed _eventName, address _from, address indexed _candidate, bool _vote, uint256 indexed _amount);
  event Payback(string indexed _eventName, address indexed _candidate, uint _paybackAmount);


  constructor(string memory _criteria, uint _paybackBlockPeriod, uint _paybackAmount, bool _withLottery, bool _withPayback) public{
    criteria = _criteria;
    paybackBlockPeriod = _paybackBlockPeriod;
    paybackAmount = _paybackAmount;
    lastPaybackBlockNumber = block.number;
    withLottery = _withLottery;
    withPayback = _withPayback;
  }

  function vote(bool _vote, address payable _candidate) public payable {
    Ballot storage ballot = ballots[_candidate];
    if (ballot.candidate == address(0x0) ) {
      // this is a new ballot, emit an event
      emit BallotOpened('BallotOpened', _candidate);
      candidates.push(_candidate);
      ballot.candidate = _candidate;
    }

    Bucket storage bucket = ballot.pros;
    if (!_vote) {
      bucket = ballot.cons;
    }
    bucket.voters.push(msg.sender);
    bucket.votes[msg.sender] += msg.value;
    bucket.amount+= msg.value;

    emit VoteReceived('VoteReceived', msg.sender, _candidate, _vote, msg.value);

    if(withLottery && block.number > ballot.blockNumber) {
      // update ballot block number
      ballot.blockNumber = block.number;
      // start closing ballot lottery
      if(closingLottery()) {
        ballot.opened = false;
        emit BallotClosed('BallotClosed', _candidate);
        closeBallot(_candidate);
      }
    }

    if(withPayback) {
      payback();
    }
  }

  function closeBallot(address payable _candidate) public {
    Ballot storage ballot = ballots[_candidate];
    // and the winner is ...
    Bucket storage winner = ballot.pros;
    Bucket storage loser = ballot.cons;
    ballot.elected = true;
    if (winner.amount < ballot.cons.amount) {
      winner = ballot.cons;
      loser = ballot.pros;
      ballot.elected = false;
    }
    // payback all that voted for winner
    for (uint i = 0; i < winner.voters.length; i++) {
      address payable voter = winner.voters[i];
      uint256 winAmount = winner.votes[voter];
      uint256 loseAmount = loser.amount * winner.votes[voter] / winner.amount;
      voter.transfer(winAmount);
      voter.transfer(loseAmount);
      winner.votes[voter]=0;
    }
    // Compute contract virtual vote
    cashierBalance = winner.amount - loser.amount;

    // share remaining with all that voted for winner with ponderation
    for (uint i = 0; i < loser.voters.length; i++) {
      address payable voter = loser.voters[i];
      loser.votes[voter]=0;
    }

    winner.amount = 0;
    loser.amount = 0;

  }

  function payback() public {
    for (uint i = 0; i < candidates.length; i++) {
      address payable candidate = candidates[i];
      Ballot memory ballot = ballots[candidate];
      if (!ballot.opened &&
          ballot.elected && cashierBalance > paybackAmount &&
          (block.number >= lastPaybackBlockNumber + paybackBlockPeriod)) {
        candidate.transfer(paybackAmount);
        cashierBalance -= paybackAmount;
        lastPaybackBlockNumber = block.number;
      }
      emit Payback('Payback', candidate, paybackAmount);
    }
  }

  function getAmount(bool _vote, address _candidate) public view returns (uint256){
    Ballot storage ballot = ballots[_candidate];
    if (_vote)
      return ballot.pros.amount;
    else
      return ballot.cons.amount;
  }

  function closingLottery() private view returns (bool) {
    uint randomHash = uint(keccak256(abi.encodePacked(block.difficulty,block.timestamp)));
    uint res = randomHash % 10;
    if(res > 6) {
      return true;
    }
    return false;
  }

  function ballotStatus(address _candidate) public view returns(bool opened, bool elected,uint256 pros, uint256 cons) {
    Ballot memory ballot = ballots[_candidate];
    return (ballot.opened, ballot.elected, ballot.pros.amount, ballot.cons.amount);
  }

  function() payable external {
    cashierBalance += msg.value;
  }
}
