const Culotte = artifacts.require("./Culotte.sol");
const expect = require('chai').expect;

contract('Culotte', function(accounts) {

  it("Init", async function() {
    const culotte = await Culotte.deployed();
    expect(culotte).to.not.equal(0x0);
    let culotteBalance = await web3.eth.getBalance(culotte.address);

    const criteria = await culotte.criteria();
    expect(criteria).to.equal('a frequent contributor to open source projects');

  });

  it("Vote", async function() {
    const culotte = await Culotte.deployed();

    let candidate = accounts[9];
    let receipt = await culotte.vote(true, candidate, {value: 100});
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

    receipt = await culotte.vote(false, candidate, {value: 300});
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
    let blockNumber = await web3.eth.getBlockNumber();
    console.log('start blockNumber: ' + blockNumber);

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

    await culotte.vote(true, candidate, {from: A, value: 1});
    await culotte.vote(true, candidate, {from: B, value: 2});
    await culotte.vote(true, candidate, {from: C, value: 3});
    status = await culotte.ballotStatus(candidate);
    expect(status.pros.toNumber()).to.equal(6);
    expect(status.cons.toNumber()).to.equal(0);

    await culotte.vote(false, candidate, {from: D, value: 2});
    await culotte.vote(false, candidate, {from: E, value: 2});
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

    expect(web3.utils.toBN(afterBalanceA).sub(web3.utils.toBN(beforeBalanceA)).toNumber()).to.equal(1);
    expect(web3.utils.toBN(afterBalanceB).sub(web3.utils.toBN(beforeBalanceB)).toNumber()).to.equal(3);
    expect(web3.utils.toBN(afterBalanceC).sub(web3.utils.toBN(beforeBalanceC)).toNumber()).to.equal(5);

    status = await culotte.ballotStatus(candidate);
    expect(status.pros.toNumber()).to.equal(0);
    expect(status.cons.toNumber()).to.equal(0);
    expect(status.opened).to.equal(false);
    expect(status.elected).to.equal(true);

    cashierBalance = await culotte.cashierBalance();
    console.log('cashierBalance: ' + cashierBalance.toNumber());

    blockNumber = await web3.eth.getBlockNumber();
    console.log('end blockNumber: ' + blockNumber);

    // expect(cashierBalance.toNumber()).to.equal(200);

    let beforeBalanceCandidate = await web3.eth.getBalance(candidate);
    await culotte.payback();
    let afterBalanceCandidate = await web3.eth.getBalance(candidate);

    expect(web3.utils.toBN(afterBalanceCandidate).sub(web3.utils.toBN(beforeBalanceCandidate)).toNumber()).to.equal(1);

  });

});
