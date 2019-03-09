const Dareth = artifacts.require("./Dareth.sol");
const expect = require('chai').expect;

contract('Dareth', function(accounts) {

  it("should be initialized correctly", async function() {
    const monthlyPayment = 5000;
    const nbOfMonths = 10;

    const instance = await Dareth.deployed();
    const amount = await instance.amount();
    expect(amount.toNumber()).to.equal(monthlyPayment * nbOfMonths);
    const months = await instance.nbOfMonths();
    expect(months.toNumber()).to.equal(nbOfMonths);
  });

  it("should subscribe participants", async function() {
    const instance = await Dareth.deployed();
    let nbOfParticipants = await instance.nbOfParticipants();
    expect(nbOfParticipants.toNumber()).to.equal(0);
    await instance.subscribe({from: accounts[0]});
    nbOfParticipants = await instance.nbOfParticipants();
    expect(nbOfParticipants.toNumber()).to.equal(1);
    await instance.subscribe({from: accounts[1]});
    nbOfParticipants = await instance.nbOfParticipants();
    expect(nbOfParticipants.toNumber()).to.equal(2);
  });

  it("should accept payments from participants", async function() {
    const monthlyPayment = 5000;
    const instance = await Dareth.deployed();
    await instance.subscribe({from: accounts[0]});
    try {
      await instance.makeMonthlyPayment({from: accounts[0], value: 5});
    } catch (error) {
      assert(error.message.indexOf('revert') >=0, 'Not enough ether to pay' );
    }
    await instance.makeMonthlyPayment({from: accounts[0], value: monthlyPayment});
    let contractBalance = await web3.eth.getBalance(instance.address);
    expect(contractBalance).to.equal(monthlyPayment.toString());

    const subscriberBalance = await instance.getBalanceOf(accounts[0]);
    expect(subscriberBalance.toNumber()).to.equal(monthlyPayment);
  });

  it("should not accept payments from non participants", async function() {

    const monthlyPayment = 5000;
    const instance = await Dareth.deployed();
    await instance.subscribe({from: accounts[0]});
    try {
      await instance.makeMonthlyPayment({from: accounts[2], value: monthlyPayment});
      assert.fail("Should not accept payment from non participants");
    } catch (error) {
      assert(error.message.indexOf('revert') >=0, 'Sender is not a participant' );
    }
  });

});
