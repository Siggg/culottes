import { Component, OnInit } from "@angular/core";
import { Web3Service } from "../util/web3.service";

declare let require: any;
const contractABI = require("../../../build/contracts/Revolution.json");

@Component({
  selector: "app-revolution",
  templateUrl: "./revolution.component.html",
  styleUrls: ["./revolution.component.css"]
})
export class RevolutionComponent implements OnInit {
  title: String = "Your revolution";
  criteria: String = "default criteria from revolution.component.ts";
  bastilleBalance: String = "42";
  revolutionAddress: String = "0x0000000...";
  culottes: any;
  account: any;
  web3Status: String = "Status of connection to your blockchain accounts";

  constructor(private web3Service: Web3Service) {}

  async ngOnInit() {
    console.log("OnInit: " + this.web3Service);
    console.log(this);
    this.watchAccount();
    let web3_eth_contract = await this.web3Service.artifactsToContract(
      contractABI
    );
    this.criteria = await web3_eth_contract.methods.criteria().call();
    this.revolutionAddress = this.web3Service.revolutionAddress;
    this.bastilleBalance = await web3_eth_contract.methods.bastilleBalance()
      .call();
      /*
      .then( (result) => {
        if (result === null) {
          this.web3Service.web3Status.next("The balance of this bastille is null !");
          this.bastilleBalance = "0";
          return "0";
        } else {
          this.web3Service.web3Status.next("bastilleBalance ready.");
        }
      })
      .catch( (error) => {
        this.web3Service.web3Status.next("An error occured while reading bastilleBalance: " + error);
      });*/
  }

  async watchAccount() {
  
      this.web3Service.web3Status.subscribe(status => { this.web3Status = status; });
    this.web3Service.accountsObservable.subscribe(accounts => {
      this.account = accounts[0];
    });
  }
}
