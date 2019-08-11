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

	address: String = "default address from donate.component.ts";
	criteria: String = "default criteria from donate.component.ts"
	culottes: any;
	account: any;
	accounth: any;
	amount;
	isOk = false;
	web3_eth_contract: any;

	constructor(
	  private web3Service: Web3Service,
	  private route: ActivatedRoute,)
	{
	}

	async ngOnInit() {
	  this.address = this.web3Service.revolutionAddress;
		this.watchAccount();
		this
	  	.web3Service
	  	.artifactsToContract(contractABI)
			.then((web3_eth_contract) => {
				this.web3_eth_contract = web3_eth_contract;
				return web3_eth_contract
				  .methods
				  .criteria()
				  .call();
			})
			.then((criteria) => {
				console.log("criteria: ", criteria);
			});
	}

	async onClickMe() {
		if (!this.amount)
			this.isOk=true;
		else {
			this.isOk=false;
			console.log("amount to be donated:" + this.amount);
			var wei = this.web3Service.etherToWei(this.amount.toString());
			if (this.account == undefined) {
			  // Maybe metamask has not been enabled yet 
        try {
          // Request account access if needed
          await window
            .ethereum
            .enable()
            .then(() =>  {
              window
                .web3
                .eth
                .getAccounts((err, accs) => {
				          this.account = accs[0];
			            console.log("Accounts refreshed: " + this.account);
                  this
                    .web3Service
                    .sendTransaction({from: this.account, to: this.address, value: wei});
			          });
			    });
        } catch (error) {
          console.log('Metamask not enabled');
        }
      } else {
			  console.log("donated from: " + this.account);
			  this
			    .web3Service
			    .sendTransaction({from: this.account, to: this.address, value: wei});
			}
		}
	}
	
	async watchAccount() {
		this
		  .web3Service
		  .accountsObservable
		  .subscribe((accounts) => {
			  this.account = accounts[0];
		});
	}
	
 showPrice() {
    this.web3Service.getPrice()
    .subscribe((price) => {
      if (price != undefined && this.amount != "") {
        let bbif: number = +this.amount * +price.body[this.currency.toString()];
        this.amountInFiat = bbif.toFixed(2).toString();
        /* this
          .web3Service
          .web3Status
          .next(price.body[this.currency.toString()].toString()); */
      }
    });
  }
  
  public onChange(event): void {  // event will give you full breif of action
    this.web3Service.currency = event.target.value;
    this.showPrice();
    /*this
      .web3Service
      .web3Status
      .next(event.target.value.toString()); */
  }
  
}
