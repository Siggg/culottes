pragma solidity ^0.5.0;

contract Culotte {

  string public criteria;

  struct Ballot {
    address candidate;
    mapping (address => uint256) votesFor;
    uint256 forAmount;
    mapping (address => uint256)votesAgainst;
    uint256 againstAmount;
    uint blockNumber;
    bool opened;
  }

  mapping (address => Ballot) private ballots;

  event BallotOpened(address _candidate);
  event BallotClosed(address _candidate);
  event VoteReceived(address _from, address _candidate, bool _vote);


  constructor() public{
    criteria = 'Is a great OSS contributor';
  }

  function vote(bool _vote, address _candidate) public payable {
    Ballot storage ballot = ballots[_candidate];
    if (ballot.candidate == address(0x0)) {
      // this is a new ballot, emit an event
      emit BallotOpened(_candidate);
    }

    ballot.candidate = _candidate;
    if (_vote) {
      ballot.votesFor[msg.sender] += msg.value;
      ballot.forAmount+= msg.value;
    } else {
      ballot.votesAgainst[msg.sender] += msg.value;
      ballot.againstAmount += msg.value;
    }
    emit VoteReceived(msg.sender, _candidate, _vote);

    if(block.number > ballot.blockNumber) {
      // update ballot block number
      ballot.blockNumber = block.number;
      // start closing ballot lottery
      if(closingLottery()) {
        ballot.opened = false;
      }
    }
  }

  function getAmount(bool _vote, address _candidate) public view returns (uint256){
    Ballot storage ballot = ballots[_candidate];
    if (_vote)
      return ballot.forAmount;
    else
      return ballot.againstAmount;
  }

  function closingLottery() public view returns (bool) {
    uint randomHash = uint(keccak256(abi.encodePacked(block.difficulty,block.timestamp)));
    uint res = randomHash % 10;
    if(res > 6) {
      return true;
    }
    return false;
  }
}
