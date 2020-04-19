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
  revolutionBlockchain: String = "";
  culottes: any;
  account: any;
  web3Status: String = "Status of connection to your blockchain accounts";
  citizens: Array<ICitizen> = [];
  fullAddressShown: boolean = false;
  web3ModalActivity: String = "";
  lockModalActivity: String = "";
  otherRevolutions = {};
  contractEvents: any;
  factoryAddress: string;

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
    let revolutionContract = await this
      .web3Service
      .artifactsToContract(
        revolutionContractABI,
        this.revolutionAddress
      );
    this.revolutionBlockchain = this
      .web3Service
      .revolutionBlockchain;
    this.criteria = await revolutionContract
      .methods
      .criteria()
      .call();
    console.log("criteria: ", this.criteria);
    this.hashtag = await revolutionContract
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
    this.lockModalActivity = await revolutionContract
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
    this.bastilleBalance = await revolutionContract
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
    this.distributionAmount = await revolutionContract
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
    this.distributionBlockPeriod = await revolutionContract
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
    let i = 0;
    let address = "";
    let citizen: ICitizen;
    while (address != null) {
      address = await revolutionContract
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
      // console.log("read citizen: ", address);
      if (address != "" && address != null) {
        citizen = await revolutionContract
          .methods
          .trialStatus(address)
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
            return {
              address: address,
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
    this.contractEvents = await revolutionContract
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
    console.log("reading factory address");
    this.factoryAddress = await revolutionContract
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
        this.otherRevolutions[otherRevolution] = revolutionHashtag;
	revolutionIndex += 1;
      }
    } while (revolutionHashtag != null);
    console.log('hashtags: ', this.otherRevolutions);
    await this.web3Service.updateWeb3Status(revolutionContractABI, this.revolutionAddress);
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
  
}
