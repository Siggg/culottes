import { Component, OnInit } from '@angular/core';
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
	criteria: String = "default criteria from citizen.component.ts"
	culottes: any;
	account: any;
	accounth: any;
	amount;
	amountInFiat;
	isOk = false;
	web3_eth_contract: any;

  constructor(
    private web3Service: Web3Service,
    private route: ActivatedRoute,
    private router: Router) {
  }

  async ngOnInit() {
	  this.getAddress();
	  this.watchAccount();
      this.web3Service.artifactsToContract(contractABI)
      .then((web3_eth_contract) => {
		  	this.web3_eth_contract = web3_eth_contract;
			return web3_eth_contract.methods.criteria().call();
        })
      .then((criteria) => {
        console.log("criteria: ", criteria);
        this.criteria = criteria;
        });
  }

  async cakeVote(vote) {
    if (!this.amount)
      this.isOk=true;
    else {
      this.isOk=false;
      const weiAmount = this.web3Service.etherToWei(this.amount.toString());
      console.log("Stake (in wei): " + weiAmount.toString());
      if (this.account == undefined) {
        // Maybe metamask has not been enabled yet
        try {
          // Request account access if needed
          await window.ethereum.enable().then(() =>  {
            window.web3.eth.getAccounts((err, accs) => {
              this.account = accs[0];
              console.log("Accounts refreshed: " + this.account);
              this.web3_eth_contract.methods.vote(vote, this.address).send({from: this.account, value: weiAmount});
            });
          });
        } catch (error) {
          console.log('Metamask not enabled');
        }
      } else {
        console.log("Vote by: " + this.account);
        this.web3_eth_contract.methods.vote(vote, this.address).send({from: this.account, value: weiAmount});
      }
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

  async watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
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
    this.currency = event.target.value;
    this.showPrice();
    /*this
      .web3Service
      .web3Status
      .next(event.target.value.toString()); */
  }
}
