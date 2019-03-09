const Culotte = artifacts.require("./Culotte.sol");
const expect = require('chai').expect;

contract('Culotte', function(accounts) {

  it("should be initialized correctly", async function() {
    const culotte = await Culotte.deployed();
    expect(culotte).to.not.equal(0x0);

    const criteria = await culotte.criteria();
    expect(criteria).to.equal('Is a great OSS contributor');

  });

  it("should be able to vote", async function() {
    const culotte = await Culotte.deployed();

    let candidate = accounts[9];
    let receipt = await culotte.vote(true, candidate, {value: 100});
    expect(receipt.logs.length).to.equal(2);
    expect(receipt.logs[0].event).to.equal('BallotOpened');
    expect(receipt.logs[0].args._candidate).to.equal(candidate);
    expect(receipt.logs[1].event).to.equal('VoteReceived');
    expect(receipt.logs[1].args._from).to.equal(accounts[0]);
    expect(receipt.logs[1].args._candidate).to.equal(candidate);
    expect(receipt.logs[1].args._vote).to.equal(true);

    let forAmount = await culotte.getAmount(true, candidate);
    expect(forAmount.toNumber()).to.equal(100);

    receipt = await culotte.vote(false, candidate, {value: 300});
    expect(receipt.logs.length).to.equal(1);
    expect(receipt.logs[0].args._from).to.equal(accounts[0]);
    expect(receipt.logs[0].args._candidate).to.equal(candidate);
    expect(receipt.logs[0].args._vote).to.equal(false);

    let againstAmount = await culotte.getAmount(false, candidate);
    expect(againstAmount.toNumber()).to.equal(300);

  });

  it("should close vote", async function() {
    const culotte = await Culotte.deployed();

  });

});
