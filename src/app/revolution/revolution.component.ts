import { Component, OnInit } from "@angular/core";
import { Web3Service } from "../util/web3.service";
import { Router, ActivatedRoute } from '@angular/router';

declare let require: any;
const revolutionContractABI = require("../../../build/contracts/Revolution.json");
const factoryContractABI = require('../../../build/contracts/RevolutionFactory.json');

interface ICitizen {
   address: string;
   name: string;
   opened: boolean;
   matchesCriteria: boolean;
   sansculotteScale: number;
   privilegedScale: number
}

@Component({
  selector: "app-revolution",
  templateUrl: "./revolution.component.html",
  styleUrls: ["./revolution.component.css"]
})
export class RevolutionComponent implements OnInit {
  title: String = "<loading title>";
  criteria: String = "<loading criteria>";
  hashtag: String = "<loading hashtag>";
  hashtagWithoutSymbol: String = "<loading hashtag>";
  bastilleBalance: String = "?";
  distributionAmount: number = 0;
  distributionBlockPeriod: number = 0;
  distributionPeriod: number = 0;
  distributionPeriodUnit: String = "?";
  revolutionAddress: String = "0x0000000...";
  revolutionContract
  revolutionBlockchain: String = "";
  culottes: any;
  account: any;
  revolutionOwner: any;
  factoryOwner: any;
  web3Status: String = "Status of connection to your blockchain accounts";
  citizens: Array<ICitizen> = [];
  fullAddressShown: boolean = false;
  web3ModalActivity: String = "";
  lockModalActivity: String = "";
  otherRevolutions = {};
  contractEvents: any;
  factoryAddress: string;
  canLockRevolution: boolean = false;

  constructor(
    private web3Service: Web3Service,
    private route: ActivatedRoute,
    private router: Router) {}

