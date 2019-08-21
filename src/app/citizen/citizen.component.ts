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
	revolutionAddress: String = "0x0000...";
	revolutionBlockchain: String = "";
	criteria: String = "default criteria from citizen.component.ts"
	culottes: any;
	account: any;
	accounth: any;
	amount;
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
    this.revolutionAddress = this
      .web3Service
      .revolutionAddress;
    this.revolutionBlockchain = this
      .web3Service
      .revolutionBlockchain;
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
              this.web3_eth_contract.methods.vote(vote, this.address).send({from: this.account, value: weiAmount, gas: 1000000});
            });
          });
        } catch (error) {
          console.log('Metamask not enabled');
        }
      } else {
        console.log("Vote by: " + this.account);
        this.web3_eth_contract.methods.vote(vote, this.address).send({from: this.account, value: weiAmount, gas: 1000000});
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
  
  public onChange(event): void {  // event will give you full breif of action
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
