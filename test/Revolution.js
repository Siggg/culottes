const RevolutionFactory = artifacts.require("./RevolutionFactory.sol");
const Revolution = artifacts.require("./Revolution.sol");
const expect = require('chai').expect;
const assertRevert = require('./assertRevert').assertRevert;

const desiredHashtag = "#ADesiredHashtag";
const desiredCriteria = "a desired criteria";
const desiredDistributionBlockPeriod = 3;
const desiredDistributionAmount = 70;

contract('RevolutionFactory', function(accounts) {




  it("Init", async function() {
    const revolutionFactory = await RevolutionFactory.deployed();
    expect(revolutionFactory.address).to.not.equal(0x0);
    await revolutionFactory.createRevolution(desiredCriteria, desiredHashtag, desiredDistributionBlockPeriod, desiredDistributionAmount, true);
    let firstHashtag = await revolutionFactory.hashtags(0);
    expect(firstHashtag).to.equal(desiredHashtag);
    const revolutionAddress = await revolutionFactory.getRevolution(desiredHashtag);
    expect(revolutionAddress).to.not.equal(0x0);
    const revolution = await Revolution.at(revolutionAddress);
    expect(revolution.address).to.equal(revolutionAddress);
    let balance = await web3.eth.getBalance(revolution.address);

    const criteria = await revolution.criteria();
    expect(criteria).to.equal(desiredCriteria);
    
    const hashtag = await revolution.hashtag();
    expect(hashtag).to.equal(desiredHashtag);
    
    console.log('finished Init tests');

  });

  it("Fallback", async function() {
    const revolutionFactory = await RevolutionFactory.deployed();
    await revolutionFactory.createRevolution(desiredCriteria, desiredHashtag, desiredDistributionBlockPeriod, desiredDistributionAmount, true);
    const revolutionAddress = await revolutionFactory.getRevolution(desiredHashtag);
    const revolution = await Revolution.at(revolutionAddress);

    let bastilleBalanceBeforeDonation = await revolution.bastilleBalance();
    console.log('bastilleBalanceBeforeDonation: ', bastilleBalanceBeforeDonation.toNumber());
    await web3.eth.sendTransaction({from: accounts[9], to: revolution.address, value: 1});
    let bastilleBalanceAfterDonation = await revolution.bastilleBalance();
    console.log('bastilleBalanceAfterDonation: ', bastilleBalanceAfterDonation.toNumber());
    expect(web3.utils.toBN(bastilleBalanceAfterDonation).sub(web3.utils.toBN(bastilleBalanceBeforeDonation)).toNumber()).to.equal(1);

  });




  it("Vote", async function() {
    const revolutionFactory = await RevolutionFactory.deployed();
    await revolutionFactory.createRevolution(desiredCriteria, desiredHashtag, desiredDistributionBlockPeriod, desiredDistributionAmount, true);
    const revolutionAddress = await revolutionFactory.getRevolution(desiredHashtag);
    const revolution = await Revolution.at(revolutionAddress);

    let citizen = accounts[9];
    
    // There should be no trial yet for this citizen
    
    let status = await revolution.trialStatus(citizen);
    expect(status.opened).to.equal(false);
    expect(status.sansculotteScale.toNumber()).to.equal(0);
    expect(status.privilegedScale.toNumber()).to.equal(0);

    // Let's cast an invalid vote

    assertRevert(
      revolution.vote(true, citizen, {value: desiredDistributionAmount / 10 - 1}),
      "Can't vote with less than distributionAmount / 10");

    // Let's cast a vote
    
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

    // There should be an opened trial now
    
    let status2 = await revolution.trialStatus(citizen);
    expect(status2.opened).to.equal(true);
    expect(status2.sansculotteScale.toNumber()).to.equal(100);
    expect(status2.privilegedScale.toNumber()).to.equal(300);
    expect(status2.matchesCriteria).to.equal(false);
    
  });




  it("Vote closing", async function() {
    const revolutionFactory = await RevolutionFactory.deployed();
    await revolutionFactory.createRevolution(desiredCriteria, desiredHashtag, desiredDistributionBlockPeriod, desiredDistributionAmount, true);
    const revolutionAddress = await revolutionFactory.getRevolution(desiredHashtag);
    const revolution = await Revolution.at(revolutionAddress);

    let citizen = accounts[9];

    let balance = await web3.eth.getBalance(revolution.address);
    expect(balance).to.equal('401');
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
    // There should remain 41 cakes in the contract. 1 was already there before.
    balance = await web3.eth.getBalance(revolution.address);
    expect(balance).to.equal('41');
    // And these 41 cakes should be in the Bastille.
    let bastilleBalance = await revolution.bastilleBalance();
    expect(bastilleBalance.toNumber()).to.equal(41);
    // There should be no cake left in the trial scales.
    status = await revolution.trialStatus(citizen);
    expect(status.sansculotteScale.toNumber()).to.equal(0);
    expect(status.privilegedScale.toNumber()).to.equal(0);
    
    // The trial should be closed
    
    expect(status.opened).to.equal(false);
    
    // The verdict should be "privileged"
    
    expect(status.matchesCriteria).to.equal(false);

  });
  
  
  

  it("Play", async function() {
    let blockNumber = await web3.eth.getBlockNumber();
    console.log('start blockNumber: ' + blockNumber);

    const revolutionFactory = await RevolutionFactory.deployed();
    await revolutionFactory.createRevolution(desiredCriteria, desiredHashtag, desiredDistributionBlockPeriod, desiredDistributionAmount, true);
    const revolutionAddress = await revolutionFactory.getRevolution(desiredHashtag);
    const revolution = await Revolution.at(revolutionAddress);

    let A = accounts[1];
    let B = accounts[2];
    let C = accounts[3];
    let D = accounts[4];
    let E = accounts[5];

    let citizen = accounts[9];

    // before votes

    let revolutionBalanceBeforeVotes = await web3.eth.getBalance(revolution.address);
    console.log('revolutionBalanceBeforeVotes: ', revolutionBalanceBeforeVotes);

    let bastilleBalanceBeforeVotes = await revolution.bastilleBalance();
    console.log('bastilleBalanceBeforeVotes: ', bastilleBalanceBeforeVotes.toNumber());

    let status = await revolution.trialStatus(citizen);
    expect(status.sansculotteScale.toNumber()).to.equal(0);
    expect(status.privilegedScale.toNumber()).to.equal(0);
    expect(status.opened).to.equal(false);
    sansculotteAmount = await revolution.getScaleAmount(true, citizen);
    expect(sansculotteAmount.toNumber()).to.equal(0);
    privilegedAmount = await revolution.getScaleAmount(false, citizen);
    expect(privilegedAmount.toNumber()).to.equal(0);
    
    // votes
    
    await revolution.vote(true, citizen, {from: A, value: 10});
    await revolution.vote(true, citizen, {from: B, value: 20});
    await revolution.vote(true, citizen, {from: C, value: 30});

    // after votes

    status = await revolution.trialStatus(citizen);
    expect(status.sansculotteScale.toNumber()).to.equal(60);
    expect(status.privilegedScale.toNumber()).to.equal(0);
    expect(status.opened).to.equal(true);

    await revolution.vote(false, citizen, {from: D, value: 20});
    await revolution.vote(false, citizen, {from: E, value: 20});

    status = await revolution.trialStatus(citizen);
    expect(status.sansculotteScale.toNumber()).to.equal(60);
    expect(status.privilegedScale.toNumber()).to.equal(40);
    expect(status.opened).to.equal(true);
    
      console.log("// before closing trial");

    let aBalanceBeforeClosing = await web3.eth.getBalance(A);
    let bBalanceBeforeClosing = await web3.eth.getBalance(B);
    let cBalanceBeforeClosing = await web3.eth.getBalance(C);
    let bastilleBalanceBeforeClosing = await revolution.bastilleBalance();
    let revolutionBalanceBeforeClosing = await web3.eth.getBalance(revolution.address);

      console.log("// The revolution received 10 + 20 + 30 + 20 + 20 = 100 cakes as votes and sent none.");
    expect(web3.utils.toBN(revolutionBalanceBeforeClosing).sub(web3.utils.toBN(revolutionBalanceBeforeVotes)).toNumber()).to.equal(100);
      console.log("// None of these cakes went to the Bastille before the closing of the trial.");
    expect(web3.utils.toBN(bastilleBalanceBeforeClosing).sub(web3.utils.toBN(bastilleBalanceBeforeVotes)).toNumber()).to.equal(0);

    console.log("// close trial");

    await revolution.closeTrial(citizen);
    
    console.log("// after closing trial");

    let aBalanceAfterClosing = await web3.eth.getBalance(A);
    let bBalanceAfterClosing = await web3.eth.getBalance(B);
    let cBalanceAfterClosing = await web3.eth.getBalance(C);
    let bastilleBalanceAfterClosing = await revolution.bastilleBalance();
    let revolutionBalanceAfterClosing = await web3.eth.getBalance(revolution.address);

console.log("// Winners should have got their winning cakes back and should have received a fair share of the lost cakes, as rewards.");
    expect(web3.utils.toBN(aBalanceAfterClosing).sub(web3.utils.toBN(aBalanceBeforeClosing)).toNumber()).to.equal(10 + 5);
    expect(web3.utils.toBN(bBalanceAfterClosing).sub(web3.utils.toBN(bBalanceBeforeClosing)).toNumber()).to.equal(20 + 10);
    expect(web3.utils.toBN(cBalanceAfterClosing).sub(web3.utils.toBN(cBalanceBeforeClosing)).toNumber()).to.equal(30 + 15);
console.log("// The Bastille should have got 10 of the lost cakes.");
    expect(web3.utils.toBN(bastilleBalanceAfterClosing).sub(web3.utils.toBN(bastilleBalanceBeforeClosing)).toNumber()).to.equal(10);
    
  console.log("// The Revolution should manage less cakes :");
    console.log("// - winning cakes should have been sent back to winners");
    console.log("// - lost cakes should have been shared among winners");
      console.log("// - the Bastille should have received 10 cakes that's still managed by the Revolution contract");
    expect(web3.utils.toBN(revolutionBalanceAfterClosing).sub(web3.utils.toBN(revolutionBalanceBeforeClosing)).toNumber()).to.equal(-10 - 20 - 30 - 40 + 10);

    status = await revolution.trialStatus(citizen);
    expect(status.sansculotteScale.toNumber()).to.equal(0);
    expect(status.privilegedScale.toNumber()).to.equal(0);
    expect(status.opened).to.equal(false);
    expect(status.matchesCriteria).to.equal(true);
    sansculotteAmount = await revolution.getScaleAmount(true, citizen);
    expect(sansculotteAmount.toNumber()).to.equal(0);
    privilegedAmount = await revolution.getScaleAmount(false, citizen);
    expect(privilegedAmount.toNumber()).to.equal(0);

    blockNumber = await web3.eth.getBlockNumber();
    console.log('end blockNumber: ' + blockNumber);

  console.log();
  console.log("citizen balance: ", await web3.eth.getBalance(citizen));
    console.log("bastille balance: ", await revolution.bastilleBalance());
  console.log("// donate enough for 8 distributions");
    
    await web3.eth.sendTransaction({from: citizen, to: revolution.address, value: 8*desiredDistributionAmount});
    let citizenBalanceBeforeDistribution = await web3.eth.getBalance(citizen);
    console.log('citizenBalanceBeforeDistribution: ', citizenBalanceBeforeDistribution);
    let bastilleBalanceBeforeDistribution = await revolution.bastilleBalance();
      console.log("bastilleBalanceBeforeDistribution: ", bastilleBalanceBeforeDistribution.toNumber());
    let revolutionBalanceBeforeDistribution = await web3.eth.getBalance(revolution.address);
    console.log('revolutionBalanceBeforeDistribution: ', revolutionBalanceBeforeDistribution);
    console.log("// distribute");

    await revolution.distribute();
    
        let citizenBalanceAfterDistribution = await web3.eth.getBalance(citizen);
    console.log('citizenBalanceAfterDistribution: ', citizenBalanceAfterDistribution);
    let bastilleBalanceAfterDistribution = await revolution.bastilleBalance();
    console.log('bastilleBalanceAfterDistribution: ', bastilleBalanceAfterDistribution.toNumber());
    let revolutionBalanceAfterDistribution = await web3.eth.getBalance(revolution.address);
    console.log('revolutionBalanceAfterDistribution: ', revolutionBalanceAfterDistribution);

    let distributionAmount = desiredDistributionAmount;
    expect(web3.utils.toBN(citizenBalanceAfterDistribution).sub(web3.utils.toBN(citizenBalanceBeforeDistribution)).toNumber()).to.equal(distributionAmount);
    expect(web3.utils.toBN(bastilleBalanceAfterDistribution).sub(web3.utils.toBN(bastilleBalanceBeforeDistribution)).toNumber()).to.equal(-distributionAmount);
    expect(web3.utils.toBN(revolutionBalanceAfterDistribution).sub(web3.utils.toBN(revolutionBalanceBeforeDistribution)).toNumber()).to.equal(-distributionAmount);
    
    console.log("// donations succeed before lock");
    
    web3.eth.sendTransaction({from: accounts[9], to: revolution.address, value: 3});
    
    console.log("// lock");
    
    let locked = await revolution.locked();
    expect(locked).to.equal(false);
    
    revolution.lock();
    
    locked = await revolution.locked();
    expect(locked).to.equal(true);

    let citizenBalanceAfterLock = await web3.eth.getBalance(citizen);

    console.log("// donation should fail after lock");
    
    let bastilleBalanceBeforeDonation = await revolution.bastilleBalance();
    
    assertRevert(
      web3.eth.sendTransaction({from: accounts[9], to: revolution.address, value: 100}),
      "Donation sent to locked revolution");

    let bastilleBalanceAfterDonation = await revolution.bastilleBalance();
    
    expect(web3.utils.toBN(bastilleBalanceAfterDonation).sub(web3.utils.toBN(bastilleBalanceBeforeDonation)).toNumber()).to.equal(0);
    
    console.log("// votes should succeed when revolution locked and bastille not empty");
    
    await revolution.vote(true, citizen, {from: A, value: 50});
    
    await revolution.vote(false, citizen, {from: B, value: 20});
    expect(web3.utils.toBN(bastilleBalanceAfterDonation).sub(web3.utils.toBN(await revolution.bastilleBalance())).toNumber()).to.equal(0);
    
    status = await revolution.trialStatus(citizen);
    expect(status.sansculotteScale.toNumber()).to.equal(50);
    expect(status.privilegedScale.toNumber()).to.equal(20);
    expect(status.opened).to.equal(true);
    
    revolution.closeTrial(citizen);
    
    status = await revolution.trialStatus(citizen);
    expect(status.opened).to.equal(false);
    expect(status.matchesCriteria).to.equal(true);
    
    console.log("// distribution should succeed but only after 3 blocks");
    
        bastilleBalanceBeforeDistribution = await revolution.bastilleBalance();
    
    console.log("Block number = " + await web3.eth.getBlockNumber());
    console.log("distribute");
    await revolution.distribute();
    
    expect(web3.utils.toBN(await revolution.bastilleBalance()).toNumber()).to.equal(bastilleBalanceBeforeDistribution - distributionAmount);

    console.log("Block number = " + await web3.eth.getBlockNumber());
    console.log("distribute");
    await revolution.distribute();
     
    expect(web3.utils.toBN(await revolution.bastilleBalance()).toNumber()).to.equal(bastilleBalanceBeforeDistribution - distributionAmount);
    
    console.log("// i.e. no distribution yet");

    let advanceBlock = () => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_mine',
      id: new Date().getTime()
    }, (err, result) => {
      if (err) { return reject(err) }
      const newBlockHash = web3.eth.getBlock('latest').hash;
      return resolve(newBlockHash);
    })
  })
}

    await advanceBlock();
    await advanceBlock();
    await advanceBlock();
    console.log("Block number = " + await web3.eth.getBlockNumber());
    console.log("distribute");
    await revolution.distribute();
    
    
    expect(web3.utils.toBN(await revolution.bastilleBalance()).toNumber()).to.equal(bastilleBalanceBeforeDistribution - 2*distributionAmount);
    
    await advanceBlock();
    await advanceBlock();
    await advanceBlock();
    console.log("Block number = " + await web3.eth.getBlockNumber());
    console.log("distribute");
    await revolution.distribute();
    
    expect(web3.utils.toBN(await revolution.bastilleBalance()).toNumber()).to.equal(bastilleBalanceBeforeDistribution - 3*distributionAmount);
    
    await advanceBlock();
    await advanceBlock();
    await advanceBlock();
    console.log("Block number = " + await web3.eth.getBlockNumber());
    console.log("distribute");
    await revolution.distribute();
    
    expect(web3.utils.toBN(await revolution.bastilleBalance()).toNumber()).to.equal(bastilleBalanceBeforeDistribution - 4*distributionAmount);
    
    await advanceBlock();
    await advanceBlock();
    await advanceBlock();
    console.log("Block number = " + await web3.eth.getBlockNumber());
    console.log("distribute");
    await revolution.distribute();
    
    expect(web3.utils.toBN(await revolution.bastilleBalance()).toNumber()).to.equal(bastilleBalanceBeforeDistribution - 5*distributionAmount);

    await advanceBlock();
    await advanceBlock();
    await advanceBlock();
    console.log("Block number = " + await web3.eth.getBlockNumber());
    console.log("distribute");
    await revolution.distribute();
    
    expect(web3.utils.toBN(await revolution.bastilleBalance()).toNumber()).to.equal(bastilleBalanceBeforeDistribution - 6*distributionAmount);

    await advanceBlock();
    await advanceBlock();
    await advanceBlock();
    console.log("Block number = " + await web3.eth.getBlockNumber());
    console.log("distribute");
    await revolution.distribute();
    
    expect(web3.utils.toBN(await revolution.bastilleBalance()).toNumber()).to.equal(bastilleBalanceBeforeDistribution - 7*distributionAmount);
    
        expect(web3.utils.toBN(await revolution.bastilleBalance()).toNumber()).to.lessThan(distributionAmount);
    
    console.log("// even if bastille balance is less than distribution amount");
    
    await advanceBlock();
    await advanceBlock();
    await advanceBlock();
    console.log("Block number = " + await web3.eth.getBlockNumber());
    console.log("distribute");
    await revolution.distribute();
    
    expect(web3.utils.toBN(await revolution.bastilleBalance()).toNumber()).to.equal(0);
    
    console.log("// once bastille balance is empty, votes should fail, this revolution is over");
    
    console.log("vote on empty and locked revolution");
    assertRevert(
      revolution.vote(false, citizen, {from: E, value: 1}),
      "Can't vote during locked revolution when bastille is empty");
    console.log("vote reverted");
    console.log("bastille balance: " + await revolution.bastilleBalance());
    console.log("revolution balance: " + await web3.eth.getBalance(revolution.address));
      
  });

});
