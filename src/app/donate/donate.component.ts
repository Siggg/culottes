import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../util/web3.service';
import { ActivatedRoute } from '@angular/router';

declare let require: any;
declare let window: any;
const contractABI = require('../../../build/contracts/Revolution.json');

@Component({
	selector: 'app-donate',
	templateUrl: './donate.component.html',
	styleUrls: ['./donate.component.css']
})
export class DonateComponent implements OnInit {

	revolutionAddress: String = "default address from donate.component.ts";
	revolutionBlockchain: String = "";
	criteria: String = "default criteria from donate.component.ts"
	culottes: any;
	account: any;
	amount;
	isOk = false;
	web3_eth_contract: any;

	constructor(
	  private web3Service: Web3Service,
	  private route: ActivatedRoute,)
	{
	}

	async ngOnInit() {
	  this.revolutionAddress = this.web3Service.revolutionAddress;
	  this.revolutionBlockchain = this.web3Service.revolutionBlockchain;
          this
            .web3Service
            .artifactsToContract(contractABI, this.revolutionAddress)
            .then((web3_eth_contract) => {
              this.web3_eth_contract = web3_eth_contract;
              return web3_eth_contract.criteria();
              })
            .then((criteria) => {
              console.log("criteria: ", criteria);
            });
	}

  async onClickMe() {
    if (!this.amount) {
      this.isOk=true;
    } else {
      this.isOk=false;
      console.log("amount to be donated:" + this.amount);
      var wei = this.web3Service.parseUnits(this.amount.toString(), "wei");
      this.account = await this.web3Service.getAccount().then((account) => { return account.getAddress(); });
      console.log("donated from: " + this.account);
      this
        .web3Service
        .sendTransaction({from: this.account, to: this.revolutionAddress, value: wei, gas: 60000});
    }
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

}
