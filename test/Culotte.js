const Culotte = artifacts.require("./Culotte.sol");
const expect = require('chai').expect;

contract('Culotte', function(accounts) {

  it("Init", async function() {
    const culotte = await Culotte.deployed();
    expect(culotte).to.not.equal(0x0);
    let culotteBalance = await web3.eth.getBalance(culotte.address);

    const criteria = await culotte.criteria();
    expect(criteria).to.equal('Is a great OSS contributor');

  });

  it("Vote", async function() {
    const culotte = await Culotte.deployed();

    let candidate = accounts[9];
    let receipt = await culotte.vote(true, candidate, false, {value: 100});
    //expect(receipt.logs.length).to.equal(2);
    expect(receipt.logs[0].event).to.equal('BallotOpened');
    expect(receipt.logs[0].args._candidate).to.equal(candidate);
    expect(receipt.logs[1].event).to.equal('VoteReceived');
    expect(receipt.logs[1].args._from).to.equal(accounts[0]);
    expect(receipt.logs[1].args._candidate).to.equal(candidate);
    expect(receipt.logs[1].args._vote).to.equal(true);
    expect(receipt.logs[1].args._amount.toNumber()).to.equal(100);

    let forAmount = await culotte.getAmount(true, candidate);
    expect(forAmount.toNumber()).to.equal(100);

    receipt = await culotte.vote(false, candidate, false, {value: 300});
    //expect(receipt.logs.length).to.equal(1);
    expect(receipt.logs[0].args._from).to.equal(accounts[0]);
    expect(receipt.logs[0].args._candidate).to.equal(candidate);
    expect(receipt.logs[0].args._vote).to.equal(false);

    let againstAmount = await culotte.getAmount(false, candidate);
    expect(againstAmount.toNumber()).to.equal(300);

  });

  it("Vote closing", async function() {
    const culotte = await Culotte.deployed();
    let candidate = accounts[9];

    let culotteBalance = await web3.eth.getBalance(culotte.address);
    expect(culotteBalance).to.equal('400');
    let status = await culotte.ballotStatus(candidate);
    expect(status.pros.toNumber()).to.equal(100);
    expect(status.cons.toNumber()).to.equal(300);

    await culotte.closeBallot(candidate);

    culotteBalance = await web3.eth.getBalance(culotte.address);
    expect(culotteBalance).to.equal('0');
    status = await culotte.ballotStatus(candidate);
    expect(status.pros.toNumber()).to.equal(0);
    expect(status.cons.toNumber()).to.equal(0);

  });

  it("Play", async function() {
    const culotte = await Culotte.deployed();
    let A = accounts[1];
    let B = accounts[2];
    let C = accounts[3];
    let D = accounts[4];
    let E = accounts[5];

    let candidate = accounts[9];

    let culotteBalance = await web3.eth.getBalance(culotte.address);
    expect(culotteBalance).to.equal('0');

    let cashierBalance = await culotte.cashierBalance();
    expect(cashierBalance.toNumber()).to.equal(200);
    let status = await culotte.ballotStatus(candidate);
    expect(status.pros.toNumber()).to.equal(0);
    expect(status.cons.toNumber()).to.equal(0);

    await culotte.vote(true, candidate, false, {from: A, value: 1});
    await culotte.vote(true, candidate, false, {from: B, value: 2});
    await culotte.vote(true, candidate, false, {from: C, value: 3});
    status = await culotte.ballotStatus(candidate);
    expect(status.pros.toNumber()).to.equal(6);
    expect(status.cons.toNumber()).to.equal(0);

    await culotte.vote(false, candidate, false, {from: D, value: 2});
    await culotte.vote(false, candidate, false, {from: E, value: 2});
    status = await culotte.ballotStatus(candidate);
    expect(status.pros.toNumber()).to.equal(6);
    expect(status.cons.toNumber()).to.equal(4);

    let beforeBalanceA = await web3.eth.getBalance(A);
    let beforeBalanceB = await web3.eth.getBalance(B);
    let beforeBalanceC = await web3.eth.getBalance(C);

    await culotte.closeBallot(candidate);

    let afterBalanceA = await web3.eth.getBalance(A);
    let afterBalanceB = await web3.eth.getBalance(B);
    let afterBalanceC = await web3.eth.getBalance(C);

    console.log(beforeBalanceA);
    console.log(afterBalanceA);
    expect(parseInt(afterBalanceA) - parseInt(beforeBalanceA)).to.equal(0);
    expect(parseInt(afterBalanceB) - parseInt(beforeBalanceB)).to.equal(0);
    expect(parseInt(afterBalanceC) - parseInt(beforeBalanceC)).to.equal(0);

  });

});
