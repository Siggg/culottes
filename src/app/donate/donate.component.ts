import { Component, OnInit } from '@angular/core';
import {Web3Service} from '../util/web3.service';
import { ActivatedRoute } from '@angular/router';

declare let require:any;
const culotteABI = require('../../../build/contracts/Culotte.json');

@Component({
  selector: 'app-donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.css']
})
export class DonateComponent implements OnInit {

	address: String = "0xe638ef3a6CdD6213c8df966e5a7aCcec2Ab3A50b";
	purpose: String = "A frequent contributor to Open Source Projects"
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
    this.web3Service.artifactsToContract(culotteABI)
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
		this.web3_eth_contract.sendTransaction({from: this.account, to: 0xe638ef3a6CdD6213c8df966e5a7aCcec2Ab3A50b, value: this.amount});
		//this.web3_eth_contract.send({from: this.account, value:this.amount});
	}
}

async watchAccount() {
  this.web3Service.accountsObservable.subscribe((accounts) => {
    this.account = accounts[0];
  });
}
}
