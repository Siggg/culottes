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
    expect(receipt.logs.length).to.equal(0);

    let forAmount = await culotte.getAmount(true, candidate);
    expect(forAmount.toNumber()).to.equal(100);

    receipt = await culotte.vote(false, candidate, {value: 300});
    expect(receipt.logs.length).to.equal(0);

    let againstAmount = await culotte.getAmount(false, candidate);
    expect(againstAmount.toNumber()).to.equal(300);

  });


});
