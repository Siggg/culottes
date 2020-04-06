import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Web3Service } from '../util/web3.service';
import { Router, ActivatedRoute } from '@angular/router';

declare let require: any;
declare let window: any;
const revolutionContractABI = require('../../../build/contracts/Revolution.json');
const factoryContractABI = require('../../../build/contracts/RevolutionFactory.json');

@Component({
  selector: 'app-citizen',
  templateUrl: './factory.component.html',
  styleUrls: ['./factory.component.css']
})
export class FactoryComponent implements OnInit {

        criteria: String;
        distributionAmount: number;
        showErrorMessageForCriteria: boolean = false;
        showErrorMessageForHashtag: boolean = false;
        showErrorMessageForPeriod: boolean = false;
        showErrorMessageForAmount: boolean = false;
        showErrorMessageForCreation: boolean = false;
        transactionPending = false;
        transactionConfirmed = false;
        hashtag: String;
        distributionBlockPeriod: number;
        revolutionContract: any;
	factoryContract: any;
	account: any;
        confirmationProgress: number = 0;
        confirmationPercent: number = 0;
	transactionHashes = [];
	errorDuringCreation: String = "";
	hashtagWithoutSymbol: String = "CulottesRevolution";

	address: String = "0x";
	name: String = "";
	revolutionAddress: String = "0x0000...";
	revolutionBlockchain: String = "";
	factoryAddress: String;
	// culottes: any;
	// accountBalance: number = undefined;

  constructor(
    private web3Service: Web3Service,
    private route: ActivatedRoute,
    private router: Router) {

  }


  async ngOnInit() {
    this.getParams();
    this.watchAccount();
    this.revolutionAddress = this
      .web3Service
      .revolutionAddress;
    this.web3Service
      .artifactsToContract(revolutionContractABI, this.revolutionAddress)
      .then((revolutionContract) => {
        this.revolutionContract = revolutionContract;
	
	// Get revolution's criteria
        return this.revolutionContract
          .methods
          .criteria()
          .call();
      })
      .then((criteria) => {
        console.log("criteria: ", criteria);
        this.criteria = criteria;

	// Get revolution's distributionAmout
        return this.revolutionContract
          .methods
          .distributionAmount()
          .call();
      })
      .then( (distributionAmount) => {
        if (distributionAmount === null) {
          this
            .web3Service
            .web3Status
            .next("distributionAmount at this revolution is null!");
          this
            .web3Service
            .statusError = true;
        } else {
          this.distributionAmount = this
            .web3Service
            .weiToEther(distributionAmount);
        }

	// Get revolution's distributionBlockPeriod
        return this.revolutionContract
          .methods
          .distributionBlockPeriod()
          .call();
      })
      .then( (distributionBlockPeriod) => {
        if (distributionBlockPeriod === null) {
          this
            .web3Service
            .web3Status
            .next("distributionBlockPeriod at this revolution is null!");
          this
            .web3Service
            .statusError = true;
        } else {
          this.distributionBlockPeriod = distributionBlockPeriod;
        }

        // Get revolution's hashtag
        return this.revolutionContract
          .methods
          .hashtag()
          .call();
      })
      .then((hashtag) => {
        this.hashtag = hashtag;
        console.log("hashtag: ", hashtag);
        if (hashtag != null && hashtag.length>0) {
          this.hashtagWithoutSymbol = hashtag.substring(1);
        } else {
          this.hashtagWithoutSymbol = "CulottesRevolution";
        }

	return this.revolutionContract
	  .methods
	  .factory()
	  .call();
      })
      .then((factoryAddress) => {
        this.factoryAddress = factoryAddress;
        console.log("factory address: ", factoryAddress);
        return factoryAddress;
      })
      .then((factoryAddress) => {
        this.web3Service
          .artifactsToContract(factoryContractABI, this.factoryAddress)
          .then((factoryContract) => {
            this.factoryContract = factoryContract;
            console.log("Factory contract: ", factoryContract);
          });
      });
    this.revolutionBlockchain = this
      .web3Service
      .revolutionBlockchain;
  } 

