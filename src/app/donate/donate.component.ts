import { Component, OnInit } from '@angular/core';
import {Web3Service} from '../util/web3.service';
import { ActivatedRoute } from '@angular/router';

declare let require:any;
const contractABI = require('../../../build/contracts/Revolution.json');

@Component({
  selector: 'app-donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.css']
})
export class DonateComponent implements OnInit {

	address: String = "0xf26110452429f39eD677F111E65bf0c1825705A4";
	criteria: String = "A frequent contributor to Open Source Projects"
	culottes: any;
	account: any;
	accounth: any;
	amount;
	isOk = false;
	web3_eth_contract: any;

  constructor(private web3Service: Web3Service, private route: ActivatedRoute,) {
  }

async ngOnInit() {

	this.watchAccount();
    this.web3Service.artifactsToContract(contractABI)
      .then((web3_eth_contract) => {
		  	this.web3_eth_contract = web3_eth_contract;
			return web3_eth_contract.methods.criteria().call();
        })
      .then((criteria) => {
        console.log("criteria: ", criteria);
        });
}


onClickMe() {
	if (!this.amount)
		this.isOk=true;
	else {
		this.isOk=false;
		console.log(this.amount)
		this.web3_eth_contract.util.toWei(this.amount, 'ether');
		this.web3_eth_contract.sendTransaction({from: this.account, to: 0xf26110452429f39eD677F111E65bf0c1825705A4, value: this.amount});
		//this.web3_eth_contract.send({from: this.account, value:this.amount});
	}
}

async watchAccount() {
  this.web3Service.accountsObservable.subscribe((accounts) => {
    this.account = accounts[0];
  });
}
}
