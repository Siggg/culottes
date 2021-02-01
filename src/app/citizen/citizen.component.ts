import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Web3Service } from '../util/web3.service';
import { Router, ActivatedRoute } from '@angular/router';

declare let require: any;
declare let window: any;
const contractABI = require('../../../build/contracts/Revolution.json');

@Component({
  selector: 'app-citizen',
  templateUrl: './citizen.component.html',
  styleUrls: ['./citizen.component.css']
})
export class CitizenComponent implements OnInit {

	address: String = "0x";
	name: String = "";
	revolutionAddress: String = "0x0000...";
	revolutionBlockchain: String = "";
	criteria: String = "default criteria from citizen.component.ts";
	distributionAmount: number = 0;
	culottes: any;
	account: any;
	accountBalance: number = undefined;
	amount: number = undefined;
	vote: boolean = undefined;
	showErrorMessageForAddress: boolean = false;
	showErrorMessageForAmount: boolean = false;
	showErrorMessageForVote: boolean = false;
	showErrorMessageForBalance: boolean = false;
	confirmationProgress: number = 0;
        confirmationPercent: number = 0;
	transactionPending: boolean = false;
        errorDuringVote: String = "";
	transactionConfirmed = false;
	transactionHashes = [];
	web3_eth_contract: any;
	hashtagWithoutSymbol: String = "CulottesRevolution";

  constructor(
    private web3Service: Web3Service,
    private route: ActivatedRoute,
    private router: Router) {
  }


  async ngOnInit() {
    this.getAddress();
    this.revolutionAddress = this
      .web3Service
      .revolutionAddress;
    this.web3Service
      .artifactsToContract(contractABI, this.revolutionAddress)
      .then((web3_eth_contract) => {
        this.web3_eth_contract = web3_eth_contract;
	
	// Get revolution's criteria
        return this.web3_eth_contract.criteria();
      })
      .then((criteria) => {
        console.log("criteria: ", criteria);
        this.criteria = criteria;

	// Get revolution's distributionAmout
        return this.web3_eth_contract.distributionAmount();
      })
      .then((distributionAmount) => {
        console.log("distributionAmount: ", distributionAmount);
        if (distributionAmount === null) {
          this
            .web3Service
            .web3Status
            .next("distributionAmount at this revolution is null!");
          this
            .web3Service
            .statusError = true;
        } else {
          this.distributionAmount = parseFloat(this
            .web3Service
            .formatUnits(distributionAmount, "ether"));
        }

	// Get revolution's hashtag
        return this.web3_eth_contract.hashtag();
      })
      .then((hashtag) => {
        console.log("hashtag: ", hashtag);
        if (hashtag == null || hashtag.length == 0) {
          this.hashtagWithoutSymbol = "CulottesRevolution";
        } else if (hashtag[0] != '#') {
          this.hashtagWithoutSymbol = hashtag;
          hashtag = '#' + hashtag;
        } else {
          this.hashtagWithoutSymbol = hashtag.substring(1);
        }
        // console.log("Get citizen's name");
        console.log("this.address: ", this.address);
	if (this.address != "" && this.address != null) {
	  return this.web3_eth_contract.getName(this.address);
	} else {
	  return undefined;
	}
      })
      .then((name) => {
	console.log("name: ", name);
	this.name = name;
      });
    this.revolutionBlockchain = this
      .web3Service
      .revolutionBlockchain;
    // console.log("address, account, equal ?: ", this.address, this.account, this.address == this.account);
  }

