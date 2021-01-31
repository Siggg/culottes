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
    // this.watchAccount();
    this.revolutionAddress = this
      .web3Service
      .revolutionAddress;
    this.web3Service
      .artifactsToContract(revolutionContractABI, this.revolutionAddress)
      .then((revolutionContract) => {
        this.revolutionContract = revolutionContract;
	
	// Get revolution's criteria
        return this.revolutionContract.criteria();
      })
      .then((criteria) => {
        console.log("criteria: ", criteria);
        this.criteria = criteria;

	// Get revolution's distributionAmout
        return this.revolutionContract.distributionAmount();
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

	// Get revolution's distributionBlockPeriod
        return this.revolutionContract.distributionBlockPeriod();
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
        return this.revolutionContract.hashtag();
      })
      .then((hashtag) => {
        this.hashtag = hashtag;
        console.log("hashtag: ", hashtag);
        if (hashtag != null && hashtag.length>0) {
          this.hashtagWithoutSymbol = hashtag.substring(1);
        } else {
          this.hashtagWithoutSymbol = "CulottesRevolution";
        }

	return this.revolutionContract.factory();
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
            // console.log("Factory contract: ", factoryContract);
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
    this.account = await this.web3Service.getAccount().then((account) => {
	    return account.getAddress(); });
    if (this.account == undefined) {
      canCreate = false;
    }

    if (canCreate == true) {
      console.log('about to create revolution');
      let distributionAmount = this.distributionAmount;
      console.log('  with parameters: ', this.criteria, this.hashtag, this.distributionBlockPeriod.toString(), distributionAmount); 
      // let method = this.factoryContract
      //  .createRevolution(this.criteria, this.hashtag, this.distributionBlockPeriod, distributionAmount, false);
      let component = this;
      console.log("this.account:", this.account);
      this
        .factoryContract
        .estimateGas
        .createRevolution(this.criteria, this.hashtag, this.distributionBlockPeriod, distributionAmount, false)
	   //  ({from: this.account, gas: 3000000})
	.then((gasAmount) => {
          console.log('estimated gas amount: ', gasAmount);
	  let tx = this.factoryContract.populateTransaction.createRevolution(this.criteria, this.hashtag, this.distributionBlockPeriod, distributionAmount, false);
          tx.gasPrice = "2000000000";
          tx.gasLimit = gasAmount + 100000;
	  function updateUIOnBlock(blockNumber) {
            component.transactionPending = false;
            component.confirmationProgress += 1; // up to 24 
            component.confirmationPercent = Math.round(100 * component.confirmationProgress / 24);
            console.log('confirmation received, with number and %: ', component.confirmationProgress, component.confirmationPercent);
            component.transactionConfirmed = true;
          }
          this.web3Service.sendTransaction(tx)
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
              this.showErrorMessageForCreation = true;
              this.errorDuringCreation = error;
            }); // If there's an out of gas error the second parameter is the receipt.
        });
    }
  }

  getParams(): void {
    this.criteria = this.route.snapshot.paramMap.get('criteria');
    this.hashtag = this.route.snapshot.paramMap.get('hashtag');
    this.distributionBlockPeriod = parseInt(this.route.snapshot.paramMap.get('distributionBlockPeriod'));
    this.distributionAmount = parseFloat(this.route.snapshot.paramMap.get('distributionAmount'));
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
