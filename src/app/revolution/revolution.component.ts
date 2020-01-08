import { Component, OnInit } from "@angular/core";
import { Web3Service } from "../util/web3.service";
import { Router, ActivatedRoute } from '@angular/router';

declare let require: any;
const contractABI = require("../../../build/contracts/Revolution.json");

interface ICitizen {
   address: string;
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
    let web3_eth_contract = await this
      .web3Service
      .artifactsToContract(
        contractABI
      );
    this.revolutionAddress = this
      .web3Service
      .revolutionAddress;
    this.revolutionBlockchain = this
      .web3Service
      .revolutionBlockchain;
    this.criteria = await web3_eth_contract
      .methods
      .criteria()
      .call();
    this.hashtag = await web3_eth_contract
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
    this.lockModalActivity = await web3_eth_contract
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
    this.bastilleBalance = await web3_eth_contract
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
    this.distributionAmount = await web3_eth_contract
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
    this.distributionBlockPeriod = await web3_eth_contract
      .methods
      .distributionBlockPeriod
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
      address = await web3_eth_contract
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
      if (address != "" && address != null) {
        citizen = await web3_eth_contract
          .methods
          .trialStatus(address)
          .call()
          .then( (result) => {
            return {
              address: address,
              opened: result[0],
              matchesCriteria: result[1],
              sansculotteScale: result[2],
              privilegedScale: result[3]
            };
          })
          .catch( (error) => {
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
    this.web3Service.revolutionAddress = event.target.value;
    this.router.navigateByUrl('/revolution/' + event.target.value)
      .then( nav => {
        console.log("redirect succeeded: ", nav);
      }, err => {
	console.log("redirect failed: ", err);
      });
    window.location.reload();
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
