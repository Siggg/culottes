import { Component, OnInit } from '@angular/core';
import {Web3Service} from '../util/web3.service';
import { ActivatedRoute } from '@angular/router';

declare let require:any;
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
	isOk = false;
	web3_eth_contract: any;

  constructor(private web3Service: Web3Service, private route: ActivatedRoute,) {
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


onClickMeT() {
	if (!this.amount)
		this.isOk=true;
	else {
		this.isOk=false;
		const weiAmount = this.web3Service.etherToWei(this.amount.toString());
		console.log("Stake (in wei): " + weiAmount.toString());
		console.log("Vote by: " + this.account);
		this.web3_eth_contract.methods.vote(true, this.address).send({from: this.account, value: weiAmount});
	}
}

onClickMeF() {
	if (!this.amount)
		this.isOk=true;
	else {
		this.isOk=false;
		const weiAmount = this.web3Service.etherToWei(this.amount.toString());
		console.log("Stake (in wei): " + weiAmount.toString());
		console.log("Vote by: " + this.account);
		this.web3_eth_contract.methods.vote(false, this.address).send({from: this.account, value: weiAmount});
	}
}


getAddress(): void {
	this.address = this.route.snapshot.paramMap.get('address');
  }

async watchAccount() {
  this.web3Service.accountsObservable.subscribe((accounts) => {
    this.account = accounts[0];
  });
}
}