  async ngOnInit() {
    // console.log("OnInit: " + this.web3Service);
    // console.log(this);
    this.getAddress();
    this.otherRevolutions = this.web3Service.revolutions;
    this.watchAccount();
    this.revolutionAddress = this
      .web3Service
      .revolutionAddress;
    this.revolutionContract = await this
      .web3Service
      .artifactsToContract(
        revolutionContractABI,
        this.revolutionAddress
      );
    this.revolutionBlockchain = this
      .web3Service
      .revolutionBlockchain;
    this.criteria = await this.revolutionContract
      .methods
      .criteria()
      .call();
    console.log("criteria: ", this.criteria);
    this.hashtag = await this.revolutionContract
      .methods
      .hashtag()
      .call()
      .then( (hashtag) => {
        if (hashtag == null || hashtag.length == 0) {
          hashtag = "#CulottesRevolution";
          this.hashtagWithoutSymbol = "CulottesRevolution";
        } else if (hashtag[0] != '#') {
            this.hashtagWithoutSymbol = hashtag;
            hashtag = '#' + hashtag;
        } else {
            this.hashtagWithoutSymbol = hashtag.substring(1);
        }
        return hashtag;
    });
    this.lockModalActivity = await this.revolutionContract
      .methods
      .locked()
      .call()
      .then( (locked) => {
        if (locked == true) {
          return "active";
        } else  {
          return "";
        }
      });
    this.bastilleBalance = await this.revolutionContract
      .methods
      .bastilleBalance()
      .call()
      .then( (result) => {
        if (result === null) {
          this
            .web3Service
            .web3Status
            .next("The balance of this bastille is null !");
          this
            .web3Service
            .checkNetwork();
        } else {
          this
            .web3Service
            .web3Status
            .next("Revolution ready.");
          this
            .web3Service
            .statusError = false;
          return this
            .web3Service
            .weiToEther(result);
        }
      })
      .catch( (error) => {
        this
          .web3Service
          .web3Status
          .next("An error occured while reading bastille balance: " + error);
      });
    this.distributionAmount = await this.revolutionContract
      .methods
      .distributionAmount()
      .call()
      .then( (result) => {
	      if (result === null) {
    	  /* this
          .web3Service
          .web3Status
          .next("distributionAmount at this bastille is null!");*/
	        this
	          .web3Service
	          .statusError = true;
	      } else {
	        return this
            .web3Service
	          .weiToEther(result);
	      }
      });
    this.distributionBlockPeriod = await this.revolutionContract
      .methods
      .distributionBlockPeriod()
      .call()
      .then( (blocks) => {
        // Convert distribution period from number of blocks to time units
        var seconds = blocks * 15; // about 15 seconds per block
        if (seconds < 60) {
          this.distributionPeriodUnit = "seconds";
          this.distributionPeriod = seconds;
        } else if (seconds < 3600) {
          this.distributionPeriodUnit = "minutes";
          this.distributionPeriod = seconds / 60;
        } else if (seconds < 3600 * 24) {
          this.distributionPeriodUnit = "hours";
          this.distributionPeriod = seconds / 3600;
        } else if (seconds < 3600 * 24 * 7) {
          this.distributionPeriodUnit = "days";
          this.distributionPeriod = seconds / 3600 / 24;
        } else if (seconds < 3600 * 24 * 30) {
          this.distributionPeriodUnit = "weeks";
          this.distributionPeriod = seconds / 3600 / 24 / 7;
        } else if (seconds < 3600 * 24 * 365) {
          this.distributionPeriodUnit = "months";
          this.distributionPeriod = seconds / 3600 / 24 / 30.5;
        } else {
          this.distributionPeriodUnit = "years";
          this.distributionPeriod = seconds / 3600 / 24 / 365.25;
        }
      return blocks;
    });
    this.revolutionOwner = await this.revolutionContract
      .methods
      .owner()
      .call();
    console.log("Revolution owner: ", this.revolutionOwner);
    console.log("Getting other revolutions from this factory");
    this.factoryAddress = await this.revolutionContract
      .methods
      .factory()
      .call();
    if (this.factoryAddress == null) {
      console.log("factoryAddress is null !");
      // TODO : figure out a way for web3 to work properly in e2e protractor tests
      this.factoryAddress = "0x598Bbb5819E8349Eb4D06D4f5aF149444aD8a11D";
    }
    console.log("factoryAddress: ", this.factoryAddress);
    let factoryContract = await this
      .web3Service
      .artifactsToContract(
        factoryContractABI,
        this.factoryAddress
      );
    console.log("Got factoryContract");
    this.factoryOwner = await factoryContract
      .methods
      .owner()
      .call();
    console.log("Factory owner: ", this.factoryOwner);
    let revolutionIndex = 0;
    let revolutionHashtag = "";
    let otherRevolution;
    do {
      revolutionHashtag = await factoryContract
        .methods
        .hashtags(revolutionIndex)
        .call();
      console.log('revolutionHashTag: ', revolutionHashtag);
      if (revolutionHashtag != null) {
        otherRevolution = await factoryContract
          .methods
          .getRevolution(revolutionHashtag)
          .call();
        console.log('  with revolution: ', otherRevolution);
      let otherRevolutionContract = await this
        .web3Service
        .artifactsToContract(
          revolutionContractABI,
          otherRevolution
        );
      let otherLocked = await otherRevolutionContract
          .methods
          .locked()
          .call();
        console.log('  is locked ? ', otherLocked);
        let otherBalance = await otherRevolutionContract
          .methods
          .bastilleBalance()
          .call();
        console.log('  with empty bastille balance? ', otherBalance.isZero());
        if (otherLocked != true || otherBalance.isZero() == false) {
          this.otherRevolutions[otherRevolution] = revolutionHashtag;
        }
        revolutionIndex += 1;
      }
    } while (revolutionHashtag != null);
    console.log('hashtags: ', this.otherRevolutions);
    await this.web3Service.updateWeb3Status(revolutionContractABI, this.revolutionAddress);

    console.log("Getting citzens");
    let i = 0;
    let citizenAddress = "";
    let citizen: ICitizen;
    while (citizenAddress != null) {
      citizenAddress = await this.revolutionContract
        .methods
        .citizens(i)
        .call()
        .then( (result) => {
          return result;
        })
        .catch( (error) => {
          this
            .web3Service
            .web3Status
            .next("An error occured while reading citizen " + i.toString() + " : " + error);
          return ""
      });
      // console.log("read citizen: ", citizenAddress);
      if (citizenAddress != "" && citizenAddress != null) {
        citizen = await this.revolutionContract
          .methods
          .trialStatus(citizenAddress)
          .call()
          .then( (result) => {
	    // console.log("citizen result: ", result);
            let name;
	    try {
              name = result[4];
	    } catch(e) {
	      name = undefined;
              console.log("Could read name from contract: ", e);
            }
	    if (citizenAddress in this.otherRevolutions) {
              name = this.otherRevolutions[citizenAddress];
	    }
            return {
              address: citizenAddress,
              opened: result[0],
              matchesCriteria: result[1],
              sansculotteScale: result[2],
              privilegedScale: result[3],
              name: name
            };
          })
          .catch( (error) => {
            console.log("error: ", error);
            this
              .web3Service
              .web3Status
              .next("An error occured while reading trialStatus of citizen #" + i.toString() + " : " + error);
          });
        if (citizen != undefined) {
          this.citizens.push(citizen);
        }
      }
      i += 1;
    }
    // this.web3Service.web3Status.next("Here are the citizens known at this bastille : " + this.citizens.toString());
    this.contractEvents = await this.revolutionContract
      .getPastEvents("allEvents", { fromBlock: 0, toBlock: "latest" })
      .then( (events) => {
        // console.log("All events: ", events);
        return events;
      })
      .catch( (error) => {
        console.error(error);
        this
          .web3Service
          .web3Status
          .next("An error occured while reading past events: " + error);
      });
      console.log("#2 account, revolutionOwner, factoryOwner: ", this.account, this.revolutionOwner, this.factoryOwner);
      if (this.account != undefined) {
        if (this.revolutionOwner == this.account || this.factoryOwner == this.account) {
          this.canLockRevolution = true;
        } else {
          this.canLockRevolution = false;
        }
      } else {
        this.canLockRevolution = false;
      }
  }