  async sendVote(vote, weiAmount) {
    let component = this;
    component.vote = vote;
    let nameChange = false;
    let estimatedGas;
    this.account = await this.web3Service.getSignerAddress();
    this.accountBalance = await this.web3Service.getBalance(this.account);
    console.log("balance: ", this.accountBalance);
    if (this.account == this.address && this.address != "" && this.address != undefined ) {
      console.log('voting for oneself');
      let myName = await this.web3_eth_contract.getName(this.address);
      console.log('Your name was: ', myName);
      if (myName != this.name) {
        // Change one's name
	console.log('vote and set it to: ', this.name);
	nameChange = true;
      } else {
        console.log('  it does not have to change');
      }
    }
    function updateUIOnBlock(blockNumber) {
      component.transactionPending = false;
      component.confirmationProgress += 1; // up to 24 
      component.confirmationPercent = Math.round(100 * component.confirmationProgress / 24);
      console.log('confirmation received, with number and %: ', component.confirmationProgress, component.confirmationPercent);
      component.transactionConfirmed = true;
    }
    if (nameChange == true) {
      estimatedGas = await this.web3_eth_contract.estimateGas.voteAndSetName(vote, this.address, this.name);
    } else {
      estimatedGas = await this.web3_eth_contract.estimateGas.vote(vote, this.address);
    }
    console.log("estimatedGas: ", estimatedGas);
    estimatedGas = estimatedGas.add(estimatedGas.div(10));
    this.web3Service.addSigner(this.web3_eth_contract)
      .then((contract) => {
        this.web3_eth_contract = contract;
	if (nameChange == true) {
          return contract.voteAndSetName(vote, this.address, this.name, { gasLimit: estimatedGas });  
        } else {
	  return contract.vote(vote, this.address, { gasLimit: estimatedGas });
        }
      })
      .then((tx) => {
        component.transactionPending = true;
        component.confirmationProgress = 0;
        component.confirmationPercent = 0;
        component.transactionHashes.push(tx.hash);
        console.log('transactionHash received: ', tx.hash);
        this.web3Service.addEventListener("block", updateUIOnBlock);
        return tx.wait(24).then((receipt) => {
          this.web3Service.removeEventListener("block", updateUIOnBlock);
        });
      })
      .catch((error) => {
        console.log('oops: ', error);
        console.error;
        this.showErrorMessageForVote = true;
        this.errorDuringVote = error;
      }); // If there's an out of gas error, maybe the second parameter is the receipt.
  }

  async cakeVote(vote) {
    let canVote = true;
    let addressIsValid = true;
    let component = this;

    // Check address
    try {
      this.address = this.web3Service.getChecksumAddress(this.address);
      this.showErrorMessageForAddress = false;
    } catch(e) {
      canVote = false;
      addressIsValid = false;
      this.showErrorMessageForAddress = true;
      this.name = e.message;
      console.error('invalid ethereum address', e.message);
    }

    // Check account
    this.account = await this.web3Service.getSignerAddress();
    console.log("Vote by this account: " + this.account);
    if (this.account == undefined) {
      canVote = false;
    }

    console.log("Check amount");
    if (this.amount < this.distributionAmount / 10) {
      canVote = false;
      this.showErrorMessageForAmount = true;
    } else {
      this.showErrorMessageForAmount = false;
    }

    console.log("Check balance");
    if (this.amount >= component.accountBalance) {
      canVote = false;
      this.showErrorMessageForBalance = true;
    } else {
      this.showErrorMessageForBalance = false;
    }
    const weiAmount = this
      .web3Service
      .parseUnits(this.amount.toString(), "ether");
    console.log("Stake (in wei): ", weiAmount);

    // Vote if everything is fine
    if (canVote == true) {
      console.log("Vote by: " + this.account);
      this.sendVote(vote, weiAmount);
    }
  }

  onClickMeT() {
    this.cakeVote(true);
  }

  onClickMeF() {
    this.cakeVote(false);
  }

  getAddress(): void {
    this.address = this.route.snapshot.paramMap.get('address');
  }

  /* async watchAccount() {
    let component = this;
    this
      .web3Service
      .accountsObservable
      .subscribe((accounts) => {
        component.account = accounts[0];
        component.accountBalance = this.web3Service.getBalance(this.account);
      });
  } */
  
  public onCurrencyChange(event): void {  // event will give you full breif of action
    this.web3Service.currency = event.target.value;
  }

  public onAmountChange(event): void {
    this.showErrorMessageForAmount = false;
    this.showErrorMessageForBalance = false;
  }

  public convertToFiat(amount) {
    return this
      .web3Service
      .convertToFiat(amount);
  }
  
  public currency() {
    return this.web3Service.currency;
  }

}
