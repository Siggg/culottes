pragma solidity ^0.5.0;

contract Culotte {

  string public criteria;
  mapping (address => uint256) private votesFor;
  mapping (address => uint256) private votesAgainst;


  constructor() public{
    criteria = 'Is a great OSS contributor';
  }

  function vote(bool _vote, address candidate) public payable {
    if (_vote)
      votesFor[candidate] += msg.value;
    else
      votesAgainst[candidate] += msg.value;

  }

  function getAmount(bool _vote, address candidate) public view returns (uint256){
    if (_vote)
      return votesFor[candidate];
    else
      return votesAgainst[candidate];
  }
}
