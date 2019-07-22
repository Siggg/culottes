const Revolution = artifacts.require("./Revolution.sol");
const expect = require('chai').expect;

contract('Revolution', function(accounts) {

  it("Init", async function() {
    const revolution = await Revolution.deployed();
    expect(revolution).to.not.equal(0x0);
    let balance = await web3.eth.getBalance(revolution.address);

    const criteria = await revolution.criteria();
    expect(criteria).to.equal('a frequent contributor to open source projects');

  });


  it("Vote", async function() {
    const revolution = await Revolution.deployed();

    let citizen = accounts[9];
    let receipt = await revolution.vote(true, citizen, {value: 100});
    //expect(receipt.logs.length).to.equal(2);
    expect(receipt.logs[0].event).to.equal('TrialOpened');
    expect(receipt.logs[0].args._citizen).to.equal(citizen);
    expect(receipt.logs[1].event).to.equal('VoteReceived');
    expect(receipt.logs[1].args._from).to.equal(accounts[0]);
    expect(receipt.logs[1].args._citizen).to.equal(citizen);
    expect(receipt.logs[1].args._vote).to.equal(true);
    expect(receipt.logs[1].args._amount.toNumber()).to.equal(100);

    let sansculotteAmount = await revolution.getScaleAmount(true, citizen);
    expect(sansculotteAmount.toNumber()).to.equal(100);

    receipt = await revolution.vote(false, citizen, {value: 300});
    //expect(receipt.logs.length).to.equal(1);
    expect(receipt.logs[0].args._from).to.equal(accounts[0]);
    expect(receipt.logs[0].args._citizen).to.equal(citizen);
    expect(receipt.logs[0].args._vote).to.equal(false);

    let privilegedAmount = await revolution.getScaleAmount(false, citizen);
    expect(privilegedAmount.toNumber()).to.equal(300);

  });

  it("Vote closing", async function() {
    const revolution = await Revolution.deployed();
    let citizen = accounts[9];

    let balance = await web3.eth.getBalance(revolution.address);
    expect(balance).to.equal('400');
    let status = await revolution.trialStatus(citizen);
    expect(status.sansculotteScale.toNumber()).to.equal(100);
    expect(status.privilegedScale.toNumber()).to.equal(300);

    await revolution.closeTrial(citizen);

    // The winning scale is the privileged scale.
    // And the difference between scales is 300-100 = 200.
    // So the Bastille vote is 200, virtually added to the winning scale.
    // So winners will get their 300 winning cakes back
    // and the 100 lost cakes will be shared proportionately
    // to 300 for winners and 200 for the Bastille.
    // So winners will get 300/500 of the 100 lost cakes.
    // In other words, they get 60 lost cakes as rewards.
    // And the Bastille will get 200/500 of the 100 lost cakes.
    // And that makes 40 lost cakes put into the Bastille balance.
    // There should remain 40 cakes in the contract.
    balance = await web3.eth.getBalance(revolution.address);
    expect(balance).to.equal('40');
    // And these 40 cakes should be in the Bastille.
    let bastilleBalance = await revolution.bastilleBalance();
    expect(bastilleBalance.toNumber()).to.equal(40);
    // There should be no cake left in the trial scales.
    status = await revolution.trialStatus(citizen);
    expect(status.sansculotteScale.toNumber()).to.equal(0);
    expect(status.privilegedScale.toNumber()).to.equal(0);

  });

  it("Play", async function() {
    let blockNumber = await web3.eth.getBlockNumber();
    console.log('start blockNumber: ' + blockNumber);

    const revolution = await Revolution.deployed();
    let A = accounts[1];
    let B = accounts[2];
    let C = accounts[3];
    let D = accounts[4];
    let E = accounts[5];

    let citizen = accounts[9];

    let revolutionBalanceBeforeVotes = await web3.eth.getBalance(revolution.address);
    console.log('revolutionBalanceBeforeVotes: ', revolutionBalanceBeforeVotes);

    let bastilleBalanceBeforeVotes = await revolution.bastilleBalance();
    console.log('bastilleBalanceBeforeVotes: ', bastilleBalanceBeforeVotes.toNumber());

    let status = await revolution.trialStatus(citizen);
    expect(status.sansculotteScale.toNumber()).to.equal(0);
    expect(status.privilegedScale.toNumber()).to.equal(0);

    await revolution.vote(true, citizen, {from: A, value: 1});
    await revolution.vote(true, citizen, {from: B, value: 2});
    await revolution.vote(true, citizen, {from: C, value: 3});

    status = await revolution.trialStatus(citizen);
    expect(status.sansculotteScale.toNumber()).to.equal(6);
    expect(status.privilegedScale.toNumber()).to.equal(0);

    await revolution.vote(false, citizen, {from: D, value: 2});
    await revolution.vote(false, citizen, {from: E, value: 2});

    status = await revolution.trialStatus(citizen);
    expect(status.sansculotteScale.toNumber()).to.equal(6);
    expect(status.privilegedScale.toNumber()).to.equal(4);

    let aBalanceBeforeClosing = await web3.eth.getBalance(A);
    let bBalanceBeforeClosing = await web3.eth.getBalance(B);
    let cBalanceBeforeClosing = await web3.eth.getBalance(C);
    let bastilleBalanceBeforeClosing = await revolution.bastilleBalance();
    let revolutionBalanceBeforeClosing = await web3.eth.getBalance(revolution.address);

    // The revolution received 1+2+3+2+2 = 10 cakes as votes and sent none.
    expect(web3.utils.toBN(revolutionBalanceBeforeClosing).sub(web3.utils.toBN(revolutionBalanceBeforeVotes)).toNumber()).to.equal(10);
    // None of these cakes went to the Bastille before the closing of the trial.
    expect(web3.utils.toBN(bastilleBalanceBeforeClosing).sub(web3.utils.toBN(bastilleBalanceBeforeVotes)).toNumber()).to.equal(0);

    await revolution.closeTrial(citizen);

    let aBalanceAfterClosing = await web3.eth.getBalance(A);
    let bBalanceAfterClosing = await web3.eth.getBalance(B);
    let cBalanceAfterClosing = await web3.eth.getBalance(C);
    let bastilleBalanceAfterClosing = await revolution.bastilleBalance();
    let revolutionBalanceAfterClosing = await web3.eth.getBalance(revolution.address);

    // Winners should have got their winning cakes back and should have received a fair share
    // of the lost cakes, as rewards.
    expect(web3.utils.toBN(aBalanceAfterClosing).sub(web3.utils.toBN(aBalanceBeforeClosing)).toNumber()).to.equal(1+0);
    expect(web3.utils.toBN(bBalanceAfterClosing).sub(web3.utils.toBN(bBalanceBeforeClosing)).toNumber()).to.equal(2+1);
    expect(web3.utils.toBN(cBalanceAfterClosing).sub(web3.utils.toBN(cBalanceBeforeClosing)).toNumber()).to.equal(3+1);
    // The Bastille should have got 1 of the lost cakes.
    expect(web3.utils.toBN(bastilleBalanceAfterClosing).sub(web3.utils.toBN(bastilleBalanceBeforeClosing)).toNumber()).to.equal(2);
    // The Revolution should manage less cakes :
    // - winning cakes should have been sent back to winners
    // - lost cakes but 1 should have been shared among winners
    // - the Bastille should have received 1 cakes that's still managed by the Revolution contract
    expect(web3.utils.toBN(revolutionBalanceAfterClosing).sub(web3.utils.toBN(revolutionBalanceBeforeClosing)).toNumber()).to.equal(-1-2-3-4+2);

    status = await revolution.trialStatus(citizen);
    expect(status.sansculotteScale.toNumber()).to.equal(0);
    expect(status.privilegedScale.toNumber()).to.equal(0);
    expect(status.opened).to.equal(false);
    expect(status.matchesCriteria).to.equal(true);

    console.log('bastilleBalanceAfterClosing: ', bastilleBalanceAfterClosing.toNumber());
    console.log('revolutionBalanceAfterClosing: ', revolutionBalanceAfterClosing);
    let citizenBalanceBeforeDistribution = await web3.eth.getBalance(citizen);
    console.log('citizenBalanceBeforeDistribution: ', citizenBalanceBeforeDistribution);

    blockNumber = await web3.eth.getBlockNumber();
    console.log('end blockNumber: ' + blockNumber);


    await revolution.distribute();

    let bastilleBalanceAfterDistribution = await revolution.bastilleBalance();
    console.log('bastilleBalanceAfterDistribution: ', bastilleBalanceAfterDistribution.toNumber());
    let revolutionBalanceAfterDistribution = await web3.eth.getBalance(revolution.address);
    console.log('revolutionBalanceAfterDistribution: ', revolutionBalanceAfterDistribution);
    let citizenBalanceAfterDistribution = await web3.eth.getBalance(citizen);
    console.log('citizenBalanceAfterDistribution: ', citizenBalanceAfterDistribution);

    let distributionAmount = 7; // set in migrations script at the moment
    expect(web3.utils.toBN(citizenBalanceAfterDistribution).sub(web3.utils.toBN(citizenBalanceBeforeDistribution)).toNumber()).to.equal(distributionAmount);
    expect(web3.utils.toBN(bastilleBalanceAfterDistribution).sub(web3.utils.toBN(bastilleBalanceAfterClosing)).toNumber()).to.equal(-distributionAmount);
    expect(web3.utils.toBN(revolutionBalanceAfterDistribution).sub(web3.utils.toBN(revolutionBalanceAfterClosing)).toNumber()).to.equal(-distributionAmount);

  });

  it("Fallback", async function() {
    const revolution = await Revolution.deployed();

    let bastilleBalanceBeforeDonation = await revolution.bastilleBalance();
    console.log('bastilleBalanceBeforeDonation: ', bastilleBalanceBeforeDonation.toNumber());
    await web3.eth.sendTransaction({from: accounts[9], to: revolution.address, value: 100});
    let bastilleBalanceAfterDonation = await revolution.bastilleBalance();
    console.log('bastilleBalanceAfterDonation: ', bastilleBalanceAfterDonation.toNumber());
    expect(web3.utils.toBN(bastilleBalanceAfterDonation).sub(web3.utils.toBN(bastilleBalanceBeforeDonation)).toNumber()).to.equal(100);

  });

});