  async onRevolutionCreate() {
    let canCreate = true;
    if (this.criteria == undefined || this.criteria.length == 0) {
      this.showErrorMessageForCriteria = true;
      canCreate = false;
    } else {
      this.showErrorMessageForCriteria = false;
    }
    if (this.hashtag == undefined || this.hashtag.length < 2) {
      this.showErrorMessageForHashtag = true;
      canCreate = false;
    } else if (this.hashtag[0] != '#') {
      this.showErrorMessageForHashtag = true;
      canCreate = false;
    } else {
      this.showErrorMessageForHashtag = false;
    }
    if (this.distributionBlockPeriod == undefined || this.distributionBlockPeriod < 1 || Math.floor(this.distributionBlockPeriod) != this.distributionBlockPeriod) {
      this.showErrorMessageForPeriod = true;
      canCreate = false;
    } else {
      this.showErrorMessageForPeriod = false;
    }
    if (this.distributionAmount == undefined || this.distributionAmount <= 0) {
      this.showErrorMessageForAmount = true;
      canCreate = false;
    } else {
      this.showErrorMessageForAmount = false;
    }

    // Check account
    if (this.account == undefined) {
      // Maybe metamask has not been enabled yet
      try {
        // Request account access if needed
        await window.ethereum.enable().then(() =>  {
          window.web3.eth.getAccounts((err, accs) => {
            this.account = accs[0];
            console.log("Accounts refreshed, creation requested by: " + this.account);
          });
        });
      } catch (error) {
        canCreate = false;
        console.log('Metamask not enabled?');
      }
    }        
    if (this.account == undefined) {
      canCreate = true;
    }

    if (canCreate == true) {
      console.log('about to create revolution');
      let distributionWeiAmount = this.web3Service.etherToWei(this.distributionAmount);
      console.log('  with parameters: ', this.criteria, this.hashtag, this.distributionBlockPeriod.toString(), distributionWeiAmount); 
      let method = this.factoryContract
        .methods
        .createRevolution(this.criteria, this.hashtag, this.distributionBlockPeriod, distributionWeiAmount, false);
      let component = this;
      console.log("this.account:", this.account);
      method.send({from: this.account, gas: 10000000})
        .on('transactionHash', function(hash) {
          component.transactionPending = true;
          component.confirmationProgress = 0;
          component.confirmationPercent = 0;
          component.transactionHashes.push(hash);
          console.log('transactionHash received');
        })
        .on('confirmation', function(confirmationNumber, receipt) {
          component.transactionPending = true;
          component.confirmationProgress += 1; //confirmationNumber; // up to 24
          component.confirmationPercent = Math.round(100 * component.confirmationProgress / 24);
          console.log('confirmation received, with number and %: ', confirmationNumber, component.confirmationPercent);
        })
        .on('receipt', function(receipt){
          // receipt example
          console.log('receipt received: ', receipt);
          component.transactionPending = false;
          component.transactionConfirmed = true;
        })
        .on('error', function(error, receipt){
          console.error;
          this.showErrorMessageForCreation = true;
          this.errorDuringCreation = error;
        }); // If there's an out of gas error the second parameter is the receipt.
    }
  }

  getParams(): void {
    this.criteria = this.route.snapshot.paramMap.get('criteria');
    this.hashtag = this.route.snapshot.paramMap.get('hashtag');
    this.distributionBlockPeriod = parseInt(this.route.snapshot.paramMap.get('distributionBlockPeriod'));
    this.distributionAmount = parseFloat(this.route.snapshot.paramMap.get('distributionAmount'));
  }

  async watchAccount() {
    let component = this;
    this
      .web3Service
      .accountsObservable
      .subscribe((accounts) => {
        component.account = accounts[0];
        /* window.web3.eth.getBalance(this.account, (err, balance) => {
          component.accountBalance = window.web3.utils.fromWei(balance, 'ether');
        }); */
      });
  }
  
  public onCurrencyChange(event): void {  // event will give you full breif of action
    this.web3Service.currency = event.target.value;
  }

  public onAmountChange(event): void {
    this.showErrorMessageForAmount = false;
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