  async watchAccount() {
    this
      .web3Service
      .web3Status
      .subscribe(status => {
        this.web3Status = status;
        if (this.web3Service.statusError) {
          this.web3ModalActivity = "active";
        } else {
          this.web3ModalActivity = "";
        }
      });
    this
      .web3Service
      .accountsObservable
      .subscribe(accounts => {
        this.account = accounts[0];
        if (this.web3Service.statusError) {
          this.web3ModalActivity = "active";
        } else {
          this.web3ModalActivity = "";
        }
        console.log("account, revolutionOwner, factoryOwner: ", this.account, this.revolutionOwner, this.factoryOwner);
        if (this.account != undefined) {
          if (this.revolutionOwner == this.account || this.factoryOwner == this.account) {
            this.canLockRevolution = true;
          } else {
            this.canLockRevolution = false;
          }
        } else {
          this.canLockRevolution = false;
        }
      });
  }
  
  public onCurrencyChange(event): void {  // event will give you full breif of action
    this.web3Service.currency = event.target.value;
  }
  
  public convertToFiat(amount) {
    return this
      .web3Service
      .convertToFiat(amount);
  }
  
  public currency() {
    return this.web3Service.currency;
  }
  
  public dappStatus() {
    return this.web3Service.dappStatus();
  }
  
  public onRevolutionChange(event): void {  // event will give you full brief of action
    if (event.target.value == "menu") {
      return;
    } else {
      console.log("redirect to: /revolution/" + event.target.value);
      this.router.navigateByUrl('/revolution/' + event.target.value)
        .then( nav => {
          console.log("redirect succeeded: ", nav);
          this.ngOnInit();
          window.location.reload();
        }, err => {
	  console.log("redirect failed: ", err);
        });
    }
  }

  onCloseLockModal(): void {
    console.log("Closing lock modal");
    this.lockModalActivity = "";
  }
  
  getAddress(): void { 
    var ra = "";
    ra = this.route.snapshot.paramMap.get('address');
    if (ra != "" && ra != null) {
      this.revolutionAddress = ra;
      this.web3Service.revolutionAddress = ra;
    }
  }
  
  lockRevolution(): void {
    console.log("Trying to lock revolution");
    this.revolutionContract
      .methods
      .lock()
      .send({from: this.account, value: 0, gas: 1000000})
      .on('transactionHash', function(hash) {
        /* component.transactionPending = true;
        component.confirmationProgress = 0;
        component.confirmationPercent = 0;
        component.transactionHashes.push(hash); */
        console.log('lock transactionHash received');
      })
      .on('confirmation', function(confirmationNumber, receipt) {
        /* component.transactionPending = true;
        component.confirmationProgress += 1; //confirmationNumber; // up to 24
        component.confirmationPercent = Math.round(100 * component.confirmationProgress / 24); */
        console.log('lock confirmation received, with number: ', confirmationNumber); // , component.confirmationPercent);
      })
      .on('receipt', function(receipt){
        // receipt example
        console.log('vote receipt received: ', receipt);
        /* component.transactionPending = false;
        component.transactionConfirmed = true; */
      })
      .on('error', function(error, receipt){
	console.log("lock error with receipt: ", receipt);
        console.error;
        /* this.showErrorMessageForVote = true;
        this.errorDuringVote = error; */
      }); // If there's an out of gas error the second parameter is the receipt.
    console.log("Tried locking revolution");
  }
  
}
